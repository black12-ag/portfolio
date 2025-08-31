import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MobileMapFallbackProps {
  title?: string;
  description?: string;
  coordinates?: [number, number];
  properties?: Array<{
    id: string;
    name: string;
    address?: string;
    coordinates?: [number, number];
  }>;
  onLocationSelect?: (coordinates: [number, number]) => void;
  className?: string;
}

const MobileMapFallback: React.FC<MobileMapFallbackProps> = ({
  title = "Map View",
  description = "Interactive map temporarily unavailable on mobile",
  coordinates,
  properties = [],
  onLocationSelect,
  className = ""
}) => {
  const handleOpenInMaps = () => {
    if (coordinates) {
      const [lat, lng] = coordinates;
      const url = `https://maps.apple.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const handleOpenGoogleMaps = () => {
    if (coordinates) {
      const [lat, lng] = coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>

          {properties.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Locations:</h4>
              <div className="space-y-1">
                {properties.slice(0, 5).map(property => (
                  <div 
                    key={property.id}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <span>{property.name}</span>
                    {property.coordinates && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onLocationSelect?.(property.coordinates)}
                      >
                        <Navigation className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {properties.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{properties.length - 5} more locations
                  </p>
                )}
              </div>
            </div>
          )}

          {coordinates && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Open in your preferred map app:
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenInMaps}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Apple Maps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenGoogleMaps}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Maps
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              📱 Full interactive maps are available on the web version
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileMapFallback;
