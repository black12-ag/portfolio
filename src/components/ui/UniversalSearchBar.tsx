import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  MicOff,
  Loader2,
  X,
  Command,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Filter,
  Hash,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useEnhancedSearch, UseEnhancedSearchOptions } from '@/hooks/useEnhancedSearch';
import { EnhancedSearchResult, EnhancedSearchSuggestion, SearchContext } from '@/lib/searchEnhancements';

interface UniversalSearchBarProps extends Omit<UseEnhancedSearchOptions, 'context'> {
  className?: string;
  placeholder?: string;
  context: SearchContext;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'enhanced';
  showShortcuts?: boolean;
  showVoiceSearch?: boolean;
  showFilters?: boolean;
  showAnalytics?: boolean;
  maxDropdownHeight?: string;
  dropdownClassName?: string;
  inputClassName?: string;
  resultClassName?: string;
  suggestionClassName?: string;
  renderCustomResult?: (result: EnhancedSearchResult, index: number, isSelected: boolean) => React.ReactNode;
  renderCustomSuggestion?: (suggestion: EnhancedSearchSuggestion, index: number, isSelected: boolean) => React.ReactNode;
  renderCustomEmpty?: (query: string) => React.ReactNode;
  onAnalyticsClick?: () => void;
}

const sizeVariants = {
  sm: {
    input: 'h-9 text-sm',
    icon: 'h-4 w-4',
    dropdown: 'text-sm',
  },
  md: {
    input: 'h-11 text-base',
    icon: 'h-5 w-5',
    dropdown: 'text-base',
  },
  lg: {
    input: 'h-13 text-lg',
    icon: 'h-6 w-6',
    dropdown: 'text-lg',
  },
};

const getContextInfo = (context: SearchContext) => {
  const contextMap = {
    global: { label: 'Global Search', color: 'blue', icon: Search },
    admin: { label: 'Admin Panel', color: 'red', icon: Command },
    agent: { label: 'Agent Tools', color: 'green', icon: Star },
    property: { label: 'Properties', color: 'purple', icon: Hash },
    user: { label: 'Users', color: 'orange', icon: Star },
    booking: { label: 'Bookings', color: 'teal', icon: Star },
    payment: { label: 'Payments', color: 'yellow', icon: Star },
    reception: { label: 'Reception', color: 'pink', icon: Star },
    manager: { label: 'Management', color: 'indigo', icon: Star },
    navigation: { label: 'Navigation', color: 'gray', icon: Star },
  };
  return contextMap[context] || contextMap.global;
};

const getSuggestionIcon = (type: EnhancedSearchSuggestion['type']) => {
  switch (type) {
    case 'recent': return Clock;
    case 'popular': return TrendingUp;
    case 'trending': return Zap;
    case 'recommended': return Sparkles;
    case 'autocomplete': return Search;
    default: return Search;
  }
};

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  className,
  placeholder,
  context,
  size = 'md',
  variant = 'default',
  showShortcuts = true,
  showVoiceSearch = true,
  showFilters = false,
  showAnalytics = false,
  maxDropdownHeight = '24rem',
  dropdownClassName,
  inputClassName,
  resultClassName,
  suggestionClassName,
  renderCustomResult,
  renderCustomSuggestion,
  renderCustomEmpty,
  onAnalyticsClick,
  ...searchOptions
}) => {
  const search = useEnhancedSearch({ context, ...searchOptions });

  const contextInfo = getContextInfo(context);
  const sizeClasses = sizeVariants[size];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search.performSearch(e.target.value);
  };

  const handleInputFocus = () => {
    if (search.query.trim() || search.recentSearches.length > 0) {
      search.setIsOpen(true);
    }
  };

  const renderResult = (result: EnhancedSearchResult, index: number) => {
    const isSelected = search.selectedIndex === index;
    
    if (renderCustomResult) {
      return renderCustomResult(result, index, isSelected);
    }

    return (
      <motion.button
        key={result.id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'w-full text-left px-4 py-3 hover:bg-muted/60 transition-all duration-200 flex items-center gap-3 border-b border-border/30 last:border-0 group',
          isSelected && 'bg-primary/10 border-primary/20 shadow-sm',
          resultClassName
        )}
        onClick={() => search.selectResult(result)}
        onMouseEnter={() => search.setSelectedIndex(index)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {result.icon && (
              <span className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                {result.icon}
              </span>
            )}
            <span 
              className="font-medium text-sm group-hover:text-primary transition-colors truncate"
              dangerouslySetInnerHTML={{ 
                __html: search.highlightMatch(result.title, search.query) 
              }}
            />
            {result.isNew && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                <Zap className="h-3 w-3 mr-1" />
                New
              </Badge>
            )}
            {result.isFavorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            {result.isPremium && (
              <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate mb-1">
            {result.description}
          </p>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {result.category}
            </Badge>
            {result.metadata?.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-muted-foreground">
                  {result.metadata.rating.toFixed(1)}
                </span>
              </div>
            )}
            {result.metadata?.price && (
              <span className="text-xs font-medium text-green-600">
                ${result.metadata.price}
              </span>
            )}
            {result.path && (
              <span className="text-xs text-muted-foreground/70 truncate max-w-[100px]">
                {result.path}
              </span>
            )}
          </div>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </motion.button>
    );
  };

  const renderSuggestion = (suggestion: EnhancedSearchSuggestion, index: number) => {
    const actualIndex = search.results.length + index;
    const isSelected = search.selectedIndex === actualIndex;
    const SuggestionIcon = getSuggestionIcon(suggestion.type);

    if (renderCustomSuggestion) {
      return renderCustomSuggestion(suggestion, index, isSelected);
    }

    return (
      <motion.button
        key={suggestion.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-all duration-200 flex items-center gap-3 border-b border-border/20 last:border-0 group',
          isSelected && 'bg-primary/10 border-primary/20',
          suggestionClassName
        )}
        onClick={() => search.selectSuggestion(suggestion)}
        onMouseEnter={() => search.setSelectedIndex(actualIndex)}
      >
        <SuggestionIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span 
            className="text-sm group-hover:text-primary transition-colors"
            dangerouslySetInnerHTML={{ 
              __html: search.highlightMatch(suggestion.text, search.query) 
            }}
          />
          <span className="text-xs text-muted-foreground ml-2">
            in {suggestion.category}
          </span>
          {suggestion.metadata?.searchCount && (
            <span className="text-xs text-muted-foreground ml-2">
              • {suggestion.metadata.searchCount} searches
            </span>
          )}
        </div>
      </motion.button>
    );
  };

  const renderRecentSearch = (recentSearch: string, index: number) => {
    const actualIndex = search.results.length + search.suggestions.length + index;
    const isSelected = search.selectedIndex === actualIndex;

    return (
      <motion.button
        key={`recent-${index}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-all duration-200 flex items-center gap-3 border-b border-border/20 last:border-0 group',
          isSelected && 'bg-primary/10 border-primary/20'
        )}
        onClick={() => search.performSearch(recentSearch)}
        onMouseEnter={() => search.setSelectedIndex(actualIndex)}
      >
        <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        <span className="text-sm group-hover:text-primary transition-colors truncate">
          {recentSearch}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            search.removeFromHistory(recentSearch);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.button>
    );
  };

  const renderEmpty = () => {
    if (renderCustomEmpty) {
      return renderCustomEmpty(search.query);
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-8 text-center text-muted-foreground"
      >
        <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm font-medium mb-2">No results found for "{search.query}"</p>
        <p className="text-xs mb-4">Try adjusting your search terms or check for typos</p>
        {search.getCorrectedQuery(search.query) !== search.query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => search.performSearch(search.getCorrectedQuery(search.query))}
            className="text-xs"
          >
            Search for "{search.getCorrectedQuery(search.query)}" instead?
          </Button>
        )}
      </motion.div>
    );
  };

  const renderQuickTips = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6"
    >
      <div className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Sparkles className="h-3 w-3" />
        Quick Tips
      </div>
      <div className="space-y-2">
        {showShortcuts && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>Use Ctrl+K (Cmd+K) to focus search</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Use quotes for exact matches: "hotel booking"</span>
        </div>
        {showVoiceSearch && search.isVoiceSupported && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mic className="h-3 w-3" />
            <span>Click the microphone to use voice search</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={cn('relative w-full', className)} ref={search.dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors',
          sizeClasses.icon,
          search.isLoading && 'animate-pulse'
        )} />
        
        <Input
          ref={search.inputRef}
          type="text"
          placeholder={placeholder || `Search ${contextInfo.label.toLowerCase()}...`}
          value={search.query}
          onChange={handleInputChange}
          onKeyDown={search.handleKeyDown}
          onFocus={handleInputFocus}
          className={cn(
            'pl-10 transition-all duration-200',
            sizeClasses.input,
            search.query && 'pr-24',
            !search.query && showShortcuts && 'pr-16',
            variant === 'enhanced' && 'border-2 focus:border-primary shadow-sm',
            variant === 'minimal' && 'border-0 bg-muted/50 focus:bg-background',
            search.error && 'border-red-500 focus:border-red-500',
            inputClassName
          )}
          aria-expanded={search.isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby={search.error ? 'search-error' : undefined}
        />

        {/* Right side controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {search.isLoading && (
            <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses.icon)} />
          )}

          {search.query && !search.isLoading && (
            <Button
              size="sm"
              variant="ghost"
              onClick={search.clearSearch}
              className="h-6 w-6 p-0 hover:bg-muted rounded-full"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {showVoiceSearch && search.isVoiceSupported && (
            <Button
              size="sm"
              variant="ghost"
              onClick={search.isListening ? search.stopVoiceSearch : search.startVoiceSearch}
              className={cn(
                'h-6 w-6 p-0 hover:bg-muted rounded-full',
                search.isListening && 'text-red-500 animate-pulse'
              )}
              aria-label={search.isListening ? 'Stop voice search' : 'Start voice search'}
            >
              {search.isListening ? (
                <MicOff className="h-3 w-3" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
          )}

          {showFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-muted rounded-full"
              aria-label="Filters"
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}

          {/* Keyboard shortcut hint */}
          {showShortcuts && !search.query && variant !== 'minimal' && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {search.error && (
        <Alert variant="destructive" className="mt-2" id="search-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {search.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {search.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={cn(
                'absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-2 overflow-hidden',
                dropdownClassName
              )}
              style={{ maxHeight: maxDropdownHeight }}
            >
              <CardContent className="p-0">
                <div className={cn('overflow-y-auto', sizeClasses.dropdown)} style={{ maxHeight: maxDropdownHeight }}>
                  
                  {/* Analytics header */}
                  {showAnalytics && onAnalyticsClick && (
                    <>
                      <div className="px-4 py-2 bg-muted/30 border-b border-border/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onAnalyticsClick}
                          className="w-full justify-between h-8 text-xs"
                        >
                          <span>View Search Analytics</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Search Results */}
                  {search.results.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 flex items-center gap-2 border-b border-border/20">
                        <Hash className="h-3 w-3" />
                        Results ({search.results.length})
                      </div>
                      {search.results.map((result, index) => renderResult(result, index))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {search.suggestions.length > 0 && (
                    <div>
                      {search.results.length > 0 && <Separator />}
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 flex items-center gap-2 border-b border-border/20">
                        <Star className="h-3 w-3" />
                        Suggestions
                      </div>
                      {search.suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {search.query.trim() === '' && search.recentSearches.length > 0 && (
                    <div>
                      {(search.results.length > 0 || search.suggestions.length > 0) && <Separator />}
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 flex items-center gap-2 border-b border-border/20">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={search.clearHistory}
                          className="ml-auto h-5 px-1 text-xs hover:bg-muted-foreground/20"
                        >
                          Clear all
                        </Button>
                      </div>
                      {search.recentSearches.map((recentSearch, index) => 
                        renderRecentSearch(recentSearch, index)
                      )}
                    </div>
                  )}

                  {/* No Results */}
                  {search.query.trim() !== '' && 
                   search.results.length === 0 && 
                   search.suggestions.length === 0 && 
                   !search.isLoading && renderEmpty()}

                  {/* Quick Tips */}
                  {search.query.trim() === '' && 
                   search.recentSearches.length === 0 && 
                   renderQuickTips()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversalSearchBar;
