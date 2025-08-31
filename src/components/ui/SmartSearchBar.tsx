import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { UniversalSearchBar } from '@/components/ui/UniversalSearchBar';
import { EnhancedSearchResult, EnhancedSearchSuggestion, SearchContext } from '@/lib/searchEnhancements';

// Legacy type mappings for backward compatibility
export type SearchContextType = SearchContext;
export type SearchSuggestion = EnhancedSearchSuggestion;
export type SearchResult = EnhancedSearchResult;

interface SmartSearchBarProps {
  className?: string;
  placeholder?: string;
  context: SearchContextType;
  suggestions?: EnhancedSearchSuggestion[];
  onSearch?: (query: string) => void;
  onResultSelect?: (result: EnhancedSearchResult) => void;
  searchFunction?: (query: string) => Promise<EnhancedSearchResult[]> | EnhancedSearchResult[];
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
  showFilters?: boolean;
  maxResults?: number;
  debounceMs?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'enhanced';
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  showShortcuts?: boolean;
}

/**
 * SmartSearchBar - A wrapper around UniversalSearchBar for backward compatibility
 * 
 * @deprecated Use UniversalSearchBar directly for new implementations
 */
export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  context,
  suggestions,
  onSearch,
  onResultSelect,
  searchFunction,
  showRecentSearches = true,
  showSuggestions = true,
  showFilters = false,
  maxResults = 10,
  debounceMs = 300,
  ...restProps
}) => {
  return (
    <UniversalSearchBar
      context={context}
      suggestions={suggestions}
      onSearch={onSearch}
      onResultSelect={onResultSelect}
      searchFunction={searchFunction}
      showVoiceSearch={true}
      showShortcuts={true}
      config={{
        showRecentSearches,
        showSuggestions,
        maxResults,
        debounceMs,
        enableVoiceSearch: true,
        enableAnalytics: true,
        enablePersonalization: true,
      }}
      {...restProps}
    />
  );
};

export default SmartSearchBar;
