import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import NoMapComponent from '@/stubs/NoMapComponent';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, LatLng, DivIcon, Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  DollarSign, 
  Eye, 
  Calendar,
  Users,
  Maximize2,
  Minimize2,
  RotateCcw,
  Navigation
} from 'lucide-react';
import { UnifiedHotel } from '@/services/unifiedHotelService';
import { useCurrency } from '@/contexts/CurrencyContext';
if (import.meta.env.VITE_MOBILE_BUILD !== 'true') {
  // Only load CSS on web builds
  import('leaflet/dist/leaflet.css');
}

interface LiteApiHotelMapProps {
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

// Custom marker icons for LiteAPI vs Manual hotels
const createLiteApiMarkerIcon = (hotel: UnifiedHotel, isSelected = false): DivIcon => {
  const isLiteApi = hotel.source === 'liteapi';
  const baseColor = isLiteApi ? '#3B82F6' : '#10B981'; // Blue for LiteAPI, Green for manual
  const selectedColor = '#EF4444';
  const color = isSelected ? selectedColor : baseColor;
  
  const price = hotel.pricing?.baseRate ? `$${Math.round(hotel.pricing.baseRate)}` : '';
  
  return new DivIcon({
    html: `
      <div class="liteapi-hotel-marker ${isSelected ? 'selected' : ''}" style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: all 0.2s ease;
        z-index: ${isSelected ? '1000' : '100'};
      ">
        <!-- Price bubble -->
        ${price ? `
          <div style="
            background: white;
            border: 2px solid ${color};
            border-radius: 20px;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: bold;
            color: ${color};
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            margin-bottom: 2px;
          ">${price}</div>
        ` : ''}
        
        <!-- Main marker -->
        <div style="
          background-color: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 13px;
          position: relative;
        ">
          ${isLiteApi ? '🌐' : '📍'}
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            background: #FFD700;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #000;
            font-weight: bold;
          ">${hotel.rating?.stars || '★'}</div>
        </div>
        
        <!-- Pointer -->
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid ${color};
          margin-top: -3px;
        "></div>
      </div>
    `,
    className: 'custom-liteapi-marker',
    iconSize: [50, 70],
    iconAnchor: [25, 70],
    popupAnchor: [0, -70],
  });
};

// Map controls component
const MapControls: React.FC<{
  onFitBounds: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}> = ({ onFitBounds, onResetView, onToggleFullscreen, isFullscreen }) => (
  <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
    <Button
      size="sm"
      variant="outline"
      className="bg-white shadow-lg"
      onClick={onToggleFullscreen}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </Button>
    <Button
      size="sm"
      variant="outline"
      className="bg-white shadow-lg"
      onClick={onFitBounds}
    >
      <Navigation className="h-4 w-4" />
    </Button>
    <Button
      size="sm"
      variant="outline"
      className="bg-white shadow-lg"
      onClick={onResetView}
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  </div>
);

// Hotel popup component
const HotelPopup: React.FC<{
  hotel: UnifiedHotel;
  onBook: () => void;
  onViewDetails: () => void;
}> = ({ hotel, onBook, onViewDetails }) => {
  const { formatPrice } = useCurrency();
  
  return (
    <Card className="w-64 border-0 shadow-none">
      <CardContent className="p-3">
        {/* Hotel Image */}
        <div className="relative mb-3">
          <img
            src={hotel.images?.main || '/api/placeholder/240/120'}
            alt={hotel.name}
            className="w-full h-24 object-cover rounded-lg"
          />
          {hotel.source === 'liteapi' && (
            <Badge className="absolute top-2 right-2 bg-blue-600 text-white text-xs">
              🌐 LiteAPI
            </Badge>
          )}
        </div>
        
        {/* Hotel Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{hotel.name}</h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {hotel.location.city}, {hotel.location.country}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating?.score || hotel.rating?.stars}</span>
              <span className="text-xs text-muted-foreground">
                ({hotel.rating?.reviewCount || 0})
              </span>
            </div>
            
            {hotel.pricing?.baseRate && (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(hotel.pricing.baseRate, hotel.pricing.currency || 'USD')}
                </div>
                <div className="text-xs text-muted-foreground">per night</div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onViewDetails} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            <Button size="sm" onClick={onBook} className="flex-1">
              <Calendar className="h-3 w-3 mr-1" />
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Map bounds updater component
const MapBoundsUpdater: React.FC<{
  hotels: UnifiedHotel[];
  selectedHotel?: UnifiedHotel | null;
}> = ({ hotels, selectedHotel }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedHotel) {
      map.setView([selectedHotel.location.latitude, selectedHotel.location.longitude], 15);
      return;
    }
    
    if (hotels.length === 0) return;
    
    const bounds = new LatLngBounds([]);
    hotels.forEach(hotel => {
      bounds.extend([hotel.location.latitude, hotel.location.longitude]);
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [hotels, selectedHotel, map]);
  
  return null;
};

export const LiteApiHotelMap: React.FC<LiteApiHotelMapProps> = ({
  hotels,
  selectedHotel,
  onHotelSelect,
  onHotelBook,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 12,
  height = '500px',
  className = '',
  showControls = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);
  
  // Calculate center from hotels if not provided
  const mapCenter = React.useMemo((): [number, number] => {
    if (selectedHotel) {
      return [selectedHotel.location.latitude, selectedHotel.location.longitude];
    }
    
    if (hotels.length > 0) {
      const avgLat = hotels.reduce((sum, hotel) => sum + hotel.location.latitude, 0) / hotels.length;
      const avgLng = hotels.reduce((sum, hotel) => sum + hotel.location.longitude, 0) / hotels.length;
      return [avgLat, avgLng];
    }
    
    return center;
  }, [hotels, selectedHotel, center]);
  
  const handleFitBounds = useCallback(() => {
    if (!mapRef.current || hotels.length === 0) return;
    
    const bounds = new LatLngBounds([]);
    hotels.forEach(hotel => {
      bounds.extend([hotel.location.latitude, hotel.location.longitude]);
    });
    
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [hotels]);
  
  const handleResetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom);
  }, [center, zoom]);
  
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  if (Capacitor.isNativePlatform()) {
    return <NoMapComponent />;
  }
  
  return (
    <div 
      className={`liteapi-hotel-map-container relative ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`} 
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater hotels={hotels} selectedHotel={selectedHotel} />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
            
            return new DivIcon({
              html: `
                <div style="
                  background: rgba(59, 130, 246, 0.8);
                  border: 3px solid white;
                  border-radius: 50%;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  width: ${size === 'small' ? '30px' : size === 'medium' ? '40px' : '50px'};
                  height: ${size === 'small' ? '30px' : size === 'medium' ? '40px' : '50px'};
                  font-size: ${size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'};
                ">
                  ${count}
                </div>
              `,
              className: 'liteapi-cluster-icon',
              iconSize: [
                size === 'small' ? 30 : size === 'medium' ? 40 : 50,
                size === 'small' ? 30 : size === 'medium' ? 40 : 50
              ],
            });
          }}
        >
          {hotels.map((hotel) => (
            <Marker
              key={hotel.id}
              position={[hotel.location.latitude, hotel.location.longitude]}
              icon={createLiteApiMarkerIcon(hotel, selectedHotel?.id === hotel.id)}
              eventHandlers={{
                click: () => onHotelSelect(hotel),
              }}
            >
              <Popup>
                <HotelPopup
                  hotel={hotel}
                  onBook={() => onHotelBook(hotel)}
                  onViewDetails={() => onHotelSelect(hotel)}
                />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      
      {showControls && (
        <MapControls
          onFitBounds={handleFitBounds}
          onResetView={handleResetView}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}
      
      {/* Hotel count badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Badge variant="secondary" className="bg-white/90 shadow-lg">
          {hotels.length} hotels
        </Badge>
      </div>
    </div>
  );
};

export default LiteApiHotelMap;
