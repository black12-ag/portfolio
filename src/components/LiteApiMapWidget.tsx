import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiteApiMapWidgetProps {
  onHotelClick?: (hotelData: any) => void;
  className?: string;
}

interface Place {
  id: string;
  name: string;
  type: string;
  countryCode?: string;
}

declare global {
  interface Window {
    LiteAPI: {
      init: (config: any) => void;
      Map: {
        create: (config: any) => any;
      };
    };
  }
}

export const LiteApiMapWidget: React.FC<LiteApiMapWidgetProps> = ({
  onHotelClick,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('Barcelona, Spain');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const { toast } = useToast();

  // Load LiteAPI SDK
  useEffect(() => {
    const loadLiteApiSDK = () => {
      if (window.LiteAPI) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://components.liteapi.travel/v1.0/sdk.umd.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load LiteAPI SDK'));
        document.head.appendChild(script);
      });
    };

    loadLiteApiSDK()
      .then(() => {
        // Initialize LiteAPI SDK with whitelabel domain
        // Note: You'll need to replace this with your actual whitelabel domain
        window.LiteAPI.init({
          domain: 'whitelabel.nuitee.link', // Replace with your domain
          deepLinkParams: 'language=en&currency=USD'
        });
      })
      .catch((err) => {
        setError(`Failed to load LiteAPI SDK: ${err.message}`);
      });
  }, []);

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/liteapi/places?query=${encodeURIComponent(query)}&timeout=10`
      );
      const result = await response.json();

      if (result.success && result.data?.data) {
        setPlaces(result.data.data.slice(0, 5)); // Limit to 5 results
      } else {
        setError('No places found');
        setPlaces([]);
      }
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create map with selected place
  const createMap = async (place: Place) => {
    if (!window.LiteAPI || !mapRef.current) {
      setError('LiteAPI SDK not loaded or map container not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clear existing map
      if (mapInstance) {
        mapRef.current.innerHTML = '';
      }

      // Create new map instance
      const map = window.LiteAPI.Map.create({
        selector: mapRef.current,
        placeId: place.id,
        primaryColor: '#7057F0', // Purple theme
        hideLogo: false,
        currency: 'USD',
        onHotelClick: (hotelData: any) => {
          console.log('Hotel clicked:', hotelData);
          toast({
            title: 'Hotel Selected',
            description: `${hotelData.hotel?.name || 'Hotel'} - Check-in: ${hotelData.checkin || 'N/A'}`
          });
          onHotelClick?.(hotelData);
        },
        labelsOverride: {
          searchAction: 'Search Hotels',
          placeholderText: 'Search for a destination'
        }
      });

      setMapInstance(map);
      setSelectedPlace(place);

      toast({
        title: 'Map Loaded',
        description: `Showing hotels in ${place.name}`
      });

    } catch (err) {
      setError(`Map creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchPlaces(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          LiteAPI Map Widget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Interface */}
        <div className="space-y-2">
          <Label htmlFor="place-search">Search for a destination</Label>
          <div className="flex gap-2">
            <Input
              id="place-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city, country, or landmark..."
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Places Results */}
        {places.length > 0 && (
          <div className="space-y-2">
            <Label>Select a destination:</Label>
            <div className="grid gap-2">
              {places.map((place) => (
                <Button
                  key={place.id}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => createMap(place)}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {place.type} {place.countryCode && `• ${place.countryCode}`}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection */}
        {selectedPlace && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Currently showing:</div>
            <div className="text-sm text-muted-foreground">{selectedPlace.name}</div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Map Container */}
        <div className="space-y-2">
          <Label>Interactive Hotel Map</Label>
          <div
            ref={mapRef}
            className="w-full h-96 border rounded-lg bg-gray-50 flex items-center justify-center"
            style={{ minHeight: '400px' }}
          >
            {!selectedPlace && !isLoading && (
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>Search and select a destination to load the map</div>
              </div>
            )}
            {isLoading && (
              <div className="text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <div>Loading map...</div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Search for destinations using the search bar above</div>
          <div>• Click on a destination to load the interactive map</div>
          <div>• Click on hotel markers to view details and pricing</div>
          <div>• Use the map controls to zoom and navigate</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiteApiMapWidget;
