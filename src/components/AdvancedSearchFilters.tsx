import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Wifi, 
  Car, 
  Coffee, 
  Waves, 
  Dumbbell, 
  Utensils,
  Shield,
  Users,
  Bed,
  Bath,
  Home,
  Building,
  MapIcon,
  Filter,
  X
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdvancedFilters {
  priceRange: [number, number];
  starRating: number[];
  propertyTypes: string[];
  amenities: string[];
  guestRating: number;
  distanceFromCenter: number;
  roomTypes: string[];
  accessibility: string[];
  policies: string[];
  instantBook: boolean;
  freeWifi: boolean;
  freeParking: boolean;
  petFriendly: boolean;
}

interface AdvancedSearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
}

const amenityOptions = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Free Parking', icon: Car },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'security', label: '24/7 Security', icon: Shield },
  { id: 'concierge', label: 'Concierge', icon: Users },
];

const propertyTypeOptions = [
  { id: 'hotel', label: 'Hotel', icon: Building },
  { id: 'apartment', label: 'Apartment', icon: Home },
  { id: 'guesthouse', label: 'Guest House', icon: Home },
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'hostel', label: 'Hostel', icon: Building },
  { id: 'resort', label: 'Resort', icon: Building },
];

const roomTypeOptions = [
  { id: 'single', label: 'Single Room', icon: Bed },
  { id: 'double', label: 'Double Room', icon: Bed },
  { id: 'suite', label: 'Suite', icon: Bed },
  { id: 'family', label: 'Family Room', icon: Users },
  { id: 'deluxe', label: 'Deluxe Room', icon: Bed },
];

export default function AdvancedSearchFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);
  const { formatPrice } = useCurrency();

  const handlePriceRangeChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleStarRatingChange = (rating: number) => {
    const newRatings = filters.starRating.includes(rating)
      ? filters.starRating.filter(r => r !== rating)
      : [...filters.starRating, rating];
    setFilters({ ...filters, starRating: newRatings });
  };

  const handlePropertyTypeChange = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    setFilters({ ...filters, propertyTypes: newTypes });
  };

  const handleAmenityChange = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: newAmenities });
  };

  const handleRoomTypeChange = (roomType: string) => {
    const newRoomTypes = filters.roomTypes.includes(roomType)
      ? filters.roomTypes.filter(r => r !== roomType)
      : [...filters.roomTypes, roomType];
    setFilters({ ...filters, roomTypes: newRoomTypes });
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      starRating: [],
      propertyTypes: [],
      amenities: [],
      guestRating: 0,
      distanceFromCenter: 50,
      roomTypes: [],
      accessibility: [],
      policies: [],
      instantBook: false,
      freeWifi: false,
      freeParking: false,
      petFriendly: false,
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.starRating.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.guestRating > 0) count++;
    if (filters.distanceFromCenter < 50) count++;
    if (filters.roomTypes.length > 0) count++;
    if (filters.instantBook || filters.freeWifi || filters.freeParking || filters.petFriendly) count++;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Search Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="price-location" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="price-location">Price & Location</TabsTrigger>
            <TabsTrigger value="property-type">Property Type</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="price-location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range (per night)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={1000}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}+</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Distance from City Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={[filters.distanceFromCenter]}
                    onValueChange={(value) => setFilters({ ...filters, distanceFromCenter: value[0] })}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Within {filters.distanceFromCenter} km of city center
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Star Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.starRating.includes(rating) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStarRatingChange(rating)}
                      className="flex items-center gap-1"
                    >
                      {rating}
                      <Star className="h-3 w-3 fill-current" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="property-type" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Property Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypeOptions.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          filters.propertyTypes.includes(type.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handlePropertyTypeChange(type.id)}
                      >
                        <Checkbox
                          checked={filters.propertyTypes.includes(type.id)}
                          onChange={() => {}}
                        />
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Room Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomTypeOptions.map((room) => {
                    const IconComponent = room.icon;
                    return (
                      <div
                        key={room.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          filters.roomTypes.includes(room.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleRoomTypeChange(room.id)}
                      >
                        <Checkbox
                          checked={filters.roomTypes.includes(room.id)}
                          onChange={() => {}}
                        />
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{room.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenityOptions.map((amenity) => {
                      const IconComponent = amenity.icon;
                      return (
                        <Tooltip key={amenity.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                filters.amenities.includes(amenity.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => handleAmenityChange(amenity.id)}
                              aria-label={amenity.label}
                            >
                              <Checkbox
                                checked={filters.amenities.includes(amenity.id)}
                                onChange={() => {}}
                              />
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm font-medium">{amenity.label}</span>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={[filters.guestRating]}
                    onValueChange={(value) => setFilters({ ...filters, guestRating: value[0] })}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Minimum rating: {filters.guestRating}/10
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instantBook"
                    checked={filters.instantBook}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, instantBook: !!checked })
                    }
                  />
                  <label htmlFor="instantBook" className="text-sm font-medium">
                    Instant Book Available
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeWifi"
                    checked={filters.freeWifi}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, freeWifi: !!checked })
                    }
                  />
                  <label htmlFor="freeWifi" className="text-sm font-medium">
                    Free WiFi
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeParking"
                    checked={filters.freeParking}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, freeParking: !!checked })
                    }
                  />
                  <label htmlFor="freeParking" className="text-sm font-medium">
                    Free Parking
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petFriendly"
                    checked={filters.petFriendly}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, petFriendly: !!checked })
                    }
                  />
                  <label htmlFor="petFriendly" className="text-sm font-medium">
                    Pet Friendly
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters ({getActiveFilterCount()})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
