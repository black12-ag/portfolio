import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  EnhancedSearchResult,
  EnhancedSearchSuggestion,
  SearchContext,
  SearchConfig,
  defaultSearchConfig,
  SearchHistoryManager,
  SearchAnalyticsManager,
  SmartSuggestionGenerator,
  SearchCacheManager,
  VoiceSearchManager,
  AutoCorrectManager,
  createDebouncedSearch,
  calculateSimilarity,
} from '@/lib/searchEnhancements';

export interface UseEnhancedSearchOptions {
  context: SearchContext;
  searchFunction?: (query: string) => Promise<EnhancedSearchResult[]> | EnhancedSearchResult[];
  config?: Partial<SearchConfig>;
  onSearch?: (query: string, results: EnhancedSearchResult[]) => void;
  onResultSelect?: (result: EnhancedSearchResult) => void;
  onSuggestionSelect?: (suggestion: EnhancedSearchSuggestion) => void;
  enabled?: boolean;
}

export interface UseEnhancedSearchReturn {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  results: EnhancedSearchResult[];
  suggestions: EnhancedSearchSuggestion[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  error: string | null;
  
  // Navigation state
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  
  // Search functions
  performSearch: (searchQuery: string) => Promise<void>;
  clearSearch: () => void;
  selectResult: (result: EnhancedSearchResult) => void;
  selectSuggestion: (suggestion: EnhancedSearchSuggestion) => void;
  
  // Keyboard handlers
  handleKeyDown: (event: React.KeyboardEvent) => void;
  
  // Voice search
  isVoiceSupported: boolean;
  isListening: boolean;
  startVoiceSearch: () => void;
  stopVoiceSearch: () => void;
  
  // History management
  recentSearches: string[];
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  
  // Analytics
  getSearchAnalytics: () => ReturnType<SearchAnalyticsManager['getAnalytics']>;
  
  // Auto-correct
  getCorrectedQuery: (query: string) => string;
  
  // Utils
  highlightMatch: (text: string, query: string) => string;
  
  // Refs for external use
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export const useEnhancedSearch = (options: UseEnhancedSearchOptions): UseEnhancedSearchReturn => {
  const {
    context,
    searchFunction,
    config: userConfig,
    onSearch,
    onResultSelect,
    onSuggestionSelect,
    enabled = true,
  } = options;

  const config = useMemo(() => ({ ...defaultSearchConfig, ...userConfig }), [userConfig]);
  
  // Core search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EnhancedSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<EnhancedSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Managers
  const historyManager = useRef(new SearchHistoryManager(context));
  const analyticsManager = useRef(new SearchAnalyticsManager());
  const suggestionGenerator = useRef(new SmartSuggestionGenerator(context));
  const cacheManager = useRef(new SearchCacheManager(config.cacheTTL));
  const voiceManager = useRef(new VoiceSearchManager());
  const autoCorrectManager = useRef(new AutoCorrectManager());

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial data
  useEffect(() => {
    if (enabled) {
      setRecentSearches(historyManager.current.getHistory());
    }
  }, [enabled, context]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => createDebouncedSearch(async (searchQuery: string) => {
      if (!enabled || searchQuery.length < config.minQueryLength) return;

      // Check cache first
      if (config.cacheResults) {
        const cached = cacheManager.current.get(searchQuery);
        if (cached) {
          setResults(cached);
          setIsLoading(false);
          return;
        }
      }

      if (!searchFunction) return;

      try {
        setIsLoading(true);
        setError(null);

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const searchResults = await searchFunction(searchQuery);
        const resultsArray = Array.isArray(searchResults) ? searchResults : [];
        
        // Apply result limit
        const limitedResults = resultsArray.slice(0, config.maxResults);
        
        // Cache results
        if (config.cacheResults) {
          cacheManager.current.set(searchQuery, limitedResults);
        }

        setResults(limitedResults);
        
        // Track analytics
        if (config.enableAnalytics) {
          analyticsManager.current.trackSearch({
            query: searchQuery,
            context,
            timestamp: new Date(),
            resultsCount: limitedResults.length,
            source: 'keyboard',
          });
        }

        onSearch?.(searchQuery, limitedResults);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          console.error('Search error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, config.debounceMs),
    [enabled, config, searchFunction, context, onSearch]
  );

  // Generate suggestions when query changes
  useEffect(() => {
    if (!enabled) return;

    const generateSuggestions = () => {
      const correctedQuery = config.enableAutoCorrect 
        ? autoCorrectManager.current.correctQuery(query)
        : query;

      if (correctedQuery.trim()) {
        const newSuggestions = suggestionGenerator.current.generateSuggestions(
          correctedQuery,
          context,
          results
        );
        setSuggestions(newSuggestions.slice(0, config.maxSuggestions));
      } else {
        setSuggestions([]);
      }
    };

    generateSuggestions();
  }, [query, results, context, config, enabled]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!enabled) return;

    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      setIsOpen(true);
      debouncedSearch(searchQuery);
    } else {
      setResults([]);
      setSuggestions([]);
      setIsOpen(config.showRecentSearches && recentSearches.length > 0);
    }
    
    setSelectedIndex(-1);
  }, [enabled, debouncedSearch, config.showRecentSearches, recentSearches.length]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
    setIsOpen(false);
    setSelectedIndex(-1);
    setIsLoading(false);
    inputRef.current?.focus();
  }, []);

  // Select result
  const selectResult = useCallback((result: EnhancedSearchResult) => {
    if (!enabled) return;

    // Add to history
    historyManager.current.addSearch(result.title);
    setRecentSearches(historyManager.current.getHistory());

    // Update popular searches
    suggestionGenerator.current.updatePopularSearches(result.title, true);

    // Track analytics
    if (config.enableAnalytics) {
      analyticsManager.current.trackSearch({
        query,
        context,
        timestamp: new Date(),
        resultsCount: results.length,
        selectedResult: result,
        source: 'keyboard',
      });
    }

    // Execute action or callback
    if (result.action) {
      result.action();
    } else {
      onResultSelect?.(result);
    }

    setIsOpen(false);
    setSelectedIndex(-1);
  }, [enabled, query, context, results.length, config.enableAnalytics, onResultSelect]);

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: EnhancedSearchSuggestion) => {
    if (!enabled) return;

    performSearch(suggestion.text);
    onSuggestionSelect?.(suggestion);
  }, [enabled, performSearch, onSuggestionSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled || !isOpen) {
      if (event.key === 'Enter' && query.trim()) {
        if (results.length > 0) {
          selectResult(results[0]);
        } else if (suggestions.length > 0) {
          selectSuggestion(suggestions[0]);
        }
      }
      return;
    }

    const totalItems = results.length + suggestions.length + (config.showRecentSearches && query.trim() === '' ? recentSearches.length : 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(totalItems, 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length) {
            selectResult(results[selectedIndex]);
          } else if (selectedIndex < results.length + suggestions.length) {
            const suggestionIndex = selectedIndex - results.length;
            selectSuggestion(suggestions[suggestionIndex]);
          } else if (config.showRecentSearches && query.trim() === '') {
            const recentIndex = selectedIndex - results.length - suggestions.length;
            if (recentSearches[recentIndex]) {
              performSearch(recentSearches[recentIndex]);
            }
          }
        } else if (query.trim()) {
          // No selection, perform search with current query
          historyManager.current.addSearch(query);
          setRecentSearches(historyManager.current.getHistory());
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        if (suggestions.length > 0) {
          event.preventDefault();
          selectSuggestion(suggestions[0]);
        }
        break;
    }
  }, [
    enabled,
    isOpen,
    query,
    results,
    suggestions,
    recentSearches,
    selectedIndex,
    config.showRecentSearches,
    selectResult,
    selectSuggestion,
    performSearch,
  ]);

  // Voice search
  const isVoiceSupported = voiceManager.current.isSupported();

  const startVoiceSearch = useCallback(() => {
    if (!enabled || !isVoiceSupported) return;

    setIsListening(true);
    voiceManager.current.startListening(
      (transcript) => {
        performSearch(transcript);
        setIsListening(false);

        if (config.enableAnalytics) {
          analyticsManager.current.trackSearch({
            query: transcript,
            context,
            timestamp: new Date(),
            resultsCount: 0, // Will be updated when search completes
            source: 'voice',
          });
        }
      },
      (error) => {
        setError(`Voice search error: ${error}`);
        setIsListening(false);
      }
    );
  }, [enabled, isVoiceSupported, performSearch, context, config.enableAnalytics]);

  const stopVoiceSearch = useCallback(() => {
    voiceManager.current.stopListening();
    setIsListening(false);
  }, []);

  // History management
  const clearHistory = useCallback(() => {
    historyManager.current.clearHistory();
    setRecentSearches([]);
  }, []);

  const removeFromHistory = useCallback((queryToRemove: string) => {
    historyManager.current.removeFromHistory(queryToRemove);
    setRecentSearches(historyManager.current.getHistory());
  }, []);

  // Analytics
  const getSearchAnalytics = useCallback(() => {
    return analyticsManager.current.getAnalytics(context);
  }, [context]);

  // Auto-correct
  const getCorrectedQuery = useCallback((queryToCorrect: string) => {
    return autoCorrectManager.current.correctQuery(queryToCorrect);
  }, []);

  // Highlight match utility
  const highlightMatch = useCallback((text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut (Ctrl+K / Cmd+K) support
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (isListening) {
        voiceManager.current.stopListening();
      }
    };
  }, [isListening]);

  return {
    // Search state
    query,
    setQuery: performSearch,
    results,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    error,

    // Navigation state
    selectedIndex,
    setSelectedIndex,

    // Search functions
    performSearch,
    clearSearch,
    selectResult,
    selectSuggestion,

    // Keyboard handlers
    handleKeyDown,

    // Voice search
    isVoiceSupported,
    isListening,
    startVoiceSearch,
    stopVoiceSearch,

    // History management
    recentSearches,
    clearHistory,
    removeFromHistory,

    // Analytics
    getSearchAnalytics,

    // Auto-correct
    getCorrectedQuery,

    // Utils
    highlightMatch,

    // Refs
    inputRef,
    dropdownRef,
  };
};
