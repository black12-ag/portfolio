import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search, Navigation, MapPin, Check } from 'lucide-react';
import { generateSearchSuggestions, autoCorrect, highlightMatch, type SearchSuggestion } from '@/utils/searchUtils';
import logger from '@/lib/logger';
import { useIsMobile } from '@/hooks/useIsMobile';

interface NavbarSearchProps {
  className?: string;
}

export default function NavbarSearch({ className }: NavbarSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  // Smart search suggestions with typo correction
  const searchSuggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, true);
  }, [searchQuery]);

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    // Close with a slight delay to prevent click conflicts
    setTimeout(() => {
      setIsSearchOpen(false);
    }, 150);
    
    // Navigate based on suggestion type using React Router
    if (suggestion.type === 'hotel' || suggestion.type === 'property') {
      navigate(`/hotel/${encodeURIComponent(suggestion.value)}`);
    } else {
      navigate(`/search?location=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    
    // Auto-correct the query
    const correctedQuery = autoCorrect(searchQuery);
    
    // If there are suggestions and the input is different from corrected, use best match
    if (searchSuggestions.length > 0 && correctedQuery !== searchQuery) {
      const bestMatch = searchSuggestions[0];
      handleSearchSelect(bestMatch);
    } else {
      setIsSearchOpen(false);
      navigate(`/search?location=${encodeURIComponent(correctedQuery)}`);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          logger.debug('navbar-search', 'Location:', position.coords);
          setSearchQuery('Near Me');
          setIsSearchOpen(false);
          navigate('/search?location=nearby');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle search popover
    setIsSearchOpen(prev => !prev);
    
    // Focus input after a short delay to ensure popover is open
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSearchInputFocus = () => {
    // Ensure popover stays open when input is focused
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Keep popover open while typing
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${className}`}
        onClick={() => navigate('/search')}
        aria-label={t('search.placeholder')}
      >
        <Search className="h-5 w-5 text-blue-600" />
      </Button>
    );
  }

  return (
    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={searchButtonRef}
          variant="outline"
          className={`w-80 justify-start text-muted-foreground hover:bg-muted ${className}`}
          onClick={handleSearchButtonClick}
          aria-label={t('search.placeholder')}
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="truncate">
            {searchQuery || t('search.placeholder')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Enhanced Search Input */}
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchInputKeyDown}
              onFocus={handleSearchInputFocus}
              className="pl-10 pr-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={getCurrentLocation}
              title={t('search.getCurrentLocation')}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-foreground mb-2">
                {t('search.suggestions')}
              </p>
              <div className="space-y-1">
                {searchSuggestions.slice(0, 8).map((suggestion, index) => (
                  <Button
                    key={`${suggestion.value}-${index}`}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearchSelect(suggestion);
                    }}
                    onMouseDown={(e) => {
                      // Prevent blur event from closing popover before click
                      e.preventDefault();
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0">
                        {suggestion.type === 'location' && <MapPin className="h-4 w-4 text-blue-500" />}
                        {suggestion.type === 'hotel' && <span className="text-sm">🏨</span>}
                        {suggestion.type === 'property' && <span className="text-sm">🏠</span>}
                        {suggestion.type === 'recent' && <span className="text-sm">🕒</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-medium text-sm truncate"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(suggestion.label, searchQuery) }}
                        />
                        {suggestion.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.subtitle}
                          </div>
                        )}
                      </div>
                      {suggestion.type === 'recent' && (
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchSuggestions.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {t('search.noResults')}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={handleSearchSubmit}
                className="mt-2"
              >
                {t('search.searchAnyway')}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
