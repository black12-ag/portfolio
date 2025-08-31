import React, { useState, useMemo, useCallback } from 'react';
import { UnifiedHotel } from '@/services/unifiedHotelService';
import { LiteApiHotelMap } from './LiteApiHotelMap';
import GoogleHotelMap from './GoogleHotelMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Map, Globe, MapPin, Layers } from 'lucide-react';

interface HybridHotelMapProps {
  hotels: UnifiedHotel[];
  selectedHotel?: UnifiedHotel | null;
  onHotelSelect: (hotel: UnifiedHotel) => void;
  onHotelBook: (hotel: UnifiedHotel) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  showControls?: boolean;
}

type MapProvider = 'liteapi' | 'google' | 'auto';

export const HybridHotelMap: React.FC<HybridHotelMapProps> = ({
  hotels,
  selectedHotel,
  onHotelSelect,
  onHotelBook,
  center,
  zoom = 12,
  height = '500px',
  className = '',
  showControls = true,
}) => {
  const [mapProvider, setMapProvider] = useState<MapProvider>('auto');

  // Analyze hotel sources to determine optimal map provider
  const mapAnalysis = useMemo(() => {
    const liteApiHotels = hotels.filter(h => h.source === 'liteapi');
    const manualHotels = hotels.filter(h => h.source === 'manual');
    
    const analysis = {
      liteApiCount: liteApiHotels.length,
      manualCount: manualHotels.length,
      totalCount: hotels.length,
      hasLiteApi: liteApiHotels.length > 0,
      hasManual: manualHotels.length > 0,
      liteApiHotels,
      manualHotels,
    };

    // Auto-select best provider
    let autoProvider: 'liteapi' | 'google' = 'liteapi';
    if (analysis.hasManual && !analysis.hasLiteApi) {
      autoProvider = 'google';
    } else if (analysis.manualCount > analysis.liteApiCount) {
      autoProvider = 'google';
    }

    return { ...analysis, autoProvider };
  }, [hotels]);

  // Determine effective map provider
  const effectiveProvider = mapProvider === 'auto' ? mapAnalysis.autoProvider : mapProvider;

  // Get hotels to display based on provider
  const displayHotels = useMemo(() => {
    if (effectiveProvider === 'liteapi') {
      return mapAnalysis.hasLiteApi ? mapAnalysis.liteApiHotels : hotels;
    } else {
      return mapAnalysis.hasManual ? mapAnalysis.manualHotels : hotels;
    }
  }, [effectiveProvider, mapAnalysis, hotels]);

  console.log(`🗺️ Hybrid Map: ${effectiveProvider} provider with ${displayHotels.length}/${hotels.length} hotels`);

  return (
    <div className={`hybrid-hotel-map-container relative ${className}`} style={{ height }}>
      {/* Map Provider Controls */}
      {showControls && (mapAnalysis.hasLiteApi && mapAnalysis.hasManual) && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <ToggleGroup
            type="single"
            value={mapProvider}
            onValueChange={(value) => setMapProvider(value as MapProvider)}
            className="bg-white/90 backdrop-blur-sm shadow-lg border rounded-lg p-1"
          >
            <ToggleGroupItem value="auto" size="sm" className="px-2 py-1">
              <Layers className="h-3 w-3 mr-1" />
              Auto
            </ToggleGroupItem>
            <ToggleGroupItem value="liteapi" size="sm" className="px-2 py-1">
              <Map className="h-3 w-3 mr-1" />
              LiteAPI
            </ToggleGroupItem>
            <ToggleGroupItem value="google" size="sm" className="px-2 py-1">
              <Globe className="h-3 w-3 mr-1" />
              Google
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Hotel Source Summary */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          {mapAnalysis.hasLiteApi && (
            <Badge 
              variant={effectiveProvider === 'liteapi' ? 'default' : 'secondary'}
              className="bg-white/90 backdrop-blur-sm shadow-sm"
            >
              <Map className="h-3 w-3 mr-1" />
              {mapAnalysis.liteApiCount} LiteAPI
            </Badge>
          )}
          {mapAnalysis.hasManual && (
            <Badge 
              variant={effectiveProvider === 'google' ? 'default' : 'secondary'}
              className="bg-white/90 backdrop-blur-sm shadow-sm"
            >
              <Globe className="h-3 w-3 mr-1" />
              {mapAnalysis.manualCount} Manual
            </Badge>
          )}
        </div>
      )}

      {/* Active Provider Info */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge className={`shadow-lg ${effectiveProvider === 'liteapi' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
          {effectiveProvider === 'liteapi' ? (
            <>
              <Map className="h-3 w-3 mr-1" />
              LiteAPI Map
            </>
          ) : (
            <>
              <Globe className="h-3 w-3 mr-1" />
              Google Maps
            </>
          )}
        </Badge>
      </div>

      {/* Map Component */}
      {effectiveProvider === 'liteapi' ? (
        <LiteApiHotelMap
          hotels={displayHotels}
          selectedHotel={selectedHotel}
          onHotelSelect={onHotelSelect}
          onHotelBook={onHotelBook}
          center={center}
          zoom={zoom}
          height={height}
          showControls={false} // We handle controls ourselves
        />
      ) : (
        <GoogleHotelMap
          hotels={displayHotels}
          selectedHotel={selectedHotel}
          onHotelSelect={onHotelSelect}
          onHotelBook={onHotelBook}
          center={center}
          zoom={zoom}
          height={height}
          showControls={false} // We handle controls ourselves
        />
      )}

      {/* Provider Switch Helper */}
      {mapAnalysis.hasLiteApi && mapAnalysis.hasManual && mapProvider !== 'auto' && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapProvider(effectiveProvider === 'liteapi' ? 'google' : 'liteapi')}
            className="bg-white/90 backdrop-blur-sm shadow-lg"
          >
            Switch to {effectiveProvider === 'liteapi' ? 'Google' : 'LiteAPI'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HybridHotelMap;