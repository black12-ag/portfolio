import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Property } from '@/components/PropertyCard';

interface RecommendedPropertiesProps {
  currentPropertyId: string;
}

export default function RecommendedProperties({ currentPropertyId }: RecommendedPropertiesProps) {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    // Get real LiteAPI properties only
    const liteApiProperties = JSON.parse(localStorage.getItem('liteapi_properties') || '[]');
    const allProperties = (Array.isArray(liteApiProperties) ? liteApiProperties : [])
      .filter((p: any) => p.isLiteApiHotel === true)
      .filter((p: any) => typeof p.price === 'number' && p.price >= 10);
    
    // Get current property to base recommendations on
    const currentProperty = allProperties.find(p => p.id === currentPropertyId);
    
    if (!currentProperty || allProperties.length === 0) return;

    // Filter out current property and get similar ones
    const similarProperties = allProperties
      .filter(p => p.id !== currentPropertyId)
      .map(property => ({
        ...property,
        similarityScore: calculateSimilarityScore(currentProperty, property)
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 6);

    setRecommendations(similarProperties);
  }, [currentPropertyId]);

  const calculateSimilarityScore = (current: Property, other: Property): number => {
    let score = 0;

    // Same area gets highest score
    if (current.area === other.area) score += 50;
    
    // Similar price range
    const priceDiff = Math.abs(current.price - other.price);
    if (priceDiff <= 25) score += 30;
    else if (priceDiff <= 50) score += 20;
    else if (priceDiff <= 100) score += 10;

    // Similar rating
    const ratingDiff = Math.abs(current.rating - other.rating);
    if (ratingDiff <= 0.2) score += 20;
    else if (ratingDiff <= 0.5) score += 10;

    // Same property type
    if (current.type === other.type) score += 15;

    // Common amenities
    const commonAmenities = current.amenities.filter(amenity => 
      other.amenities.includes(amenity)
    );
    score += commonAmenities.length * 5;

    // Superhost bonus
    if (current.isSuperhost && other.isSuperhost) score += 10;

    return score;
  };

  const handlePropertyClick = (property: Property) => {
    window.location.href = `/hotel/${property.id}`;
  };

  const toggleWishlist = (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isWishlisted = wishlist.includes(propertyId);
    
    let newWishlist;
    if (isWishlisted) {
      newWishlist = wishlist.filter((id: string) => id !== propertyId);
    } else {
      newWishlist = [...wishlist, propertyId];
    }
    
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    // Force re-render by updating state
    setRecommendations(prev => [...prev]);
  };

  const isWishlisted = (propertyId: string) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.includes(propertyId);
  };

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>You might also like</span>
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((property) => (
            <div
              key={property.id}
              className="group cursor-pointer"
              onClick={() => handlePropertyClick(property)}
            >
              <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="relative">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {property.isVerified && (
                      <Badge className="bg-success text-success-foreground text-xs">
                        Verified
                      </Badge>
                    )}
                    {property.isSuperhost && (
                      <Badge className="bg-warning text-warning-foreground text-xs">
                        Superhost
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-3 right-3 h-8 w-8 p-0 rounded-full ${
                      isWishlisted(property.id) 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-white/80 hover:bg-white'
                    }`}
                    onClick={(e) => toggleWishlist(property.id, e)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isWishlisted(property.id) ? 'fill-current' : ''
                      }`} 
                    />
                  </Button>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Rating and Location */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                      <span>{property.rating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  {/* Amenities */}
                  <div className="flex items-center gap-2">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{property.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(property.price)}
                      </span>
                      <span className="text-sm text-muted-foreground"> / night</span>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-6">
          <Button variant="outline" className="w-full md:w-auto">
            Show more similar properties
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
