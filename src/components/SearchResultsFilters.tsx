import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  Star,
  DollarSign,
  Users,
  Bed,
  Bath,
  Car,
  Wifi,
  Coffee,
  Waves,
  Dumbbell,
  PawPrint,
  Utensils,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Home,
  Building,
  TreePine,
  Zap,
  Snowflake,
  Tv,
  Shirt,
  UtensilsCrossed,
  Gamepad2,
  Baby,
  Accessibility,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FilterOptions {
  priceRange: [number, number];
  rating: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  propertyTypes: string[];
  amenities: string[];
  features: string[];
  accessibility: string[];
  policies: string[];
  instantBook: boolean;
  superhost: boolean;
  verified: boolean;
  freeWifi: boolean;
  freeParking: boolean;
  allowsPets: boolean;
  distance: number;
  checkInTime: string;
  cancellationPolicy: string;
}

interface SearchResultsFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount: number;
}

const propertyTypes = [
  { id: 'hotel', label: 'Hotel', icon: Building },
  { id: 'apartment', label: 'Apartment', icon: Home },
  { id: 'villa', label: 'Villa', icon: TreePine },
  { id: 'guesthouse', label: 'Guesthouse', icon: Home },
  { id: 'resort', label: 'Resort', icon: TreePine },
  { id: 'hostel', label: 'Hostel', icon: Building },
  { id: 'bnb', label: 'B&B', icon: Home },
  { id: 'lodge', label: 'Lodge', icon: TreePine }
];

const amenities = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Free Parking', icon: Car },
  { id: 'pool', label: 'Pool', icon: Waves },
  { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'spa', label: 'Spa', icon: Waves },
  { id: 'pets', label: 'Pet-friendly', icon: PawPrint },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'heating', label: 'Heating', icon: Zap },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { id: 'laundry', label: 'Laundry', icon: Shirt },
  { id: 'entertainment', label: 'Entertainment', icon: Gamepad2 }
];

const features = [
  { id: 'balcony', label: 'Balcony/Terrace', icon: Home },
  { id: 'garden', label: 'Garden', icon: TreePine },
  { id: 'mountain_view', label: 'Mountain View', icon: MapPin },
  { id: 'city_view', label: 'City View', icon: Building },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'family_friendly', label: 'Family-friendly', icon: Baby },
  { id: 'business_center', label: 'Business Center', icon: Building },
  { id: 'conference_rooms', label: 'Conference Rooms', icon: Building }
];

const accessibilityOptions = [
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: Accessibility },
  { id: 'elevator', label: 'Elevator', icon: Building },
  { id: 'accessible_bathroom', label: 'Accessible Bathroom', icon: Bath },
  { id: 'accessible_parking', label: 'Accessible Parking', icon: Car }
];

export default function SearchResultsFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultCount
}: SearchResultsFiltersProps) {
  const { t } = useTranslation();
  const { currentCurrency, currencies, formatPrice } = useCurrency();
  const prefersReducedMotion = useReducedMotion();
  const disableAnimations = true; // force-disable animations per user request

  // Local working copy to avoid re-rendering the whole results list on every tiny change
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [minPrice, setMinPrice] = useState(localFilters.priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(localFilters.priceRange[1]);
  const lastScrollRef = useRef<number>(0);
  useEffect(() => {
    if (isOpen) {
      try { lastScrollRef.current = window.scrollY; } catch (error) {
        // Handle scroll position access error
        console.debug('Scroll position error:', error);
      }
    }
  }, [isOpen]);

  // Keep local copy in sync when parent changes from outside
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    setMinPrice(localFilters.priceRange[0]);
    setMaxPrice(localFilters.priceRange[1]);
  }, [localFilters.priceRange]);

  // Smooth, debounced apply to parent
  const debounceTimer = useRef<number | null>(null);
  const scheduleApply = useCallback((next: FilterOptions) => {
    setLocalFilters(next);
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      onFiltersChange(next);
    }, 250);
  }, [onFiltersChange]);

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    property: true,
    rooms: false,
    amenities: false,
    features: false,
    accessibility: false,
    policies: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const updateFilter = (key: keyof FilterOptions, value: string | number | boolean | string[]) => {
    scheduleApply({
      ...localFilters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 500],
      rating: 0,
      guests: 1,
      bedrooms: 0,
      bathrooms: 0,
      propertyTypes: [],
      amenities: [],
      features: [],
      accessibility: [],
      policies: [],
      instantBook: false,
      superhost: false,
      verified: false,
      freeWifi: false,
      freeParking: false,
      allowsPets: false,
      distance: 50,
      checkInTime: 'any',
      cancellationPolicy: 'any'
    };
    scheduleApply(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 500) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.guests > 1) count++;
    if (localFilters.bedrooms > 0) count++;
    if (localFilters.bathrooms > 0) count++;
    if (localFilters.propertyTypes.length > 0) count++;
    if (localFilters.amenities.length > 0) count++;
    if (localFilters.features.length > 0) count++;
    if (localFilters.accessibility.length > 0) count++;
    if (localFilters.instantBook || localFilters.superhost || localFilters.verified) count++;
    if (localFilters.freeWifi || localFilters.freeParking || localFilters.allowsPets) count++;
    if (localFilters.distance < 50) count++;
    if (localFilters.checkInTime !== 'any') count++;
    if (localFilters.cancellationPolicy !== 'any') count++;
    return count;
  };

  const closeAndRestore = () => {
    try {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo({ top: lastScrollRef.current });
      // defer restore to next tick
      setTimeout(() => { root.style.scrollBehavior = prev; }, 0);
    } catch (error) {
      // Handle scroll restoration error
      console.debug('Scroll restoration error:', error);
    }
    onClose();
  };

  const FilterSection = ({ 
    title, 
    children, 
    sectionKey, 
    icon: Icon 
  }: { 
    title: string; 
    children: React.ReactNode; 
    sectionKey: string; 
    icon?: any 
  }) => {
    const isExpanded = expandedSections[sectionKey as keyof typeof expandedSections];
    
    return (
      <motion.div
        initial={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { opacity: 0, y: 8 })}
        animate={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { opacity: 1, y: 0 })}
        transition={{ duration: 0 }}
        className="border-b border-border last:border-b-0"
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="font-medium">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { height: 0, opacity: 0 })}
              animate={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { height: 'auto', opacity: 1 })}
              exit={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { height: 0, opacity: 0 })}
              transition={{ duration: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const CheckboxGroup = ({ items, selected, onChange, max = 4 }: {
    items: Array<{ id: string; label: string; icon?: any }>;
    selected: string[];
    onChange: (values: string[]) => void;
    max?: number;
  }) => {
    const [showAll, setShowAll] = useState(false);
    const displayItems = showAll ? items : items.slice(0, max);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            return (
              <label
                key={item.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selected.includes(item.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selected, item.id]);
                    } else {
                      onChange(selected.filter(id => id !== item.id));
                    }
                  }}
                />
                <div className="flex items-center gap-2 flex-1">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">{item.label}</span>
                </div>
              </label>
            );
          })}
        </div>
        
        {items.length > max && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="h-8 text-xs"
          >
            {showAll ? `Show Less` : `Show All ${items.length}`}
            <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { opacity: 0 })}
            animate={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { opacity: 1 })}
            exit={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { opacity: 0 })}
            onClick={closeAndRestore}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Filter Panel */}
          <motion.div
            initial={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { x: '-100%', opacity: 0 })}
            animate={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { x: 0, opacity: 1 })}
            exit={disableAnimations ? ({ } as unknown) : (prefersReducedMotion ? ({ } as unknown) : { x: '-100%', opacity: 0 })}
            transition={{ duration: 0 }}
            className={cn(
              "fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 overflow-hidden",
              "lg:relative lg:w-72 lg:h-auto lg:rounded-lg lg:border lg:shadow-sm"
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">{t('Filters')}</h2>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t('Clear')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeAndRestore}
                    className="h-8 w-8 p-0 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Comprehensive Compact Filter Design */}
            <div className="overflow-y-auto h-full pb-24 scroll-smooth">
              
              {/* Price Range - Enhanced */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-semibold text-sm">Price Per Night</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(Math.min(minPrice, maxPrice))} - {formatPrice(Math.max(minPrice, maxPrice))}
                  </div>
                </div>
                
                {/* Price Input Fields */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="relative">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencies[currentCurrency as keyof typeof currencies]?.symbol}</span>
                      <input
                        type="number"
                        value={minPrice || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10) || 0;
                          setMinPrice(Math.max(0, Math.min(value, maxPrice || 1000)));
                        }}
                        onBlur={() => updateFilter('priceRange', [minPrice, maxPrice])}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateFilter('priceRange', [minPrice, maxPrice]);
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="0"
                        min="0"
                        max="1000"
                        className="w-full h-9 pl-7 pr-3 text-sm rounded-md border border-border bg-background focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Maximum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencies[currentCurrency as keyof typeof currencies]?.symbol}</span>
                      <input
                        type="number"
                        value={maxPrice === 0 ? '' : maxPrice}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            setMaxPrice(0);
                          } else {
                            const value = parseInt(inputValue, 10);
                            if (!isNaN(value) && value >= 0) {
                              setMaxPrice(value);
                            }
                          }
                        }}
                        onBlur={() => {
                          // Set a default if user leaves it empty
                          if (maxPrice === 0) {
                            setMaxPrice(500);
                          }
                          updateFilter('priceRange', [minPrice, maxPrice || 500]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (maxPrice === 0) {
                              setMaxPrice(500);
                            }
                            updateFilter('priceRange', [minPrice, maxPrice || 500]);
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="500"
                        min="0"
                        className="w-full h-9 pl-7 pr-3 text-sm rounded-md border border-border bg-background focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Price Range Slider */}
                <div className="mb-4">
                  <div className="relative px-1">
                    {/* Slider Track */}
                    <div className="h-2 bg-muted rounded-full relative">
                      {/* Active Range */}
                      <div 
                        className="absolute h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                        style={{
                          left: `${(minPrice / 1000) * 100}%`,
                          right: `${100 - (maxPrice / 1000) * 100}%`
                        }}
                      />
                      
                      {/* Min Price Handle */}
                      <div
                        className="absolute w-4 h-4 bg-emerald-500 border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transform -translate-y-1 transition-all duration-150 hover:scale-110 active:scale-105"
                        style={{
                          left: `calc(${(minPrice / 1000) * 100}% - 8px)`,
                          top: '-4px'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement?.parentElement;
                          if (!slider) return;
                          
                          let isDragging = true;
                          let currentMinPrice = minPrice;
                          
                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            if (!isDragging) return;
                            
                            const rect = slider.getBoundingClientRect();
                            const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
                            const percentage = (x / rect.width) * 100;
                            const newMinPrice = Math.round((percentage / 100) * 1000);
                            
                            if (newMinPrice <= maxPrice) {
                              currentMinPrice = newMinPrice;
                              setMinPrice(newMinPrice);
                            }
                          };
                          
                          const handleMouseUp = () => {
                            isDragging = false;
                            updateFilter('priceRange', [currentMinPrice, maxPrice]);
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            document.body.style.userSelect = 'auto';
                          };
                          
                          document.body.style.userSelect = 'none';
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement?.parentElement;
                          if (!slider) return;
                          
                          let isDragging = true;
                          let currentMinPrice = minPrice;
                          
                          const handleTouchMove = (moveEvent: TouchEvent) => {
                            if (!isDragging) return;
                            
                            const rect = slider.getBoundingClientRect();
                            const x = Math.max(0, Math.min(rect.width, moveEvent.touches[0].clientX - rect.left));
                            const percentage = (x / rect.width) * 100;
                            const newMinPrice = Math.round((percentage / 100) * 1000);
                            
                            if (newMinPrice <= maxPrice) {
                              currentMinPrice = newMinPrice;
                              setMinPrice(newMinPrice);
                            }
                          };
                          
                          const handleTouchEnd = () => {
                            isDragging = false;
                            updateFilter('priceRange', [currentMinPrice, maxPrice]);
                            document.removeEventListener('touchmove', handleTouchMove);
                            document.removeEventListener('touchend', handleTouchEnd);
                          };
                          
                          document.addEventListener('touchmove', handleTouchMove);
                          document.addEventListener('touchend', handleTouchEnd);
                        }}
                      >
                        {/* Min Price Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                          {formatPrice(minPrice)}
                        </div>
                      </div>
                      
                      {/* Max Price Handle */}
                      <div
                        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transform -translate-y-1 transition-all duration-150 hover:scale-110 active:scale-105"
                        style={{
                          left: `calc(${(maxPrice / 1000) * 100}% - 8px)`,
                          top: '-4px'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement?.parentElement;
                          if (!slider) return;
                          
                          let isDragging = true;
                          let currentMaxPrice = maxPrice;
                          
                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            if (!isDragging) return;
                            
                            const rect = slider.getBoundingClientRect();
                            const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
                            const percentage = (x / rect.width) * 100;
                            const newMaxPrice = Math.round((percentage / 100) * 1000);
                            
                            if (newMaxPrice >= minPrice) {
                              currentMaxPrice = newMaxPrice;
                              setMaxPrice(newMaxPrice);
                            }
                          };
                          
                          const handleMouseUp = () => {
                            isDragging = false;
                            updateFilter('priceRange', [minPrice, currentMaxPrice]);
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            document.body.style.userSelect = 'auto';
                          };
                          
                          document.body.style.userSelect = 'none';
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement?.parentElement;
                          if (!slider) return;
                          
                          let isDragging = true;
                          let currentMaxPrice = maxPrice;
                          
                          const handleTouchMove = (moveEvent: TouchEvent) => {
                            if (!isDragging) return;
                            
                            const rect = slider.getBoundingClientRect();
                            const x = Math.max(0, Math.min(rect.width, moveEvent.touches[0].clientX - rect.left));
                            const percentage = (x / rect.width) * 100;
                            const newMaxPrice = Math.round((percentage / 100) * 1000);
                            
                            if (newMaxPrice >= minPrice) {
                              currentMaxPrice = newMaxPrice;
                              setMaxPrice(newMaxPrice);
                            }
                          };
                          
                          const handleTouchEnd = () => {
                            isDragging = false;
                            updateFilter('priceRange', [minPrice, currentMaxPrice]);
                            document.removeEventListener('touchmove', handleTouchMove);
                            document.removeEventListener('touchend', handleTouchEnd);
                          };
                          
                          document.addEventListener('touchmove', handleTouchMove);
                          document.addEventListener('touchend', handleTouchEnd);
                        }}
                      >
                        {/* Max Price Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                          {formatPrice(maxPrice)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Scale Labels */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{currencies[currentCurrency as keyof typeof currencies]?.symbol}0</span>
                      <span>{currencies[currentCurrency as keyof typeof currencies]?.symbol}250</span>
                      <span>{currencies[currentCurrency as keyof typeof currencies]?.symbol}500</span>
                      <span>{currencies[currentCurrency as keyof typeof currencies]?.symbol}750</span>
                      <span>{currencies[currentCurrency as keyof typeof currencies]?.symbol}1000+</span>
                    </div>
                  </div>
                </div>

                {/* Quick Price Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Quick Select</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['💰 Budget', `${currencies[currentCurrency as keyof typeof currencies]?.symbol}25-75`, 25, 75, 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'],
                      ['🏨 Standard', `${currencies[currentCurrency as keyof typeof currencies]?.symbol}75-150`, 75, 150, 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'],
                      ['⭐ Premium', `${currencies[currentCurrency as keyof typeof currencies]?.symbol}150-300`, 150, 300, 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'],
                      ['👑 Luxury', `${currencies[currentCurrency as keyof typeof currencies]?.symbol}300+`, 300, 600, 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100']
                    ].map(([label, range, min, max, styles]) => {
                      const isActive = localFilters.priceRange[0] === min && localFilters.priceRange[1] === max;
                      return (
                        <button
                          key={label as string}
                          onClick={() => {
                            setMinPrice(min as number);
                            setMaxPrice(max as number);
                            updateFilter('priceRange', [min, max]);
                          }}
                          className={cn(
                            "p-2.5 rounded-lg border text-left transition-all duration-200 hover:shadow-sm",
                            isActive 
                              ? `ring-2 ring-offset-1 ring-blue-500 shadow-sm` + ` ${  styles as string}`
                              : `border-border hover:bg-muted/50` + ` ${  styles as string}`
                          )}
                        >
                          <div className="text-xs font-semibold">{(label as string).split(' ')[0]} {(label as string).split(' ')[1]}</div>
                          <div className="text-xs opacity-80 mt-0.5">{range}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset Price Button */}
                {(minPrice > 0 || maxPrice < 500) && (
                  <div className="mt-3 pt-2 border-t border-border/30">
                    <button
                      onClick={() => {
                        setMinPrice(0);
                        setMaxPrice(500);
                        updateFilter('priceRange', [0, 500]);
                      }}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      ↻ Reset price range
                    </button>
                  </div>
                )}
              </div>

              {/* Property Type - Expandable */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-sm">Property Type</h3>
                  </div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, property: !prev.property }))}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    {expandedSections.property ? 'Less' : 'More'}
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      expandedSections.property ? "rotate-180" : ""
                    )} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['🏨', 'Hotel', 'hotel'],
                    ['🏠', 'Apartment', 'apartment'],
                    ['🏡', 'Villa', 'villa'],
                    ['🏖️', 'Resort', 'resort'],
                    ['🛏️', 'Hostel', 'hostel'],
                    ['🏘️', 'B&B', 'bnb']
                  ].map(([emoji, name, id]) => {
                    const isSelected = localFilters.propertyTypes.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const current = localFilters.propertyTypes;
                          const newTypes = isSelected ? current.filter(t => t !== id) : [...current, id];
                          updateFilter('propertyTypes', newTypes);
                        }}
                        className={cn(
                          "p-2 rounded border text-xs transition-colors",
                          isSelected ? "bg-purple-100 border-purple-500" : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="text-lg mb-1">{emoji}</div>
                        <div className="font-medium">{name}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Expandable Additional Property Types */}
                <AnimatePresence>
                  {expandedSections.property && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          ['🏰', 'Castle', 'castle'],
                          ['🏕️', 'Camping', 'camping'],
                          ['🚐', 'RV/Camper', 'rv'],
                          ['⛵', 'Boat', 'boat'],
                          ['🏠', 'Guesthouse', 'guesthouse'],
                          ['🏔️', 'Lodge', 'lodge'],
                          ['🏡', 'Cottage', 'cottage'],
                          ['🌴', 'Treehouse', 'treehouse'],
                          ['❄️', 'Chalet', 'chalet']
                        ].map(([emoji, name, id]) => {
                          const isSelected = localFilters.propertyTypes.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                const current = localFilters.propertyTypes;
                                const newTypes = isSelected ? current.filter(t => t !== id) : [...current, id];
                                updateFilter('propertyTypes', newTypes);
                              }}
                              className={cn(
                                "p-2 rounded border text-xs transition-colors",
                                isSelected ? "bg-purple-100 border-purple-500" : "border-border hover:bg-muted"
                              )}
                            >
                              <div className="text-lg mb-1">{emoji}</div>
                              <div className="font-medium">{name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Star Rating - Compact */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <h3 className="font-semibold text-sm">Star Rating</h3>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => {
                    const isSelected = localFilters.rating >= stars;
                    return (
                      <button
                        key={stars}
                        onClick={() => updateFilter('rating', isSelected && localFilters.rating === stars ? 0 : stars)}
                        className={cn(
                          "p-2 rounded border text-xs transition-colors",
                          isSelected ? "bg-yellow-100 border-yellow-500" : "border-border hover:bg-muted"
                        )}
                      >
                        {'⭐'.repeat(stars)}
                        <div className="font-medium">{stars}+</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Rating - Compact */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold text-sm">Guest Reviews</h3>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    [9.0, 'Excellent'],
                    [8.0, 'Very Good'],
                    [7.0, 'Good'],
                    [6.0, 'Pleasant']
                  ].map(([rating, label]) => {
                    const isSelected = localFilters.rating >= (rating as number);
                    return (
                      <button
                        key={rating as number}
                        onClick={() => updateFilter('rating', isSelected ? 0 : rating)}
                        className={cn(
                          "p-2 rounded border text-xs transition-colors",
                          isSelected ? "bg-orange-100 border-orange-500" : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="font-bold">{rating}+</div>
                        <div>{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities - Expandable */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">Amenities</h3>
                  </div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, amenities: !prev.amenities }))}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {expandedSections.amenities ? 'Less' : 'More'}
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      expandedSections.amenities ? "rotate-180" : ""
                    )} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    ['📶', 'WiFi', 'wifi'],
                    ['🅿️', 'Parking', 'parking'],
                    ['🏊', 'Pool', 'pool'],
                    ['💪', 'Gym', 'gym'],
                    ['🍳', 'Breakfast', 'breakfast'],
                    ['🧖‍♀️', 'Spa', 'spa']
                  ].map(([emoji, name, id]) => {
                    const isSelected = localFilters.amenities.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const current = localFilters.amenities;
                          const newAmenities = isSelected ? current.filter(a => a !== id) : [...current, id];
                          updateFilter('amenities', newAmenities);
                        }}
                        className={cn(
                          "p-1.5 rounded border text-xs transition-colors",
                          isSelected ? "bg-blue-100 border-blue-500" : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="text-sm mb-1">{emoji}</div>
                        <div className="font-medium">{name}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Expandable Additional Amenities */}
                <AnimatePresence>
                  {expandedSections.amenities && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        {[
                          ['❄️', 'AC', 'ac'],
                          ['🍽️', 'Restaurant', 'restaurant'],
                          ['🛁', 'Bathtub', 'bathtub'],
                          ['🔥', 'Heating', 'heating'],
                          ['📺', 'TV', 'tv'],
                          ['🧺', 'Laundry', 'laundry'],
                          ['🐕', 'Pet OK', 'pets'],
                          ['🏖️', 'Beach', 'beach'],
                          ['🚭', 'No Smoking', 'nonsmoking'],
                          ['🏎️', 'Valet', 'valet'],
                          ['🛎️', 'Concierge', 'concierge'],
                          ['🎯', 'Activities', 'activities'],
                          ['🎵', 'Live Music', 'music'],
                          ['🍷', 'Bar/Lounge', 'bar'],
                          ['☕', 'Coffee Shop', 'coffee'],
                          ['🛍️', 'Shopping', 'shopping'],
                          ['🚁', 'Helipad', 'helipad'],
                          ['⛳', 'Golf', 'golf'],
                          ['🎾', 'Tennis', 'tennis']
                        ].map(([emoji, name, id]) => {
                          const isSelected = localFilters.amenities.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                const current = localFilters.amenities;
                                const newAmenities = isSelected ? current.filter(a => a !== id) : [...current, id];
                                updateFilter('amenities', newAmenities);
                              }}
                              className={cn(
                                "p-1.5 rounded border text-xs transition-colors",
                                isSelected ? "bg-blue-100 border-blue-500" : "border-border hover:bg-muted"
                              )}
                            >
                              <div className="text-sm mb-1">{emoji}</div>
                              <div className="font-medium">{name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Room & Property Features - Expandable */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-sm">Room Features</h3>
                  </div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, features: !prev.features }))}
                    className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    {expandedSections.features ? 'Less' : 'More'}
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      expandedSections.features ? "rotate-180" : ""
                    )} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    ['🌊', 'Sea View', 'seaview'],
                    ['🏔️', 'Mountain View', 'mountain'],
                    ['🌆', 'City View', 'cityview'],
                    ['🏡', 'Balcony', 'balcony'],
                    ['🌳', 'Garden', 'garden'],
                    ['♿', 'Accessible', 'accessible']
                  ].map(([emoji, name, id]) => {
                    const isSelected = localFilters.features.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const current = localFilters.features;
                          const newFeatures = isSelected ? current.filter(f => f !== id) : [...current, id];
                          updateFilter('features', newFeatures);
                        }}
                        className={cn(
                          "p-1.5 rounded border text-xs transition-colors",
                          isSelected ? "bg-green-100 border-green-500" : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="text-sm mb-1">{emoji}</div>
                        <div className="font-medium">{name}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Expandable Additional Features */}
                <AnimatePresence>
                  {expandedSections.features && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        {[
                          ['🛝', 'Kids Area', 'kids'],
                          ['🏢', 'Business', 'business'],
                          ['🔇', 'Quiet', 'quiet'],
                          ['🌅', 'Sunrise View', 'sunrise'],
                          ['🌇', 'Sunset View', 'sunset'],
                          ['🎭', 'Entertainment', 'entertainment'],
                          ['🏛️', 'Historic', 'historic'],
                          ['🌺', 'Tropical', 'tropical'],
                          ['❄️', 'Ski Access', 'ski'],
                          ['🏖️', 'Beach Access', 'beachaccess'],
                          ['🚠', 'Cable Car', 'cablecar'],
                          ['🎪', 'Theme Park', 'themepark'],
                          ['🏺', 'Cultural', 'cultural'],
                          ['🎨', 'Art Gallery', 'artgallery'],
                          ['📚', 'Library', 'library']
                        ].map(([emoji, name, id]) => {
                          const isSelected = localFilters.features.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                const current = localFilters.features;
                                const newFeatures = isSelected ? current.filter(f => f !== id) : [...current, id];
                                updateFilter('features', newFeatures);
                              }}
                              className={cn(
                                "p-1.5 rounded border text-xs transition-colors",
                                isSelected ? "bg-green-100 border-green-500" : "border-border hover:bg-muted"
                              )}
                            >
                              <div className="text-sm mb-1">{emoji}</div>
                              <div className="font-medium">{name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accommodation Type & Meal Plans */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="h-4 w-4 text-red-600" />
                  <h3 className="font-semibold text-sm">Meal Plans</h3>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    ['Room Only', 'roomonly'],
                    ['Breakfast', 'breakfast'],
                    ['Half Board', 'halfboard'],
                    ['Full Board', 'fullboard'],
                    ['All Inclusive', 'allinclusive'],
                    ['Self Catering', 'selfcater']
                  ].map(([name, id]) => {
                    const isSelected = localFilters.policies.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const current = localFilters.policies;
                          const newPolicies = isSelected ? current.filter(p => p !== id) : [...current, id];
                          updateFilter('policies', newPolicies);
                        }}
                        className={cn(
                          "p-2 rounded border text-xs transition-colors",
                          isSelected ? "bg-red-100 border-red-500" : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="font-medium">{name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Policies */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-semibold text-sm">Booking</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">⚡ Instant Book</span>
                    <Switch
                      checked={localFilters.instantBook}
                      onCheckedChange={(checked) => updateFilter('instantBook', checked)}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">🏆 Superhost</span>
                    <Switch
                      checked={localFilters.superhost}
                      onCheckedChange={(checked) => updateFilter('superhost', checked)}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">✅ Verified</span>
                    <Switch
                      checked={localFilters.verified}
                      onCheckedChange={(checked) => updateFilter('verified', checked)}
                      className="scale-75"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium mb-1 block">Cancellation Policy</label>
                  <Select
                    value={localFilters.cancellationPolicy}
                    onValueChange={(value) => updateFilter('cancellationPolicy', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Policy</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location & Distance */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <h3 className="font-semibold text-sm">Location</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Distance from Center</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        ['Any', 50],
                        ['< 1km', 1],
                        ['< 3km', 3],
                        ['< 5km', 5]
                      ].map(([label, distance]) => {
                        const isSelected = localFilters.distance <= (distance as number);
                        return (
                          <button
                            key={label as string}
                            onClick={() => updateFilter('distance', distance)}
                            className={cn(
                              "px-2 py-1 text-xs rounded border transition-colors",
                              isSelected && localFilters.distance === distance
                                ? "bg-teal-100 border-teal-500 text-teal-700" 
                                : "border-border hover:bg-muted"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium mb-2 block">Nearby Attractions</label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        ['🏛️', 'Museums', 'museums'],
                        ['🛍️', 'Shopping', 'shopping'],
                        ['🍽️', 'Restaurants', 'restaurants'],
                        ['🚇', 'Metro/Train', 'transport'],
                        ['✈️', 'Airport', 'airport'],
                        ['🏥', 'Hospital', 'hospital']
                      ].map(([emoji, name, id]) => {
                        const isSelected = localFilters.accessibility.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              const current = localFilters.accessibility;
                              const newAccessibility = isSelected ? current.filter(a => a !== id) : [...current, id];
                              updateFilter('accessibility', newAccessibility);
                            }}
                            className={cn(
                              "p-1.5 rounded border text-xs transition-colors",
                              isSelected ? "bg-teal-100 border-teal-500" : "border-border hover:bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{emoji}</span>
                              <span className="font-medium">{name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Check-in & Travel Dates */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-violet-600" />
                  <h3 className="font-semibold text-sm">Travel Dates</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Check-in Time</label>
                    <Select
                      value={localFilters.checkInTime}
                      onValueChange={(value) => updateFilter('checkInTime', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Time</SelectItem>
                        <SelectItem value="morning">Morning (6-12)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12-18)</SelectItem>
                        <SelectItem value="evening">Evening (18-22)</SelectItem>
                        <SelectItem value="late">Late (22+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium mb-2 block">Trip Duration</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        ['1-2 days', 'short'],
                        ['3-7 days', 'week'],
                        ['1-2 weeks', 'twoweeks'],
                        ['1+ month', 'long']
                      ].map(([label, id]) => {
                        const isSelected = localFilters.policies.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              const current = localFilters.policies;
                              const newPolicies = isSelected ? current.filter(p => p !== id) : [...current, id];
                              updateFilter('policies', newPolicies);
                            }}
                            className={cn(
                              "px-2 py-1 text-xs rounded border transition-colors",
                              isSelected ? "bg-violet-100 border-violet-500" : "border-border hover:bg-muted"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests & Rooms - Compact */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-sm">Guests & Rooms</h3>
                </div>
                <div className="space-y-2">
                  {/* Guests */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">👥 Guests</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateFilter('guests', Math.max(1, localFilters.guests - 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.guests <= 1}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{localFilters.guests}</span>
                      <button
                        onClick={() => updateFilter('guests', Math.min(12, localFilters.guests + 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.guests >= 12}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Bedrooms */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">🛏️ Bedrooms</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateFilter('bedrooms', Math.max(0, localFilters.bedrooms - 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.bedrooms <= 0}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{localFilters.bedrooms || 'Any'}</span>
                      <button
                        onClick={() => updateFilter('bedrooms', Math.min(6, localFilters.bedrooms + 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.bedrooms >= 6}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Bathrooms */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">🚿 Bathrooms</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateFilter('bathrooms', Math.max(0, localFilters.bathrooms - 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.bathrooms <= 0}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{localFilters.bathrooms || 'Any'}</span>
                      <button
                        onClick={() => updateFilter('bathrooms', Math.min(4, localFilters.bathrooms + 1))}
                        className="w-6 h-6 rounded border border-border hover:bg-muted text-xs font-bold"
                        disabled={localFilters.bathrooms >= 4}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {resultCount} {t('properties found')}
                </span>
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30">
                  {getActiveFilterCount()} {t('filters')}
                </Badge>
              </div>
              <Button type="button" onClick={closeAndRestore} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md">
                {t('Show Results')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
