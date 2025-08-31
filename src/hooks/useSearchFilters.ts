import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SearchFilter,
  FilterGroup,
  SortOption,
  SearchFilterConfig,
  SmartFilterGenerator,
  SearchFilterEngine,
  FilterStateManager,
  getFilterConfig,
  getActiveFiltersCount
} from '@/lib/searchFiltering';
import { EnhancedSearchResult, SearchContext } from '@/lib/searchEnhancements';

export interface UseSearchFiltersOptions {
  context: SearchContext;
  results?: EnhancedSearchResult[];
  query?: string;
  enablePersistence?: boolean;
  enableSmartFilters?: boolean;
  enableDynamicFilters?: boolean;
  onFiltersChange?: (filteredResults: EnhancedSearchResult[]) => void;
  onSortChange?: (sortedResults: EnhancedSearchResult[]) => void;
}

export interface UseSearchFiltersReturn {
  // Filter state
  filterGroups: FilterGroup[];
  activeFiltersCount: number;
  
  // Sort state
  sortOptions: SortOption[];
  currentSort: SortOption;
  
  // Filtered and sorted results
  filteredResults: EnhancedSearchResult[];
  
  // Filter actions
  toggleFilter: (filterId: string) => void;
  updateFilterValue: (filterId: string, value: string | number | boolean | string[]) => void;
  clearFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  resetFiltersToDefault: () => void;
  
  // Sort actions
  changeSorting: (sortOption: SortOption) => void;
  
  // Smart filter actions
  applySmartFilters: (forceUpdate?: boolean) => void;
  
  // Utility functions
  getFilterById: (filterId: string) => SearchFilter | undefined;
  getActiveFilters: () => SearchFilter[];
  isFilterActive: (filterId: string) => boolean;
  
  // Config
  config: SearchFilterConfig;
}

export const useSearchFilters = (options: UseSearchFiltersOptions): UseSearchFiltersReturn => {
  const {
    context,
    results = [],
    query = '',
    enablePersistence = true,
    enableSmartFilters = true,
    enableDynamicFilters = true,
    onFiltersChange,
    onSortChange
  } = options;

  // Get base configuration
  const baseConfig = useMemo(() => getFilterConfig(context), [context]);
  
  // Initialize filter groups state
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(() => {
    const initialGroups = baseConfig.filterGroups.map(group => ({
      ...group,
      filters: group.filters.map(filter => ({ ...filter }))
    }));
    
    // Load persisted state if enabled
    if (enablePersistence) {
      const allFilters = initialGroups.flatMap(group => group.filters);
      const restoredFilters = FilterStateManager.loadFilterState(context, allFilters);
      const filterMap = new Map(restoredFilters.map(f => [f.id, f]));
      
      return initialGroups.map(group => ({
        ...group,
        filters: group.filters.map(filter => filterMap.get(filter.id) || filter)
      }));
    }
    
    return initialGroups;
  });

  // Initialize sort state
  const [currentSort, setCurrentSort] = useState<SortOption>(baseConfig.defaultSort);
  
  // Smart filters state
  const [smartFiltersApplied, setSmartFiltersApplied] = useState(false);

  // Generate dynamic filters when results change
  useEffect(() => {
    if (!enableDynamicFilters || results.length === 0) return;

    const dynamicGroups = SmartFilterGenerator.generateDynamicFilters(results, context);
    
    if (dynamicGroups.length > 0) {
      setFilterGroups(prev => {
        // Remove existing dynamic groups and add new ones
        const staticGroups = prev.filter(group => !group.id.startsWith('dynamic_'));
        return [...staticGroups, ...dynamicGroups];
      });
    }
  }, [results, context, enableDynamicFilters]);

  // Apply smart filters when query changes
  useEffect(() => {
    if (!enableSmartFilters || !query.trim() || smartFiltersApplied) return;

    const smartFilters = SmartFilterGenerator.generateSmartFilters(query, results, context);
    
    if (smartFilters.length > 0) {
      setFilterGroups(prev => {
        const updatedGroups = [...prev];
        
        // Create or update smart filters group
        const smartGroupIndex = updatedGroups.findIndex(g => g.id === 'smart_filters');
        
        if (smartGroupIndex >= 0) {
          updatedGroups[smartGroupIndex] = {
            ...updatedGroups[smartGroupIndex],
            filters: smartFilters
          };
        } else {
          updatedGroups.unshift({
            id: 'smart_filters',
            label: 'Smart Suggestions',
            icon: '🧠',
            filters: smartFilters,
            isCollapsible: true,
            isExpanded: true
          });
        }
        
        return updatedGroups;
      });
      
      setSmartFiltersApplied(true);
    }
  }, [query, results, context, enableSmartFilters, smartFiltersApplied]);

  // Get all active filters
  const activeFilters = useMemo(() => {
    return filterGroups.flatMap(group => group.filters.filter(f => f.isActive));
  }, [filterGroups]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return getActiveFiltersCount(filterGroups);
  }, [filterGroups]);

  // Apply filters and sorting to results
  const filteredResults = useMemo(() => {
    let processed = [...results];
    
    // Apply filters
    if (activeFilters.length > 0) {
      processed = SearchFilterEngine.applyFilters(processed, activeFilters);
    }
    
    // Apply sorting
    processed = SearchFilterEngine.applySorting(processed, currentSort);
    
    return processed;
  }, [results, activeFilters, currentSort]);

  // Persist filter state when it changes
  useEffect(() => {
    if (enablePersistence && activeFilters.length >= 0) {
      FilterStateManager.saveFilterState(context, activeFilters);
    }
  }, [activeFilters, context, enablePersistence]);

  // Notify about filtered results changes
  useEffect(() => {
    onFiltersChange?.(filteredResults);
  }, [filteredResults, onFiltersChange]);

  // Notify about sort changes
  useEffect(() => {
    onSortChange?.(filteredResults);
  }, [currentSort, filteredResults, onSortChange]);

  // Filter action functions
  const toggleFilter = useCallback((filterId: string) => {
    setFilterGroups(prev => prev.map(group => ({
      ...group,
      filters: group.filters.map(filter =>
        filter.id === filterId 
          ? { ...filter, isActive: !filter.isActive }
          : filter
      )
    })));
  }, []);

  const updateFilterValue = useCallback((filterId: string, value: string | number | boolean | string[]) => {
    setFilterGroups(prev => prev.map(group => ({
      ...group,
      filters: group.filters.map(filter =>
        filter.id === filterId 
          ? { ...filter, value, isActive: true }
          : filter
      )
    })));
  }, []);

  const clearFilter = useCallback((filterId: string) => {
    setFilterGroups(prev => prev.map(group => ({
      ...group,
      filters: group.filters.map(filter =>
        filter.id === filterId 
          ? { ...filter, isActive: false }
          : filter
      )
    })));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterGroups(prev => prev.map(group => ({
      ...group,
      filters: group.filters.map(filter => ({ ...filter, isActive: false }))
    })));
    
    // Clear smart filters
    setSmartFiltersApplied(false);
    
    // Clear persisted state
    if (enablePersistence) {
      FilterStateManager.clearFilterState(context);
    }
  }, [context, enablePersistence]);

  const resetFiltersToDefault = useCallback(() => {
    const defaultGroups = baseConfig.filterGroups.map(group => ({
      ...group,
      filters: group.filters.map(filter => ({ ...filter, isActive: false }))
    }));
    
    setFilterGroups(defaultGroups);
    setCurrentSort(baseConfig.defaultSort);
    setSmartFiltersApplied(false);
    
    // Clear persisted state
    if (enablePersistence) {
      FilterStateManager.clearFilterState(context);
    }
  }, [baseConfig, context, enablePersistence]);

  // Sort action functions
  const changeSorting = useCallback((sortOption: SortOption) => {
    setCurrentSort(sortOption);
  }, []);

  // Smart filter actions
  const applySmartFilters = useCallback((forceUpdate = false) => {
    if (forceUpdate) {
      setSmartFiltersApplied(false);
    }
    
    if (!query.trim()) return;
    
    const smartFilters = SmartFilterGenerator.generateSmartFilters(query, results, context);
    
    if (smartFilters.length > 0) {
      setFilterGroups(prev => {
        const updatedGroups = [...prev];
        const smartGroupIndex = updatedGroups.findIndex(g => g.id === 'smart_filters');
        
        if (smartGroupIndex >= 0) {
          updatedGroups[smartGroupIndex] = {
            ...updatedGroups[smartGroupIndex],
            filters: smartFilters
          };
        } else {
          updatedGroups.unshift({
            id: 'smart_filters',
            label: 'Smart Suggestions',
            icon: '🧠',
            filters: smartFilters,
            isCollapsible: true,
            isExpanded: true
          });
        }
        
        return updatedGroups;
      });
      
      setSmartFiltersApplied(true);
    }
  }, [query, results, context]);

  // Utility functions
  const getFilterById = useCallback((filterId: string): SearchFilter | undefined => {
    for (const group of filterGroups) {
      const filter = group.filters.find(f => f.id === filterId);
      if (filter) return filter;
    }
    return undefined;
  }, [filterGroups]);

  const getActiveFilters = useCallback(() => {
    return activeFilters;
  }, [activeFilters]);

  const isFilterActive = useCallback((filterId: string): boolean => {
    const filter = getFilterById(filterId);
    return filter?.isActive || false;
  }, [getFilterById]);

  return {
    // State
    filterGroups,
    activeFiltersCount,
    sortOptions: baseConfig.sortOptions,
    currentSort,
    filteredResults,
    
    // Actions
    toggleFilter,
    updateFilterValue,
    clearFilter,
    clearAllFilters,
    resetFiltersToDefault,
    changeSorting,
    applySmartFilters,
    
    // Utilities
    getFilterById,
    getActiveFilters,
    isFilterActive,
    
    // Config
    config: {
      ...baseConfig,
      enableSmartFilters,
      enableDynamicFilters
    }
  };
};
