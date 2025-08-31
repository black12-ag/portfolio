import { useEffect, useRef, useCallback } from 'react';
import { EnhancedSearchResult, SearchContext } from '../lib/searchEnhancements';
import { 
  searchAnalytics, 
  SearchAnalyticsManager,
  SearchEventType 
} from '../lib/searchAnalytics';

export interface UseSearchAnalyticsProps {
  context: SearchContext;
  userId?: string;
  enabled?: boolean;
  analytics?: SearchAnalyticsManager;
}

export interface SearchAnalyticsHandlers {
  trackSearch: (query: string, metadata?: Record<string, unknown>) => void;
  trackSearchCompleted: (query: string, resultCount: number, responseTime: number) => void;
  trackSearchFailed: (query: string, error: string) => void;
  trackResultClick: (result: EnhancedSearchResult, position: number, query: string) => void;
  trackSuggestionSelected: (suggestion: string, originalQuery: string) => void;
  trackFilterApplied: (filterId: string, filterValue: any, query: string) => void;
  trackSortChanged: (sortField: string, sortDirection: string, query: string) => void;
  trackVoiceSearchUsed: (query: string) => void;
  trackNoResults: (query: string) => void;
  trackSearchAbandoned: (query: string, timeSpent: number) => void;
  startSession: () => string;
  endSession: () => void;
}

export function useSearchAnalytics({
  context,
  userId,
  enabled = true,
  analytics = searchAnalytics
}: UseSearchAnalyticsProps): SearchAnalyticsHandlers {
  const sessionRef = useRef<string | null>(null);
  const searchStartTimeRef = useRef<number>(0);
  const abandonmentTimerRef = useRef<NodeJS.Timeout>();

  // Start session on mount
  useEffect(() => {
    if (enabled && !sessionRef.current) {
      sessionRef.current = analytics.startSession(context, userId);
    }

    return () => {
      if (sessionRef.current) {
        analytics.endSession();
        sessionRef.current = null;
      }
    };
  }, [enabled, context, userId, analytics]);

  // Clear abandonment timer on unmount
  useEffect(() => {
    return () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
    };
  }, []);

  const trackSearch = useCallback((query: string, metadata?: Record<string, unknown>) => {
    if (!enabled) return;

    searchStartTimeRef.current = Date.now();
    analytics.trackSearch(query, context, metadata);

    // Set abandonment timer (clear previous one)
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    // Track abandonment if no activity for 30 seconds
    abandonmentTimerRef.current = setTimeout(() => {
      const timeSpent = Date.now() - searchStartTimeRef.current;
      analytics.trackSearchAbandoned(query, timeSpent, context);
    }, 30000);
  }, [enabled, context, analytics]);

  const trackSearchCompleted = useCallback((
    query: string, 
    resultCount: number, 
    responseTime: number
  ) => {
    if (!enabled) return;

    // Clear abandonment timer since search completed
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
      abandonmentTimerRef.current = undefined;
    }

    analytics.trackSearchCompleted(query, resultCount, responseTime, context);

    // Track no results
    if (resultCount === 0) {
      analytics.trackNoResults(query, context);
    }
  }, [enabled, context, analytics]);

  const trackSearchFailed = useCallback((query: string, error: string) => {
    if (!enabled) return;

    // Clear abandonment timer
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
      abandonmentTimerRef.current = undefined;
    }

    analytics.trackSearchFailed(query, error, context);
  }, [enabled, context, analytics]);

  const trackResultClick = useCallback((
    result: EnhancedSearchResult, 
    position: number, 
    query: string
  ) => {
    if (!enabled) return;

    // Clear abandonment timer since user clicked
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
      abandonmentTimerRef.current = undefined;
    }

    analytics.trackResultClick(result, position, query, context);
  }, [enabled, context, analytics]);

  const trackSuggestionSelected = useCallback((
    suggestion: string, 
    originalQuery: string
  ) => {
    if (!enabled) return;

    analytics.trackSuggestionSelected(suggestion, originalQuery, context);
  }, [enabled, context, analytics]);

  const trackFilterApplied = useCallback((
    filterId: string, 
    filterValue: any, 
    query: string
  ) => {
    if (!enabled) return;

    analytics.trackFilterApplied(filterId, filterValue, query, context);
  }, [enabled, context, analytics]);

  const trackSortChanged = useCallback((
    sortField: string, 
    sortDirection: string, 
    query: string
  ) => {
    if (!enabled) return;

    analytics.trackSortChanged(sortField, sortDirection, query, context);
  }, [enabled, context, analytics]);

  const trackVoiceSearchUsed = useCallback((query: string) => {
    if (!enabled) return;

    analytics.trackVoiceSearchUsed(query, context);
  }, [enabled, context, analytics]);

  const trackNoResults = useCallback((query: string) => {
    if (!enabled) return;

    analytics.trackNoResults(query, context);
  }, [enabled, context, analytics]);

  const trackSearchAbandoned = useCallback((query: string, timeSpent: number) => {
    if (!enabled) return;

    analytics.trackSearchAbandoned(query, timeSpent, context);
  }, [enabled, context, analytics]);

  const startSession = useCallback(() => {
    if (!enabled) return '';

    if (sessionRef.current) {
      analytics.endSession();
    }
    
    sessionRef.current = analytics.startSession(context, userId);
    return sessionRef.current;
  }, [enabled, context, userId, analytics]);

  const endSession = useCallback(() => {
    if (!enabled || !sessionRef.current) return;

    analytics.endSession();
    sessionRef.current = null;

    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
      abandonmentTimerRef.current = undefined;
    }
  }, [enabled, analytics]);

  return {
    trackSearch,
    trackSearchCompleted,
    trackSearchFailed,
    trackResultClick,
    trackSuggestionSelected,
    trackFilterApplied,
    trackSortChanged,
    trackVoiceSearchUsed,
    trackNoResults,
    trackSearchAbandoned,
    startSession,
    endSession
  };
}

// Higher-order component for automatic analytics integration
export interface WithSearchAnalyticsProps {
  searchContext: SearchContext;
  userId?: string;
  analyticsEnabled?: boolean;
}

export function withSearchAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T & SearchAnalyticsHandlers>
) {
  return function WithSearchAnalyticsComponent(
    props: T & WithSearchAnalyticsProps
  ) {
    const { searchContext, userId, analyticsEnabled = true, ...restProps } = props;
    
    const analyticsHandlers = useSearchAnalytics({
      context: searchContext,
      userId,
      enabled: analyticsEnabled
    });

    return (
      <WrappedComponent
        {...(restProps as T)}
        {...analyticsHandlers}
      />
    );
  };
}

// Utility hook for tracking search performance
export function useSearchPerformance() {
  const performanceTimers = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((key: string) => {
    performanceTimers.current.set(key, Date.now());
  }, []);

  const endTimer = useCallback((key: string): number => {
    const startTime = performanceTimers.current.get(key);
    if (!startTime) return 0;

    const endTime = Date.now();
    const duration = endTime - startTime;
    performanceTimers.current.delete(key);
    
    return duration;
  }, []);

  const getTimer = useCallback((key: string): number => {
    const startTime = performanceTimers.current.get(key);
    return startTime ? Date.now() - startTime : 0;
  }, []);

  return {
    startTimer,
    endTimer,
    getTimer
  };
}

// Hook for A/B testing search features
export interface UseSearchABTestProps {
  testName: string;
  userId?: string;
  variants: string[];
  defaultVariant?: string;
}

export function useSearchABTest({
  testName,
  userId,
  variants,
  defaultVariant
}: UseSearchABTestProps) {
  const getVariant = useCallback(() => {
    if (!userId) return defaultVariant || variants[0];

    // Simple hash-based assignment for consistent user experience
    let hash = 0;
    const testKey = `${testName}_${userId}`;
    
    for (let i = 0; i < testKey.length; i++) {
      const char = testKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const index = Math.abs(hash) % variants.length;
    return variants[index];
  }, [testName, userId, variants, defaultVariant]);

  const variant = getVariant();

  const trackConversion = useCallback((conversionType: string, metadata?: Record<string, unknown>) => {
    searchAnalytics.trackEvent(SearchEventType.RESULT_CLICKED, {
      testName,
      variant,
      conversionType,
      userId,
      ...metadata
    });
  }, [testName, variant, userId]);

  return {
    variant,
    trackConversion
  };
}
