import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Users, Search, Filter, Navigation, ChevronDown, Check, X, Star, Clock } from 'lucide-react';
import { addisAbabaAreas, nearbyLocations } from '@/data/sampleData';
import SearchFilters, { FilterOptions } from './SearchFilters';
import { generateSearchSuggestions, autoCorrect, highlightMatch, type SearchSuggestion } from '@/utils/searchUtils';
import { DateRange } from 'react-day-picker';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
  className?: string;
}

export interface SearchData {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  type: 'all' | 'properties' | 'hotels';
}

export default function SearchForm({ onSearch, className }: SearchFormProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<Array<'properties' | 'hotels'>>([]);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showNearbyLocations, setShowNearbyLocations] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Track viewport to avoid mounting multiple popovers (desktop/tablet/mobile) simultaneously
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 640) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const next = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
      setViewport(next);
    };
    window.addEventListener('resize', update, { passive: true });
    update();
    return () => window.removeEventListener('resize', update);
  }, []);
  
  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, [setIsInitialized]);

  // Condense search bar when user scrolls down the page
  useEffect(() => {
    const handleScroll = () => {
      setIsCondensed(window.scrollY > 140);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Smart search with enhanced fuzzy matching and typo correction
  const filteredLocations = useMemo(() => {
    return generateSearchSuggestions(searchQuery, true);
  }, [searchQuery]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      setLocationOpen(false); // Close immediately when clicked
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords);
          setLocation('nearby');
          setSearchQuery('Near Me');
          setIsTyping(false);
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseCurrentLocation(false);
        }
      );
    }
  };

  const handleLocationSelect = (suggestion: SearchSuggestion) => {
    setLocation(suggestion.value);
    setSearchQuery(suggestion.label);
    setIsTyping(false);
    
    // Show nearby locations if it's an area (areas data is still needed for location services)
    if (suggestion.type === 'area') {
      setShowNearbyLocations(!!nearbyLocations[suggestion.value as keyof typeof nearbyLocations]);
    }
    
    // Close the popover with a slight delay to prevent click conflicts
    setTimeout(() => {
      setLocationOpen(false);
    }, 150);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setIsTyping(true);
    // Clear any previous location selection when user starts typing
    if (location && value !== location) {
      setLocation('');
    }
    // Keep popover open while typing
    if (!locationOpen) setLocationOpen(true);
  };

  // Auto-correct and format the search query
  const getCorrectedQuery = () => {
    return autoCorrect(searchQuery);
  };

  const getDisplayText = () => {
    // Always show what user is typing when they're actively typing
    if (isTyping) return searchQuery;
    
    // Show selected location when not typing
    if (!location) return '';
    if (location === 'all') return t("All Areas");
    if (location === 'nearby' || location === 'current-location') return t("Near Me");
    
    const area = addisAbabaAreas.find(area => area.toLowerCase() === location);
    return area || location;
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    console.log('Filters applied:', filters);
    // Apply filters to search results
  };

  const toggleType = (value: 'properties' | 'hotels') => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    // If user is typing and there's a good match, auto-select it
    if (isTyping && filteredLocations.length > 0) {
      const bestMatch = filteredLocations[0];
      setLocation(bestMatch.value);
      setSearchQuery(bestMatch.label);
      setIsTyping(false);
    }

    const effectiveType: 'all' | 'properties' | 'hotels' =
      selectedTypes.length === 0 || selectedTypes.length === 2
        ? 'all'
        : selectedTypes[0];

    onSearch({
      location,
      checkIn: dateRange?.from,
      checkOut: dateRange?.to,
      guests: adults + children,
      type: effectiveType
    });

    // Open filters automatically on results page header; here we just close the modal
    setFiltersOpen(false);
  };

  // Responsive search form that works on all devices
  return (
    <Card className={cn(
      "shadow-xl bg-card/95 backdrop-blur-lg border-0 rounded-xl sm:rounded-2xl md:rounded-[36px] transform transition-all duration-300 w-full max-w-6xl mx-auto",
      "p-1.5 sm:p-3 lg:p-4",
      className
    )}>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {/* Category chips: Hotels / Properties (responsive grid) */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
          {/* Hotels */}
          <button
            type="button"
            onClick={() => toggleType('hotels')}
            className={cn(
              "group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border p-1.5 sm:p-2 md:p-3 flex items-center gap-1.5 sm:gap-2 md:gap-3 shadow-sm transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95",
              selectedTypes.includes('hotels') 
                ? 'border-blue-500 ring-1 sm:ring-2 md:ring-4 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30' 
                : 'border-border bg-card hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300'
            )}
          >
          <div className="w-full h-6 sm:h-8 md:h-10 bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground text-[10px] xs:text-xs sm:text-sm">Hotels</span>
          </div>
            <div className={cn(
              "pointer-events-none absolute inset-0 transition-all duration-300",
              selectedTypes.includes('hotels') 
                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10' 
                : 'bg-gradient-to-br from-blue-500/5 via-transparent to-transparent group-hover:from-blue-500/15'
            )} />
            <div className={cn(
              "relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-all duration-300",
              selectedTypes.includes('hotels') 
                ? 'bg-blue-600 text-white ring-blue-400 scale-125 shadow-lg shadow-blue-500/50 animate-pulse' 
                : 'bg-blue-50 dark:bg-blue-100 text-blue-600 ring-blue-200 group-hover:scale-110 group-hover:bg-blue-100 group-hover:ring-blue-300'
            )}>
              <span className="text-xl filter drop-shadow-sm">🏨</span>
        </div>
            <div className="relative z-10">
              <p className={cn(
                "text-[11px] transition-colors duration-300",
                selectedTypes.includes('hotels') ? 'text-blue-600 font-medium' : 'text-slate-500 group-hover:text-blue-600'
              )}>Explore</p>
              <p className={cn(
                "text-sm font-semibold transition-colors duration-300",
                selectedTypes.includes('hotels') ? 'text-blue-900 dark:text-blue-100' : 'text-foreground group-hover:text-blue-800'
              )}>Hotels</p>
            </div>
            <span className={cn(
              "relative z-10 ml-auto hidden sm:inline-flex h-6 items-center rounded-full px-2 text-[11px] font-medium ring-1 transition-all duration-300",
              selectedTypes.includes('hotels')
                ? 'bg-blue-100 text-blue-800 ring-blue-200 shadow-sm'
                : 'bg-blue-50 text-blue-700 ring-blue-100 group-hover:bg-blue-100 group-hover:text-blue-800'
            )}>
              {selectedTypes.includes('hotels') ? '✓ Selected' : 'Top picks'}
            </span>
          </button>

          {/* Properties */}
          <button
            type="button"
            onClick={() => toggleType('properties')}
            className={cn(
              "group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border p-1.5 sm:p-2 md:p-3 flex items-center gap-1.5 sm:gap-2 md:gap-3 shadow-sm transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95",
              selectedTypes.includes('properties') 
                ? 'border-indigo-500 ring-1 sm:ring-2 md:ring-4 ring-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30' 
                : 'border-border bg-card hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300'
            )}
          >
          <div className="w-full h-6 sm:h-8 md:h-10 bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground text-[10px] xs:text-xs sm:text-sm">Properties</span>
          </div>
            <div className={cn(
              "pointer-events-none absolute inset-0 transition-all duration-300",
              selectedTypes.includes('properties') 
                ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10' 
                : 'bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent group-hover:from-indigo-500/15'
            )} />
            <div className={cn(
              "relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-all duration-300",
              selectedTypes.includes('properties') 
                ? 'bg-indigo-600 text-white ring-indigo-400 scale-125 shadow-lg shadow-indigo-500/50 animate-pulse' 
                : 'bg-indigo-50 dark:bg-indigo-100 text-indigo-600 ring-indigo-200 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:ring-indigo-300'
            )}>
              <span className="text-xl filter drop-shadow-sm">🏠</span>
            </div>
            <div className="relative z-10">
              <p className={cn(
                "text-[11px] transition-colors duration-300",
                selectedTypes.includes('properties') ? 'text-indigo-600 font-medium' : 'text-slate-500 group-hover:text-indigo-600'
              )}>Discover</p>
              <p className={cn(
                "text-sm font-semibold transition-colors duration-300",
                selectedTypes.includes('properties') ? 'text-indigo-900 dark:text-indigo-100' : 'text-foreground group-hover:text-indigo-800'
              )}>Properties</p>
            </div>
            <span className={cn(
              "relative z-10 ml-auto hidden sm:inline-flex h-6 items-center rounded-full px-2 text-[11px] font-medium ring-1 transition-all duration-300",
              selectedTypes.includes('properties')
                ? 'bg-indigo-100 text-indigo-800 ring-indigo-200 shadow-sm'
                : 'bg-indigo-50 text-indigo-700 ring-indigo-100 group-hover:bg-indigo-100 group-hover:text-indigo-800'
            )}>
              {selectedTypes.includes('properties') ? '✓ Selected' : 'Family stays'}
            </span>
          </button>
        </div>

        {/* Search Fields - responsive segmented style (desktop only) */}
        {viewport === 'desktop' && (
        <div className="group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1 sm:gap-0 items-stretch min-h-[48px] sm:min-h-[56px] md:min-h-[64px] rounded-xl sm:rounded-2xl md:rounded-full ring-1 ring-gray-200 dark:ring-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden hover:ring-2 hover:ring-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          {/* Where */}
          <div 
            className="relative group px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-3 flex flex-col justify-center col-span-1 sm:col-span-2 lg:col-span-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 cursor-pointer rounded-l-xl sm:rounded-l-2xl md:rounded-l-full sm:rounded-r-none"
            onClick={() => {
              if (!isInitialized) return;
              setLocationOpen(true);
              setIsTyping(true);
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 50);
            }}
          >
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isInitialized) return;
                    setLocationOpen(true);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }, 50);
                  }}
                >
                  <div className="absolute -top-0.5 sm:-top-1 left-2 sm:left-3 text-[10px] xs:text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 z-10 transition-colors duration-300">Where</div>
                  <Input
                    ref={inputRef}
                    value={getDisplayText()}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onFocus={() => {
                      setLocationOpen(true);
                      setIsTyping(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocationOpen(true);
                    }}
                    placeholder="Enter a destination"
                    className="w-full h-8 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl md:rounded-full text-xs sm:text-sm md:text-base shadow-none focus-visible:ring-0 border-0 px-2 sm:px-3 pr-16 sm:pr-20 md:pr-28 pt-3 sm:pt-4 pb-0 sm:pb-1 md:pb-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300"
                  />
              
                  {/* Clear button */}
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-14 sm:right-16 md:right-20 top-1/2 transform -translate-y-1/2 h-5 sm:h-6 md:h-8 w-5 sm:w-6 md:w-8 p-0 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        setIsTyping(false);
                        setLocation('');
                        setLocationOpen(false);
                      }}
                    >
                      <X className="h-2.5 sm:h-3 md:h-4 w-2.5 sm:w-3 md:w-4" />
                    </Button>
                  )}
                  
                  {/* Nearby chip aligned with input */}
                  <button
                type="button"
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-3 h-5 sm:h-6 md:h-8 rounded-full text-[10px] xs:text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    onClick={(e) => { e.stopPropagation(); getCurrentLocation(); }}
                disabled={useCurrentLocation}
                    title="Use nearby"
              >
                    <Navigation className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                    <span className="hidden sm:inline">Nearby</span>
                    <span className="sm:hidden">📍</span>
                  </button>
                  
                  {/* Status indicator */}
                  {location && !isTyping && (
                    <div className="absolute right-18 sm:right-24 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
            </div>
              </PopoverTrigger>
            
              <PopoverContent 
                className="w-[280px] sm:w-[320px] lg:w-[380px] p-0 rounded-xl border shadow-lg" 
                align="start"
                sideOffset={4}
              >
                {/* Simple header */}
                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {searchQuery ? `Search results for "${searchQuery}"` : 'Where would you like to go?'}
                      </span>
                  </div>
                </div>
                
                {/* Simple suggestions list */}
                <div className="max-h-[200px] sm:max-h-[240px] lg:max-h-[280px] overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    <div className="py-2">
                      {filteredLocations.map((item, index) => (
                        <button
                          key={`${item.type}-${item.value}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLocationSelect(item);
                          }}
                          onMouseDown={(e) => {
                            // Prevent blur event from closing popover before click
                            e.preventDefault();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                            location === item.value && "bg-blue-50 dark:bg-blue-950"
                          )}
                        >
                          {/* Simple icon */}
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                            {item.emoji}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {item.label}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          
                          {/* Selection indicator */}
                          {location === item.value && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    /* No results */
                    <div className="py-8 px-4 text-center">
                      <div className="text-gray-500 mb-2">No locations found</div>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setIsTyping(false);
                          setLocation('');
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : null}
                </div>
                
                {/* Quick actions for empty search */}
                {!searchQuery && (
                  <div className="border-t p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={getCurrentLocation}
                        disabled={useCurrentLocation}
                        className="flex items-center gap-2 p-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                      >
                        <Navigation className="h-4 w-4" />
                        Near me
                    </button>
                    <button
                        onClick={() => handleLocationSelect({ 
                          type: 'special', 
                          value: 'all', 
                          label: 'All Areas', 
                          emoji: '🌍', 
                          description: 'Browse all locations', 
                          score: 100 
                        })}
                        className="flex items-center gap-2 p-2 text-sm rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        <span>🌍</span>
                        All areas
                    </button>
                </div>
              </div>
            )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Combined Dates (desktop) */}
          <div className="px-4 py-2 hidden lg:flex flex-col justify-center border-l border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-0 bg-transparent hover:bg-transparent focus:ring-0",
                    !dateRange && "text-gray-400"
                  )}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5">Dates</div>
                    <div className="text-base text-slate-600 dark:text-slate-300">
                      {dateRange?.from && dateRange?.to 
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : dateRange?.from 
                        ? `${format(dateRange.from, 'MMM dd')} - Add checkout`
                        : 'Add dates'
                      }
                    </div>
                  </div>
                  <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl" align="start">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-t-2xl">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Select Your Stay
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Choose check-in and check-out dates</p>
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => date < new Date()}
                  numberOfMonths={2}
                  initialFocus
                  className="p-4 pointer-events-auto rounded-xl"
                  classNames={{
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                    day_range_middle: "bg-blue-100 text-blue-800",
                    day_today: "bg-blue-50 text-blue-700 font-semibold"
                  }}
                />
                <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
                  {dateRange?.from && dateRange?.to && (
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} nights selected
                      </span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div className="relative px-4 py-2 border-l border-gray-200 dark:border-neutral-700 flex flex-col justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300">
            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal border-0 bg-transparent hover:bg-transparent focus:ring-0"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                    {adults + children} {adults + children === 1 ? t('Guest') : t('Guests')}
                  </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 sm:w-64 lg:w-72 p-0 rounded-xl border shadow-lg" align="start">
                {/* Compact header */}
                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Guests & Rooms</span>
                </div>
                      </div>
                
                {/* Compact guest controls */}
                <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👤</span>
                    <div>
                        <div className="text-sm font-medium">{t("Adults")}</div>
                        <div className="text-xs text-gray-500">13+</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        disabled={adults >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👶</span>
                    <div>
                        <div className="text-sm font-medium">{t("Children")}</div>
                        <div className="text-xs text-gray-500">2-12</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setChildren(Math.min(8, children + 1))}
                        disabled={children >= 8}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏠</span>
                    <div>
                        <div className="text-sm font-medium">{t("Rooms")}</div>
                        <div className="text-xs text-gray-500">Separate</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{rooms}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        disabled={rooms >= 5}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Compact summary */}
                <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 text-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {adults + children} guest{adults + children !== 1 ? 's' : ''} • {rooms} room{rooms !== 1 ? 's' : ''}
                    </span>
                </div>
              </PopoverContent>
            </Popover>
        </div>

          {/* Search icon */}
          <div className="hidden lg:flex items-center justify-end pr-2">
          <div className="relative group">
            <Button 
              onClick={handleSubmit}
              className="relative z-10 h-12 w-12 group-hover:w-28 rounded-full group-hover:rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-2xl hover:shadow-blue-500/25 group flex items-center justify-center overflow-hidden"
              title="Search"
            >
              {/* Animated glow ring */}
              <span className="absolute inset-0 rounded-full group-hover:rounded-3xl border-2 border-blue-300 animate-ping opacity-75 group-hover:opacity-100 transition-all duration-500"></span>
              {/* Soft glow background */}
              <span className="absolute inset-0 -z-10 rounded-full group-hover:rounded-3xl bg-gradient-to-r from-blue-400 to-blue-500 blur-lg opacity-60 group-hover:opacity-80 transition-all duration-700 scale-150"></span>
              {/* Secondary pulse ring */}
              <span className="absolute inset-0 rounded-full group-hover:rounded-3xl bg-blue-400/30 scale-100 group-hover:scale-110 opacity-100 transition-all duration-800 animate-pulse"></span>

              {/* Icon anchored to the left so it doesn't shift during expansion */}
              <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" className="transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Expandable Search Text - positioned at right, never overlaps the icon */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 z-20 whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 drop-shadow-sm">
                Search
              </span>
            </Button>
            </div>
          </div>
        </div>
        )}

        {/* Tablet layout: Where+Dates in first row, Guests+Search in second row */}
        {viewport === 'tablet' && (
        <div className="flex flex-col gap-2 mt-2">
          {/* First row: Where + Dates */}
          <div className="grid grid-cols-2 gap-2">
            {/* Where field with search functionality for tablet */}
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="h-12 flex items-center justify-between px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    console.log('Tablet where field clicked');
                    if (!isInitialized) return;
                    setLocationOpen(true);
                    setIsTyping(true);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Where</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                      {getDisplayText() || 'Enter a destination'}
                    </span>
                  </div>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              </PopoverTrigger>
              
              <PopoverContent 
                className="w-[280px] sm:w-[320px] lg:w-[380px] p-0 rounded-xl border shadow-lg" 
                align="start"
                sideOffset={4}
              >
                {/* Search input header */}
                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        console.log('Tablet search input changed:', e.target.value);
                        handleSearchInputChange(e.target.value);
                      }}
                      placeholder="Enter a destination"
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Suggestions list */}
                <div className="max-h-[200px] sm:max-h-[240px] lg:max-h-[280px] overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    <div className="py-2">
                      {filteredLocations.map((item, index) => (
                        <button
                          key={`tablet-${item.type}-${item.value}-${index}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Tablet suggestion clicked:', item);
                            handleLocationSelect(item);
                          }}
                          onMouseDown={(e) => {
                            // Prevent blur event from closing popover before click
                            e.preventDefault();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                            location === item.value && "bg-blue-50 dark:bg-blue-950"
                          )}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                            {item.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {location === item.value && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="py-8 px-4 text-center">
                      <div className="text-gray-500 mb-2">No locations found for "{searchQuery}"</div>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setIsTyping(false);
                          setLocation('');
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      {addisAbabaAreas.slice(0, 4).map((area, index) => (
                        <button
                          key={`tablet-area-${area}-${index}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLocationSelect({
                              type: 'area',
                              value: area.toLowerCase(),
                              label: area,
                              emoji: '🏙️',
                              description: 'Popular area in Addis Ababa',
                              score: 90 - index
                            });
                          }}
                          onMouseDown={(e) => {
                            // Prevent blur event from closing popover before click
                            e.preventDefault();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                            🏙️
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {area}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              Popular area in Addis Ababa
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Quick actions */}
                <div className="border-t p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        console.log('Near me clicked');
                        getCurrentLocation();
                      }}
                      disabled={useCurrentLocation}
                      className="flex items-center gap-2 p-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      <Navigation className="h-4 w-4" />
                      Near me
                    </button>
                    <button
                      onClick={() => {
                        console.log('All areas clicked');
                        handleLocationSelect({ 
                          type: 'special', 
                          value: 'all', 
                          label: 'All Areas', 
                          emoji: '🌍', 
                          description: 'Browse all locations', 
                          score: 100 
                        });
                      }}
                      className="flex items-center gap-2 p-2 text-sm rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      <span>🌍</span>
                      All areas
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Date Selector */}
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 justify-start text-left font-normal border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Dates</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {dateRange?.from && dateRange?.to 
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : 'Add dates'
                      }
                    </span>
                  </div>
                  <CalendarIcon className="ml-auto h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border shadow-lg" align="start">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-t-xl">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Select Your Stay
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Choose check-in and check-out dates</p>
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => date < new Date()}
                  numberOfMonths={1}
                  initialFocus
                  className="p-4 pointer-events-auto rounded-xl"
                  classNames={{
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                    day_range_middle: "bg-blue-100 text-blue-800",
                    day_today: "bg-blue-50 text-blue-700 font-semibold"
                  }}
                />
                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                  {dateRange?.from && dateRange?.to && (
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} nights selected
                      </span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        
          {/* Second row: Guests + Search Button */}
          <div className="grid grid-cols-2 gap-2">
            {/* Guests Selector */}
            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 justify-start text-left font-normal border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Guests</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {adults + children} guest{adults + children !== 1 ? 's' : ''} • {rooms} room{rooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Users className="ml-auto h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 sm:w-72 lg:w-80 p-0 rounded-xl border shadow-lg" align="start">
                {/* Header */}
                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Guests & Rooms</span>
                  </div>
                </div>
                
                {/* Guest controls */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <div className="text-sm font-medium">Adults</div>
                        <div className="text-xs text-gray-500">13+</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        disabled={adults >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👶</span>
                      <div>
                        <div className="text-sm font-medium">Children</div>
                        <div className="text-xs text-gray-500">2-12</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setChildren(Math.min(8, children + 1))}
                        disabled={children >= 8}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏠</span>
                      <div>
                        <div className="text-sm font-medium">Rooms</div>
                        <div className="text-xs text-gray-500">Separate</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{rooms}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        disabled={rooms >= 5}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-800 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {adults + children} guest{adults + children !== 1 ? 's' : ''} • {rooms} room{rooms !== 1 ? 's' : ''}
                  </span>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <div className="relative group">
              <Button 
                onClick={handleSubmit}
                className="relative z-10 h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg font-medium group-hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
              >
                <Search className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Search
                {/* Animated glow ring */}
                <span className="absolute inset-0 rounded-xl border-2 border-blue-300 animate-ping opacity-0 group-hover:opacity-75 transition-opacity duration-500"></span>
                {/* Soft glow background */}
                <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 blur-lg opacity-0 group-hover:opacity-50 transition-all duration-700 scale-110"></span>
                {/* Secondary pulse ring */}
                <span className="absolute inset-0 rounded-xl bg-blue-400/20 scale-100 group-hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-800 animate-pulse"></span>
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Mobile destination selector */}
        {viewport === 'mobile' && (
        <div className="space-y-2">
          {/* Mobile Destination Selector - With Direct Typing */}
          <div className="relative">
            <div className="absolute top-1 left-3 z-10">
              <span className="text-[10px] xs:text-xs font-medium text-gray-600 dark:text-gray-400">Where</span>
            </div>
            <Input
              value={getDisplayText()}
              onChange={(e) => {
                handleSearchInputChange(e.target.value);
                if (!locationOpen) setLocationOpen(true);
              }}
              onFocus={() => {
                setLocationOpen(true);
                setIsTyping(true);
              }}
              placeholder="Enter a destination"
              className="w-full h-10 xs:h-12 pt-5 xs:pt-6 pb-1 px-3 pr-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg xs:rounded-xl text-xs xs:text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 xs:h-4 w-3.5 xs:w-4 text-gray-400" />
          </div>
          
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <div className="hidden" />
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-[260px] xs:w-[280px] sm:w-[320px] p-0 rounded-xl border shadow-lg" 
              align="start"
              sideOffset={4}
            >
              {/* Header with search input for mobile */}
              <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      handleSearchInputChange(e.target.value);
                    }}
                    placeholder="Type to search destinations..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Filtered suggestions list */}
              <div className="max-h-[180px] xs:max-h-[200px] sm:max-h-[240px] overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  <div className="py-2">
                    {filteredLocations.map((item, index) => (
                      <button
                        key={`mobile-${item.type}-${item.value}-${index}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLocationSelect(item);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          location === item.value && "bg-blue-50 dark:bg-blue-950"
                        )}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {location === item.value && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="py-8 px-4 text-center">
                    <div className="text-gray-500 mb-2">No locations found for "{searchQuery}"</div>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setIsTyping(false);
                        setLocation('');
                      }}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    {generateSearchSuggestions('', false).slice(0, 6).map((item, index) => (
                      <button
                        key={`mobile-default-${item.type}-${item.value}-${index}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLocationSelect(item);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          location === item.value && "bg-blue-50 dark:bg-blue-950"
                        )}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {location === item.value && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quick actions */}
              <div className="border-t p-3 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      getCurrentLocation();
                    }}
                    disabled={useCurrentLocation}
                    className="flex items-center gap-2 p-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    <Navigation className="h-4 w-4" />
                    Near me
                  </button>
                  <button
                    onClick={() => {
                      handleLocationSelect({ 
                        type: 'special', 
                        value: 'all', 
                        label: 'All Areas', 
                        emoji: '🌍', 
                        description: 'Browse all locations', 
                        score: 100 
                      });
                    }}
                    className="flex items-center gap-2 p-2 text-sm rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    <span>🌍</span>
                    All areas
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Mobile date and guests selectors */}
          <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
          {/* Mobile Date Selector */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 xs:h-12 justify-start text-left font-normal border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg xs:rounded-xl"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] xs:text-xs font-medium text-gray-600 dark:text-gray-400">Dates</span>
                  <span className="text-xs xs:text-sm text-gray-900 dark:text-gray-100 truncate max-w-[100px] xs:max-w-full">
                    {dateRange?.from && dateRange?.to 
                      ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                      : 'Add dates'
                    }
                  </span>
                </div>
                <CalendarIcon className="ml-auto h-3.5 xs:h-4 w-3.5 xs:w-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl border shadow-lg" align="start">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-t-xl">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Select Your Stay
                </h3>
                <p className="text-sm text-gray-600 mt-1">Choose check-in and check-out dates</p>
              </div>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={(date) => date < new Date()}
                numberOfMonths={1}
                initialFocus
                className="p-4 pointer-events-auto rounded-xl"
                classNames={{
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                  day_range_middle: "bg-blue-100 text-blue-800",
                  day_today: "bg-blue-50 text-blue-700 font-semibold"
                }}
              />
              <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                {dateRange?.from && dateRange?.to && (
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} nights selected
                    </span>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Mobile Guests Selector */}
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 xs:h-12 justify-start text-left font-normal border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg xs:rounded-xl"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] xs:text-xs font-medium text-gray-600 dark:text-gray-400">Guests</span>
                  <span className="text-xs xs:text-sm text-gray-900 dark:text-gray-100 truncate max-w-[100px] xs:max-w-full">
                    {adults + children} guest{adults + children !== 1 ? 's' : ''} • {rooms} room{rooms !== 1 ? 's' : ''}
                  </span>
                </div>
                <Users className="ml-auto h-3.5 xs:h-4 w-3.5 xs:w-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 xs:w-64 sm:w-72 p-0 rounded-xl border shadow-lg" align="start">
              {/* Header */}
              <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Guests & Rooms</span>
                </div>
              </div>
              
              {/* Guest controls */}
              <div className="p-3 xs:p-4 space-y-3 xs:space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="text-sm font-medium">Adults</div>
                      <div className="text-xs text-gray-500">13+</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{adults}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      disabled={adults >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👶</span>
                    <div>
                      <div className="text-sm font-medium">Children</div>
                      <div className="text-xs text-gray-500">2-12</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{children}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setChildren(Math.min(8, children + 1))}
                      disabled={children >= 8}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏠</span>
                    <div>
                      <div className="text-sm font-medium">Rooms</div>
                      <div className="text-xs text-gray-500">Separate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      disabled={rooms <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{rooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setRooms(Math.min(5, rooms + 1))}
                      disabled={rooms >= 5}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Summary */}
              <div className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-800 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {adults + children} guest{adults + children !== 1 ? 's' : ''} • {rooms} room{rooms !== 1 ? 's' : ''}
                </span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        </div>
        )}

        {/* Mobile search button */}
        {viewport === 'mobile' && (
        <div className="flex justify-center mt-1.5 xs:mt-2">
          <div className="relative group w-full">
            <Button 
              onClick={handleSubmit} 
              className="relative z-10 w-full h-10 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white shadow-lg text-sm xs:text-base font-medium transition-all duration-300 active:scale-95 hover:shadow-2xl hover:shadow-blue-500/30 active:shadow-2xl active:shadow-blue-600/40"
            >
              <Search className="h-4 xs:h-5 w-4 xs:w-5 mr-1.5 xs:mr-2 transition-transform duration-300 active:scale-110" />
              Search Properties
              {/* Mobile touch glow ring - shows on active/touch */}
              <span className="absolute inset-0 rounded-lg xs:rounded-xl border-2 border-blue-300 opacity-0 active:opacity-75 transition-opacity duration-200 animate-ping"></span>
              {/* Soft glow background for mobile */}
              <span className="absolute inset-0 -z-10 rounded-lg xs:rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 blur-lg opacity-0 active:opacity-50 hover:opacity-40 transition-all duration-500 scale-105"></span>
              {/* Secondary pulse effect on touch */}
              <span className="absolute inset-0 rounded-lg xs:rounded-xl bg-blue-400/20 scale-100 active:scale-105 opacity-0 active:opacity-100 transition-all duration-600 animate-pulse"></span>
            </Button>
          </div>
        </div>
        )}
      </div>

      {/* Search Filters Modal */}
      <SearchFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </Card>
  );
}
