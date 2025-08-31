import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseHelpers } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { generateSearchSuggestions, type SearchSuggestion } from '@/utils/searchUtils';
import { SearchData } from '@/components/SearchForm';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';

interface EditableSearchBarProps {
  searchData: SearchData;
  onSearch: (data: SearchData) => void;
  onFiltersToggle: () => void;
  activeFilterCount: number;
  isFiltersOpen: boolean;
  resultCount: number;
}

export default function EditableSearchBar({
  searchData,
  onSearch,
  onFiltersToggle,
  activeFilterCount,
  isFiltersOpen,
  resultCount
}: EditableSearchBarProps) {
  const navigate = useNavigate();
  const [editValues, setEditValues] = useState(searchData);
  const [locationQuery, setLocationQuery] = useState(searchData.location || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(locationQuery);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateType, setSelectedDateType] = useState<'checkIn' | 'checkOut' | null>(null);

  // Update edit values when search data changes
  useEffect(() => {
    setEditValues(searchData);
    setLocationQuery(searchData.location || '');
  }, [searchData, setEditValues, setLocationQuery]);

  // Debounce the query for smoother suggestions
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(locationQuery), 200);
    return () => clearTimeout(timer);
  }, [locationQuery, setDebouncedQuery]);

  // Load and persist recent searches
  useEffect(() => {
    try {
      const raw = // Get from Supabase saved searches instead
    user ? await supabaseHelpers.getSavedSearches(user.id) : [];
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  const persistRecentSearch = (value: string) => {
    if (!value) return;
    const next = [value, ...recentSearches.filter((v) => v.toLowerCase() !== value.toLowerCase())].slice(0, 6);
    setRecentSearches(next);
    try {
      // Save to Supabase instead
    if (user && searchQuery) {
      await supabaseHelpers.saveSearch(user.id, { 
        query: searchQuery, 
        location: searchLocation,
        timestamp: Date.now() 
      });
    }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  };

  // Generate location suggestions (debounced)
  const locationSuggestions = useMemo(
    () => generateSearchSuggestions(debouncedQuery, true).slice(0, 8),
    [debouncedQuery]
  );

  // Focus helper when entering edit mode elsewhere in the app
  const handleEdit = () => {
    setTimeout(() => locationInputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    const updatedData = {
      ...editValues,
      location: locationQuery
    };
    // save to recent
    try {
      const trimmed = (updatedData.location || '').trim();
      if (trimmed) {
        const raw = // Get from Supabase saved searches instead
    user ? await supabaseHelpers.getSavedSearches(user.id) : [];
        const list: string[] = raw ? JSON.parse(raw) : [];
        const next = [trimmed, ...list.filter((v) => v.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
        // Save to Supabase instead
    if (user && searchQuery) {
      await supabaseHelpers.saveSearch(user.id, { 
        query: searchQuery, 
        location: searchLocation,
        timestamp: Date.now() 
      });
    }
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
    
    // Build URL params
    const params = new URLSearchParams();
    if (updatedData.location) params.set('location', updatedData.location);
    if (updatedData.checkIn) params.set('checkIn', updatedData.checkIn.toISOString());
    if (updatedData.checkOut) params.set('checkOut', updatedData.checkOut.toISOString());
    if (updatedData.guests) params.set('guests', updatedData.guests.toString());
    if (updatedData.type) params.set('type', updatedData.type);

    // Update URL and trigger search
    navigate(`/search?${params.toString()}`, { replace: true });
    onSearch(updatedData);
    setShowLocationSuggestions(false);
  };

  const handleCancel = () => {
    setEditValues(searchData);
    setLocationQuery(searchData.location || '');
    setShowLocationSuggestions(false);
  };

  const handleLocationSelect = (suggestion: SearchSuggestion) => {
    setLocationQuery(suggestion.label);
    // Close with a slight delay to prevent click conflicts
    setTimeout(() => {
      setShowLocationSuggestions(false);
    }, 150);
    
    // persist
    try {
      const trimmed = (suggestion.label || '').trim();
      if (trimmed) {
        const raw = // Get from Supabase saved searches instead
    user ? await supabaseHelpers.getSavedSearches(user.id) : [];
        const list: string[] = raw ? JSON.parse(raw) : [];
        const next = [trimmed, ...list.filter((v) => v.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
        // Save to Supabase instead
    if (user && searchQuery) {
      await supabaseHelpers.saveSearch(user.id, { 
        query: searchQuery, 
        location: searchLocation,
        timestamp: Date.now() 
      });
    }
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDateRange = () => {
    try {
      if (!searchData.checkIn && !searchData.checkOut) return 'Any dates';
      if (searchData.checkIn && searchData.checkOut) {
        return `${format(searchData.checkIn, 'MMM d')} - ${format(searchData.checkOut, 'MMM d')}`;
      }
      if (searchData.checkIn) {
        return `From ${format(searchData.checkIn, 'MMM d')}`;
      }
      return 'Any dates';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Any dates';
    }
  };

  const handleDateSelect = (date: Date) => {
    const newData = { ...searchData };
    
    if (!searchData.checkIn || (searchData.checkIn && searchData.checkOut) || selectedDateType === 'checkIn') {
      // Starting fresh or explicitly selecting check-in
      newData.checkIn = date;
      newData.checkOut = undefined;
      setSelectedDateType('checkOut');
    } else if (date < searchData.checkIn) {
      // Selected date is before check-in, swap them
      newData.checkIn = date;
      newData.checkOut = searchData.checkIn;
      setSelectedDateType(null);
    } else {
      // Normal check-out selection
      newData.checkOut = date;
      setSelectedDateType(null);
    }
    
    setEditValues(newData);
    onSearch(newData);
    
    // Auto-close if both dates are selected
    if (newData.checkIn && newData.checkOut) {
      setTimeout(() => setIsDateOpen(false), 500);
    }
  };

  const getDatePresets = () => {
    const today = new Date();
    return [
      {
        label: 'Tonight',
        icon: Moon,
        checkIn: today,
        checkOut: addDays(today, 1),
        gradient: 'from-purple-500 to-indigo-600'
      },
      {
        label: 'Tomorrow',
        icon: Sunrise,
        checkIn: addDays(today, 1),
        checkOut: addDays(today, 2),
        gradient: 'from-orange-500 to-pink-600'
      },
      {
        label: 'This Weekend',
        icon: Sun,
        checkIn: addDays(today, (6 - today.getDay()) % 7),
        checkOut: addDays(today, (6 - today.getDay()) % 7 + 2),
        gradient: 'from-emerald-500 to-teal-600'
      },
      {
        label: 'Next Weekend',
        icon: Sunset,
        checkIn: addDays(today, (6 - today.getDay()) % 7 + 7),
        checkOut: addDays(today, (6 - today.getDay()) % 7 + 9),
        gradient: 'from-blue-500 to-cyan-600'
      }
    ];
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days from previous month
    const startDay = start.getDay();
    const prevMonthDays = [];
    for (let i = 0; i < startDay; i++) {
      prevMonthDays.unshift(addDays(start, -(i + 1)));
    }
    
    // Add padding days from next month
    const totalCells = Math.ceil((days.length + startDay) / 7) * 7;
    const nextMonthDays = [];
    for (let i = days.length + startDay; i < totalCells; i++) {
      nextMonthDays.push(addDays(end, i - days.length - startDay + 1));
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const isDateInRange = (date: Date) => {
    if (!searchData.checkIn || !searchData.checkOut) return false;
    return date >= searchData.checkIn && date <= searchData.checkOut;
  };

  const isDateSelected = (date: Date) => {
    return (searchData.checkIn && isSameDay(date, searchData.checkIn)) ||
           (searchData.checkOut && isSameDay(date, searchData.checkOut));
  };

  // Inline search bar UX (always visible on results page)

    return (
    <div className="w-full bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToHome} className="shrink-0 h-8 w-8 p-0">
                  <ArrowLeft className="h-3 w-3" />
                </Button>
          
          {/* Main search input */}
          <div className="relative flex-1">
            <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                    <Input
                      ref={locationInputRef}
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        setShowLocationSuggestions(true);
                setFocusedSuggestionIndex(-1);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
              onKeyDown={(e) => {
                const maxIndex = locationSuggestions.length - 1;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setShowLocationSuggestions(true);
                  setFocusedSuggestionIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setShowLocationSuggestions(true);
                  setFocusedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
                } else if (e.key === 'Enter') {
                  if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex <= maxIndex) {
                    e.preventDefault();
                    const sug = locationSuggestions[focusedSuggestionIndex];
                    if (sug) handleLocationSelect(sug);
                  } else {
                    handleSave();
                  }
                } else if (e.key === 'Escape') {
                  setShowLocationSuggestions(false);
                  setFocusedSuggestionIndex(-1);
                }
              }}
              placeholder="Where are you going?"
              className="h-8 pl-8 pr-3 text-sm rounded-md border border-gray-200 focus:border-blue-500 bg-white"
            />
            
            {/* Suggestions dropdown */}
                  <AnimatePresence>
              {showLocationSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto"
                >
                  {recentSearches.length > 0 && !locationQuery.trim() && (
                    <div className="px-3 pt-3 pb-2 text-xs text-muted-foreground">Recent searches</div>
                  )}
                  {recentSearches.length > 0 && !locationQuery.trim() && (
                    <div className="pb-2">
                      {recentSearches.map((label, index) => (
                        <button
                          key={`recent-inline-${label}-${index}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLocationSelect({ label, value: label, type: 'special', emoji: '📍', score: 100, description: '' });
                          }}
                          onMouseDown={(e) => {
                            // Prevent blur event from closing suggestions before click
                            e.preventDefault();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{label}</span>
                        </button>
                      ))}
                      <div className="px-4 py-2">
                        <Button variant="ghost" size="sm" onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }}>Clear recent</Button>
                      </div>
                      <div className="h-px bg-border" />
                    </div>
                  )}
                        {locationSuggestions.map((suggestion, index) => (
                          <button
                      key={`inline-${suggestion.value}-${index}`}
                      onMouseEnter={() => setFocusedSuggestionIndex(index)}
                      onMouseLeave={() => setFocusedSuggestionIndex(-1)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLocationSelect(suggestion);
                            }}
                            onMouseDown={(e) => {
                              // Prevent blur event from closing suggestions before click
                              e.preventDefault();
                            }}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${focusedSuggestionIndex === index ? 'bg-muted' : 'hover:bg-muted'}`}
                          >
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <div className="font-medium">{suggestion.label}</div>
                              {suggestion.description && (
                                <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                              )}
                            </div>
                          </button>
                        ))}
                  {locationSuggestions.length === 0 && locationQuery.trim() !== '' && (
                    <div className="px-4 py-6 text-sm text-muted-foreground">No matches. Press Enter to search "{locationQuery}"</div>
                  )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

          {/* Date selector */}
          <Popover open={isDateOpen} onOpenChange={(open) => {
            setIsDateOpen(open);
            if (!open) {
              setSelectedDateType(null);
            }
          }}>
            <PopoverTrigger asChild>
              <Button aria-label="Edit dates" variant="outline" className="h-8 px-3 justify-start text-left font-normal min-w-[120px] text-sm group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-200">
                <Calendar className="mr-1 h-3 w-3 text-blue-500 group-hover:text-blue-600" />
                <span className="truncate">{formatDateRange()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="bg-white rounded-lg shadow-2xl border-0 overflow-hidden min-w-[420px]">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      <span className="font-semibold text-lg">Select Dates</span>
                    </div>
                    <button 
                      onClick={() => setIsDateOpen(false)}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded ${selectedDateType === 'checkIn' ? 'bg-white/20' : ''}`}>
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span>Check-in: {searchData.checkIn ? format(searchData.checkIn, 'MMM d, yyyy') : 'Select date'}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded ${selectedDateType === 'checkOut' ? 'bg-white/20' : ''}`}>
                      <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                      <span>Check-out: {searchData.checkOut ? format(searchData.checkOut, 'MMM d, yyyy') : 'Select date'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  {/* Quick Presets Sidebar */}
                  <div className="w-44 bg-gray-50 border-r">
                    <div className="p-4">
                      <h4 className="font-medium text-gray-700 mb-3 text-sm">Quick Select</h4>
                      <div className="space-y-2">
                        {getDatePresets().map((preset, index) => {
                          const Icon = preset.icon;
                          return (
                            <motion.button
                              key={preset.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => {
                                const newData = { ...searchData, checkIn: preset.checkIn, checkOut: preset.checkOut };
                                setEditValues(newData);
                                onSearch(newData);
                                setTimeout(() => setIsDateOpen(false), 300);
                              }}
                              className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:shadow-md group bg-gradient-to-r ${preset.gradient} text-white hover:scale-105`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium text-sm">{preset.label}</span>
                              </div>
                              <div className="text-xs opacity-90">
                                {format(preset.checkIn, 'MMM d')} - {format(preset.checkOut, 'MMM d')}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            const newData = { ...searchData, checkIn: undefined, checkOut: undefined };
                            setEditValues(newData);
                            onSearch(newData);
                            setSelectedDateType(null);
                          }}
                          className="w-full p-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        >
                          🗑️ Clear dates
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="flex-1 p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((date, index) => {
                        const isCurrentMonth = isSameMonth(date, currentMonth);
                        const isSelected = isDateSelected(date);
                        const isInRange = isDateInRange(date);
                        const isTodayDate = isToday(date);
                        const isCheckIn = searchData.checkIn && isSameDay(date, searchData.checkIn);
                        const isCheckOut = searchData.checkOut && isSameDay(date, searchData.checkOut);
                        const isPast = date < new Date().setHours(0, 0, 0, 0);

                        return (
                          <motion.button
                            key={date.toISOString()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            onClick={() => !isPast && handleDateSelect(date)}
                            disabled={isPast}
                            className={`
                              h-10 rounded-lg text-sm font-medium transition-all duration-200 relative
                              ${
                                isPast
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : isCurrentMonth
                                  ? 'text-gray-700 hover:bg-blue-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }
                              ${
                                isSelected
                                  ? isCheckIn
                                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                                    : isCheckOut
                                    ? 'bg-pink-500 text-white shadow-lg scale-105'
                                    : 'bg-blue-500 text-white shadow-lg scale-105'
                                  : ''
                              }
                              ${
                                isInRange && !isSelected
                                  ? 'bg-blue-100 text-blue-700'
                                  : ''
                              }
                              ${
                                isTodayDate && !isSelected
                                  ? 'ring-2 ring-blue-300 bg-blue-50'
                                  : ''
                              }
                            `}
                          >
                            {format(date, 'd')}
                            {isTodayDate && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-600">
                    {searchData.checkIn && searchData.checkOut
                      ? `${Math.ceil((searchData.checkOut.getTime() - searchData.checkIn.getTime()) / (1000 * 60 * 60 * 24))} night${Math.ceil((searchData.checkOut.getTime() - searchData.checkIn.getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}`
                      : 'Select your travel dates'
                    }
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setIsDateOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Guest selector */}
          <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
            <PopoverTrigger asChild>
              <Button aria-label="Edit guests" variant="outline" className="h-8 px-3 justify-start text-left font-normal min-w-[100px] text-sm">
                <Users className="mr-1 h-3 w-3" />
                <span>{searchData.guests || 2} guests</span>
                  </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="p-4">
                <div className="space-y-4">
        <div className="flex items-center justify-between">
                    <span className="font-medium">Guests</span>
                    <div className="flex items-center space-x-2">
            <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newData = { ...searchData, guests: Math.max(1, (searchData.guests || 2) - 1) };
                          setEditValues(newData);
                          onSearch(newData);
                        }}
                      >
                        -
            </Button>
                      <span className="w-8 text-center">{searchData.guests || 2}</span>
              <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newData = { ...searchData, guests: (searchData.guests || 2) + 1 };
                          setEditValues(newData);
                          onSearch(newData);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      const newData = { ...searchData, guests: 2 };
                      setEditValues(newData);
                      onSearch(newData);
                      setIsGuestsOpen(false);
                    }}>Reset guests</Button>
                    <Button size="sm" onClick={() => setIsGuestsOpen(false)}>Done</Button>
                  </div>
                </div>
            </div>
            </PopoverContent>
          </Popover>

          {/* Single filter button */}
            <Button
            variant={isFiltersOpen ? 'default' : 'outline'}
            className="h-8 px-3 relative text-sm"
              onClick={onFiltersToggle}
            >
            <SlidersHorizontal className="mr-1 h-3 w-3" />
            Filters
              {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
              </span>
              )}
            </Button>
        </div>

        {/* Quick edit chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2"
            onClick={() => locationInputRef.current?.focus()}
            title="Edit location"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {locationQuery || 'Add location'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2"
            onClick={() => setIsDateOpen(true)}
            title="Edit dates"
          >
            <Calendar className="h-3 w-3 mr-1" /> {formatDateRange()}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2"
            onClick={() => setIsGuestsOpen(true)}
            title="Edit guests"
          >
            <Users className="h-3 w-3 mr-1" /> {searchData.guests || 2}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => {
              const newData = { ...searchData, checkIn: undefined, checkOut: undefined, guests: 2 };
              setEditValues(newData);
              onSearch(newData);
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
