import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseStorage } from '@/lib/supabaseStorage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter, Star, Wifi, Car, Coffee, Dumbbell, Waves, MapPin, Utensils, Plane, Wine, Shirt } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface FilterOptions {
  priceRange: [number, number];
  starRating: number[];
  amenities: string[];
  propertyType: string[];
  districtPreference: string;
  sortBy: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchFilters({ onFiltersChange, isOpen, onClose }: SearchFiltersProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  const amenitiesList = [
    { id: 'wifi', label: t('Free WiFi'), icon: Wifi },
    { id: 'parking', label: t('Free Parking'), icon: Car },
    { id: 'breakfast', label: t('Breakfast Included'), icon: Coffee },
    { id: 'gym', label: t('Fitness Center'), icon: Dumbbell },
    { id: 'pool', label: t('Swimming Pool'), icon: Waves },
    { id: 'spa', label: t('Spa Services'), icon: Star },
    { id: 'restaurant', label: t('Restaurant'), icon: Utensils },
    { id: 'airport', label: t('Airport Shuttle'), icon: Plane },
    { id: 'bar', label: t('Bar/Lounge'), icon: Wine },
    { id: 'laundry', label: t('Laundry Service'), icon: Shirt },
  ];
  
  const propertyTypes = [
    t('Hotel'), t('Apartment'), t('Guest House'), t('Villa'), t('Resort'), t('Hostel'), t('Lodge')
  ];
  
  const sortOptions = [
    { value: 'price-low', label: t('Price: Low to High') },
    { value: 'price-high', label: t('Price: High to Low') },
    { value: 'rating', label: t('Highest Rated') },
    { value: 'distance', label: t('Distance from Center') },
    { value: 'popular', label: t('Most Popular') },
  ];

  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500]);
  const [starRating, setStarRating] = useState<number[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [districtPreference, setDistrictPreference] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Track if any filters are applied
  const hasActiveFilters = starRating.length > 0 || amenities.length > 0 || propertyType.length > 0 || priceRange[0] > 50 || priceRange[1] < 500;

  // Load saved filters from Supabase
  useEffect(() => {
    const loadSavedFilters = async () => {
      if (user) {
        try {
          const savedFilters = await SupabaseStorage.getItem('searchFilters');
          if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            setPriceRange(filters.priceRange || [50, 500]);
            setStarRating(filters.starRating || []);
            setAmenities(filters.amenities || []);
            setPropertyType(filters.propertyType || []);
            setDistrictPreference(filters.districtPreference || '');
            setSortBy(filters.sortBy || 'popular');
          }
        } catch (error) {
          console.error('Failed to load filters:', error);
        }
      }
    };
    loadSavedFilters();
  }, [user]);

  // Save filters when they change
  const saveFiltersToSupabase = async (filters: FilterOptions) => {
    if (user) {
      try {
        await SupabaseStorage.setItem('searchFilters', JSON.stringify(filters));
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }
  };

  const handleStarRatingChange = (rating: number) => {
    setStarRating(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const handleAmenityChange = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePropertyTypeChange = (type: string) => {
    setPropertyType(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([50, 500]);
    setStarRating([]);
    setAmenities([]);
    setPropertyType([]);
    setDistrictPreference('');
    setSortBy('popular');
  };

  const applyFilters = async () => {
    const filters = {
      priceRange,
      starRating,
      amenities,
      propertyType,
      districtPreference,
      sortBy,
    };
    
    // Save filters to Supabase
    await saveFiltersToSupabase(filters);
    
    onFiltersChange(filters);
    onClose();
  };

  const handleClose = useCallback(() => {
    // Don't reset filters on close - preserve user selections
    onClose();
  }, [onClose]);

  // Handle click outside and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <Card 
        ref={modalRef}
        className="w-full sm:max-w-2xl lg:max-w-3xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] overflow-hidden bg-white sm:rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b flex items-center justify-between sm:rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t("Search Filters")}</h2>
              {hasActiveFilters ? (
                <p className="text-sm text-blue-600 font-medium">
                  {starRating.length + amenities.length + propertyType.length} filters active
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Click outside to close
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleClose} 
            className="h-10 w-10 p-0 hover:bg-blue-100 rounded-full transition-colors"
            title="Close filters"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(90vh-180px)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Sort By */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                {t("Sort By")}
              </h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-11 rounded-lg border-gray-200 hover:border-blue-300 focus:border-blue-500">
                  <SelectValue placeholder={t("Sort by...")} />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-3">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Coffee className="h-4 w-4 mr-2 text-blue-600" />
                  {t("Price per night")}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    per night
                  </span>
                </div>
              </h3>
              
              {/* Quick price buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Budget', range: [10, 80], color: 'bg-green-100 text-green-700 border-green-200' },
                  { label: 'Mid-range', range: [80, 200], color: 'bg-blue-100 text-blue-700 border-blue-200' },
                  { label: 'Luxury', range: [200, 500], color: 'bg-purple-100 text-purple-700 border-purple-200' },
                  { label: 'Premium', range: [500, 1000], color: 'bg-amber-100 text-amber-700 border-amber-200' }
                ].map((preset) => {
                  const isSelected = priceRange[0] >= preset.range[0] && priceRange[1] <= preset.range[1] && 
                                   priceRange[0] <= preset.range[0] + 20 && priceRange[1] >= preset.range[1] - 20;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setPriceRange([preset.range[0], preset.range[1]])}
                      className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isSelected 
                          ? `${preset.color  } shadow-md scale-105` 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                      <div className="text-xs opacity-75 mt-1">
                        ${preset.range[0]}-${preset.range[1]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom range slider */}
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                    max={1000}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                {/* Manual input fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = Math.max(10, Math.min(parseInt(e.target.value) || 10, priceRange[1] - 10));
                          setPriceRange([value, priceRange[1]]);
                        }}
                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        min="10"
                        max={priceRange[1] - 10}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Maximum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = Math.min(1000, Math.max(parseInt(e.target.value) || 1000, priceRange[0] + 10));
                          setPriceRange([priceRange[0], value]);
                        }}
                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        min={priceRange[0] + 10}
                        max="1000"
                      />
                    </div>
                  </div>
                </div>

                {/* Price range indicators */}
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  <span>$10 (Budget)</span>
                  <span>$1000+ (Premium)</span>
                </div>

                {/* Helpful context */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs">💡</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      <strong>Tip:</strong> {
                        priceRange[1] <= 80 ? "Budget-friendly options include hostels and basic hotels." :
                        priceRange[0] >= 500 ? "Premium range includes luxury resorts and 5-star hotels." :
                        priceRange[0] >= 200 ? "Luxury range offers upscale amenities and services." :
                        "Mid-range includes comfortable hotels with good amenities."
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-blue-600" />
                {t("Star Rating")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={starRating.includes(rating) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStarRatingChange(rating)}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      starRating.includes(rating) 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md scale-105" 
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <span>{rating}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                {t("Property Type")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {propertyTypes.map((type) => (
                  <Button
                    key={type}
                    variant={propertyType.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePropertyTypeChange(type)}
                    className={`text-sm transition-all duration-200 ${
                      propertyType.includes(type) 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Dumbbell className="h-4 w-4 mr-2 text-blue-600" />
                {t("Amenities")}
              </h3>
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenitiesList.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = amenities.includes(amenity.id);
                    return (
                      <Tooltip key={amenity.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                              isSelected 
                                ? "border-blue-300 bg-blue-50 shadow-sm" 
                                : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handleAmenityChange(amenity.id)}
                            aria-label={amenity.label}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Icon className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                            <span className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                              {amenity.label}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {amenity.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 border-t border-blue-100 p-4 sm:p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {t("Active Filters")} ({starRating.length + amenities.length + propertyType.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {starRating.map((rating) => (
                <Badge 
                  key={`star-${rating}`} 
                  variant="secondary" 
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  onClick={() => handleStarRatingChange(rating)}
                >
                  <span>{rating}</span>
                  <Star className="h-3 w-3 fill-current" />
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {amenities.map((amenity) => (
                <Badge 
                  key={`amenity-${amenity}`} 
                  variant="secondary" 
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  onClick={() => handleAmenityChange(amenity)}
                >
                  <span>{amenitiesList.find(a => a.id === amenity)?.label}</span>
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {propertyType.map((type) => (
                <Badge 
                  key={`type-${type}`} 
                  variant="secondary" 
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  onClick={() => handlePropertyTypeChange(type)}
                >
                  <span>{type}</span>
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-t flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:rounded-b-2xl">
          <Button 
            variant="outline" 
            onClick={clearAllFilters} 
            className="flex-1 h-12 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4 mr-2" />
            {t("Clear All")}
          </Button>
          <Button 
            onClick={applyFilters} 
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t("Apply Filters")}
            {hasActiveFilters && (
              <Badge className="ml-2 bg-white/20 text-white">
                {starRating.length + amenities.length + propertyType.length}
              </Badge>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}