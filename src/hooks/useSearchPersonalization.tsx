import { useState, useEffect, useCallback } from 'react';
import {
  SearchPersonalizationEngine,
  UserProfile,
  PersonalizationConfig,
  SearchHistoryItem,
  userProfileStorage,
  initializePersonalization
} from '../lib/searchPersonalization';
import { EnhancedSearchResult, SearchContext } from '../lib/searchEnhancements';

export interface UseSearchPersonalizationProps {
  userId: string;
  context: SearchContext;
  enabled?: boolean;
  config?: Partial<PersonalizationConfig>;
}

export interface SearchPersonalizationHandlers {
  personalizeResults: (results: EnhancedSearchResult[]) => EnhancedSearchResult[];
  getPersonalizedSuggestions: (query: string) => string[];
  addSearchHistory: (query: string) => void;
  trackResultClick: (result: EnhancedSearchResult) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearHistory: () => void;
  getProfile: () => UserProfile | null;
  saveProfile: () => void;
}

export function useSearchPersonalization({
  userId,
  context,
  enabled = true,
  config = {} as Record<string, never>
}: UseSearchPersonalizationProps): [SearchPersonalizationEngine | null, SearchPersonalizationHandlers] {
  
  const [engine, setEngine] = useState<SearchPersonalizationEngine | null>(null);

  // Initialize personalization engine
  useEffect(() => {
    if (enabled && userId) {
      const newEngine = initializePersonalization(userId, config);
      setEngine(newEngine);

      // Save profile on page unload
      const handleUnload = () => {
        const profile = newEngine.getUserProfile();
        if (profile) {
          userProfileStorage.saveProfile(profile);
        }
      };

      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        // Save profile on hook cleanup as well
        handleUnload();
      };
    }
  }, [enabled, userId, config]);

  // Handler functions
  const handlers: SearchPersonalizationHandlers = {
    personalizeResults: useCallback((results: EnhancedSearchResult[]) => {
      if (!engine || !enabled) return results;
      return engine.personalizeResults(results, context);
    }, [engine, enabled, context]),

    getPersonalizedSuggestions: useCallback((query: string) => {
      if (!engine || !enabled) return [];
      return engine.getPersonalizedSuggestions(query, context);
    }, [engine, enabled, context]),

    addSearchHistory: useCallback((query: string) => {
      if (!engine || !enabled) return;
      engine.addSearchHistory(query, context);
    }, [engine, enabled, context]),

    trackResultClick: useCallback((result: EnhancedSearchResult) => {
      if (!engine || !enabled) return;
      engine.trackResultClick(result.id);
    }, [engine, enabled]),

    updateProfile: useCallback((updates: Partial<UserProfile>) => {
      if (!engine || !enabled) return;
      engine.updateUserProfile(updates);
    }, [engine, enabled]),

    clearHistory: useCallback(() => {
      if (!engine || !enabled) return;
      engine.updateUserProfile({ 
        recentSearches: [], 
        searchHistory: new Map(),
        clickHistory: new Map()
      });
    }, [engine, enabled]),

    getProfile: useCallback(() => {
      if (!engine || !enabled) return null;
      return engine.getUserProfile();
    }, [engine, enabled]),
    
    saveProfile: useCallback(() => {
        if (!engine || !enabled) return;
        const profile = engine.getUserProfile();
        if (profile) {
            userProfileStorage.saveProfile(profile)
        }
    }, [engine, enabled])
  };

  return [engine, handlers];
}

// Higher-order component for search personalization
export interface WithSearchPersonalizationProps {
  userId: string;
  searchContext: SearchContext;
  personalizationEnabled?: boolean;
  personalizationConfig?: Partial<PersonalizationConfig>;
}

export function withSearchPersonalization<T extends object>(
  WrappedComponent: React.ComponentType<T & { personalization: SearchPersonalizationHandlers }>
) {
  return function WithSearchPersonalizationComponent(
    props: T & WithSearchPersonalizationProps
  ) {
    const { 
      userId, 
      searchContext, 
      personalizationEnabled = true, 
      personalizationConfig = {} as Record<string, never>, 
      ...restProps 
    } = props;
    
    const [, handlers] = useSearchPersonalization({
      userId,
      context: searchContext,
      enabled: personalizationEnabled,
      config: personalizationConfig
    });

    return (
      <WrappedComponent
        {...(restProps as T)}
        personalization={handlers}
      />
    );
  };
}

// Hook for accessing user's recent searches
export function useRecentSearches(userId: string) {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const profile = userProfileStorage.loadProfile(userId);
    if (profile && profile.recentSearches) {
      setRecentSearches(profile.recentSearches);
    }
  }, [userId]);

  const addSearch = (query: string, context: SearchContext) => {
    const newItem: SearchHistoryItem = { query, context, timestamp: Date.now() };
    const updatedSearches = [newItem, ...recentSearches].slice(0, 100); // Limit size
    setRecentSearches(updatedSearches);
    
    // Persist changes
    const profile = userProfileStorage.loadProfile(userId) || { id: userId };
    userProfileStorage.saveProfile({ ...profile, recentSearches: updatedSearches });
  };

  const clearSearches = () => {
    setRecentSearches([]);
    const profile = userProfileStorage.loadProfile(userId);
    if (profile) {
      userProfileStorage.saveProfile({ ...profile, recentSearches: [] });
    }
  };

  return { recentSearches, addSearch, clearSearches };
}

