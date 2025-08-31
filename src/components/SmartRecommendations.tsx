import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, MapPin, Star, Users, Calendar, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Property } from '@/components/PropertyCard';

interface SmartRecommendationsProps {
  currentPropertyId?: string;
  userPreferences?: {
    budget?: number;
    location?: string;
    amenities?: string[];
    propertyType?: string;
  };
  className?: string;
}

export default function SmartRecommendations({ 
  currentPropertyId, 
  userPreferences,
  className 
}: SmartRecommendationsProps) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [recommendationType, setRecommendationType] = useState<'similar' | 'trending' | 'budget' | 'luxury'>('similar');

  const generateRecommendations = useCallback(() => {
    // Get LiteAPI properties from localStorage and strictly allow real LiteAPI items only
    const liteApiProperties = JSON.parse(localStorage.getItem('liteapi_properties') || '[]') as Property[];
    let filteredProperties = liteApiProperties
      .filter(p => (p as any).isLiteApiHotel === true)
      .filter(p => p.id !== currentPropertyId)
      // Filter out unrealistic prices accidentally cached from old demo data
      .filter(p => (typeof p.price === 'number' ? p.price : 0) >= 10);
    
    if (filteredProperties.length === 0) {
      setRecommendations([]);
      return;
    }
    
    switch (recommendationType) {
      case 'similar':
        // Find similar properties based on current property
        if (currentPropertyId) {
          const currentProperty = liteApiProperties.find(p => p.id === currentPropertyId);
          if (currentProperty) {
            filteredProperties = filteredProperties
              .filter(p => p.type === currentProperty.type)
              .filter(p => Math.abs(p.price - currentProperty.price) <= 50)
              .sort((a, b) => b.rating - a.rating);
          }
        }
        break;
        
      case 'trending':
        // Show highly rated properties with many reviews
        filteredProperties = filteredProperties
          .filter(p => p.rating >= 4.3 && p.reviews >= 50)
          .sort((a, b) => b.reviews - a.reviews);
        break;
        
      case 'budget':
        // Show affordable options
        filteredProperties = filteredProperties
          .filter(p => p.price <= 100)
          .sort((a, b) => a.price - b.price);
        break;
        
      case 'luxury':
        // Show premium properties
        filteredProperties = filteredProperties
          .filter(p => p.price >= 150 && p.rating >= 4.5)
          .sort((a, b) => b.price - a.price);
        break;
    }

    // Apply user preferences if available
    if (userPreferences) {
      if (userPreferences.budget) {
        filteredProperties = filteredProperties.filter(p => p.price <= userPreferences.budget);
      }
      if (userPreferences.location) {
        filteredProperties = filteredProperties.filter(p => 
          p.location.toLowerCase().includes(userPreferences.location.toLowerCase()) ||
          p.area?.toLowerCase().includes(userPreferences.location.toLowerCase())
        );
      }
      if (userPreferences.propertyType) {
        filteredProperties = filteredProperties.filter(p => p.type === userPreferences.propertyType);
      }
    }

    setRecommendations(filteredProperties.slice(0, 4));
  }, [currentPropertyId, userPreferences, recommendationType]);

  useEffect(() => {
    generateRecommendations();
  }, [currentPropertyId, userPreferences, recommendationType, generateRecommendations]);

  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case 'similar': return 'Similar Properties';
      case 'trending': return 'Trending Now';
      case 'budget': return 'Budget Friendly';
      case 'luxury': return 'Luxury Collection';
      default: return 'Recommended for You';
    }
  };

  const getRecommendationIcon = () => {
    switch (recommendationType) {
      case 'similar': return <Sparkles className="h-5 w-5 text-blue-500" />;
      case 'trending': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'budget': return <Zap className="h-5 w-5 text-orange-500" />;
      case 'luxury': return <Star className="h-5 w-5 text-purple-500" />;
      default: return <Sparkles className="h-5 w-5 text-blue-500" />;
    }
  };

  const handlePropertyClick = (property: Property) => {
    // Save to recently viewed
    const recentlyViewed = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
    const newItem = {
      id: property.id,
      name: property.title,
      image: property.images[0],
      rating: property.rating,
      price: property.price,
      viewedAt: new Date().toISOString()
    };
    
    const updatedRecent = [newItem, ...recentlyViewed.filter((item: any) => item.id !== property.id)].slice(0, 10);
    localStorage.setItem('recently-viewed', JSON.stringify(updatedRecent));
    
    navigate(`/hotel/${property.id}`);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getRecommendationIcon()}
            {getRecommendationTitle()}
          </CardTitle>
          <div className="flex gap-1">
            {(['similar', 'trending', 'budget', 'luxury'] as const).map((type) => (
              <Button
                key={type}
                variant={recommendationType === type ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setRecommendationType(type)}
              >
                {type === 'similar' && '✨'}
                {type === 'trending' && '📈'}
                {type === 'budget' && '💰'}
                {type === 'luxury' && '👑'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((property) => (
            <div
              key={property.id}
              className="group cursor-pointer rounded-lg border p-3 hover:shadow-md transition-all"
              onClick={() => handlePropertyClick(property)}
            >
              <div className="aspect-video relative mb-3 overflow-hidden rounded-lg">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  {property.isVerified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                    {property.type === 'hotel' ? '🏨' : '🏠'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-blue-600">
                  {property.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{property.area || property.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{property.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({property.reviews})
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">per night</div>
                  </div>
                </div>
                
                {/* Recommendation reason */}
                <div className="pt-2 border-t">
                  {recommendationType === 'similar' && (
                    <Badge variant="outline" className="text-xs">
                      Similar to your selection
                    </Badge>
                  )}
                  {recommendationType === 'trending' && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular this week
                    </Badge>
                  )}
                  {recommendationType === 'budget' && (
                    <Badge variant="outline" className="text-xs text-orange-700 border-orange-200">
                      Great value
                    </Badge>
                  )}
                  {recommendationType === 'luxury' && (
                    <Badge variant="outline" className="text-xs text-purple-700 border-purple-200">
                      Premium experience
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/search?type=${recommendationType === 'similar' ? 'all' : recommendationType}`)}
          >
            See All {getRecommendationTitle()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
