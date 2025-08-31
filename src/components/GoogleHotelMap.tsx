import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UnifiedHotel } from '@/services/unifiedHotelService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Star,
  DollarSign,
  Eye,
  Calendar,
  Users
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface GoogleHotelMapProps {
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

declare global {
  interface Window {
    google: any;
    MarkerClusterer: any;
    GridAlgorithm: any;
  }
}

// TypeScript declarations for Google Maps
type GoogleMap = any;
type GoogleMarker = any;
type GoogleInfoWindow = any;

const GoogleHotelMap: React.FC<GoogleHotelMapProps> = ({
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
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const infoWindowRef = useRef<GoogleInfoWindow | null>(null);
  const clustererRef = useRefunknown(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { formatPrice } = useCurrency();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured for manual hotels');
      return;
    }

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = async () => {
      // Load marker clusterer
      try {
        const clustererScript = document.createElement('script');
        clustererScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        clustererScript.onload = () => setIsLoaded(true);
        clustererScript.onerror = () => {
          if (import.meta.env.MODE === 'development') {
            console.warn('Marker clusterer failed to load, continuing without clustering');
          }
          setIsLoaded(true);
        };
        document.head.appendChild(clustererScript);
      } catch (error) {
        if (import.meta.env.MODE === 'development') {
          console.warn('Could not load marker clusterer:', error);
        }
        setIsLoaded(true);
      }
    };
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps) return;

    const mapCenter = center 
      ? { lat: center[0], lng: center[1] }
      : hotels.length > 0 
      ? { lat: hotels[0].location.latitude, lng: hotels[0].location.longitude }
      : { lat: 9.0, lng: 38.75 }; // Default to Addis Ababa

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'on' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false, // We handle fullscreen ourselves
      zoomControl: showControls,
    });

    googleMapRef.current = map;

    // Create info window
    infoWindowRef.current = new window.google.maps.InfoWindow({
      maxWidth: 300,
    });

    if (import.meta.env.MODE === 'development') {
      console.log('🗺️ Google Maps initialized for manual hotels');
    }
  }, [isLoaded, center, zoom, showControls]);

  // Create custom marker icon that exactly matches LiteAPI styling
  const createLiteApiCloneIcon = useCallback((hotel: UnifiedHotel, isSelected = false) => {
    const isLiteApi = hotel.source === 'liteapi';
    const baseColor = isLiteApi ? '#3B82F6' : '#10B981'; // Blue for LiteAPI, Green for manual
    const selectedColor = '#EF4444';
    const color = isSelected ? selectedColor : baseColor;
    
    const price = hotel.pricing?.baseRate ? `$${Math.round(hotel.pricing.baseRate)}` : '';
    const stars = hotel.rating?.stars || 0;
    
    // Create the exact same HTML structure as LiteAPI map
    const markerHTML = `
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
        <!-- Price bubble (exact same as LiteAPI) -->
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
        
        <!-- Main marker (exact same as LiteAPI) -->
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
            font-weight: bold;
            color: #1f2937;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ">${stars}</div>
        </div>
        
        <!-- Pointer (exact same as LiteAPI) -->
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -2px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        "></div>
      </div>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <foreignObject x="0" y="0" width="80" height="100">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${markerHTML}
            </div>
          </foreignObject>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(80, 100),
      anchor: new window.google.maps.Point(40, 85)
    };
  }, []);

  // Update markers when hotels change
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps) return;

    // Clear existing markers and clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for hotels
    const newMarkers: GoogleMarker[] = [];
    
    hotels.forEach(hotel => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: hotel.location.latitude,
          lng: hotel.location.longitude
        },
        title: hotel.name,
        icon: createLiteApiCloneIcon(hotel, selectedHotel?.id === hotel.id),
      });

      // Create info window content (exact same as LiteAPI popup)
      const isLiteApi = hotel.source === 'liteapi';
      const amenityIcons = {
        wifi: '📶',
        parking: '🅿️', 
        breakfast: '🍳',
        pool: '🏊',
        gym: '💪',
        spa: '🧘'
      };
      
      const infoContent = `
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 320px;
          padding: 0;
          margin: 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        ">
          <!-- Hotel Image -->
          <div style="position: relative; height: 120px; background: #f3f4f6; overflow: hidden;">
            ${hotel.images.thumbnail || hotel.images.main ? `
              <img src="${hotel.images.thumbnail || hotel.images.main}" 
                   alt="${hotel.name}"
                   style="width: 100%; height: 100%; object-fit: cover;">
            ` : `
              <div style="
                width: 100%; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: #9ca3af; 
                font-size: 24px;
              ">🏨</div>
            `}
            
            <!-- Source Badge -->
            <div style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: ${isLiteApi ? '#3B82F6' : '#10B981'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              ${isLiteApi ? 'LiteAPI' : 'Manual'}
            </div>
          </div>
          
          <!-- Hotel Details -->
          <div style="padding: 16px;">
            <!-- Hotel Name & Rating -->
            <div style="margin-bottom: 8px;">
              <h3 style="
                margin: 0 0 4px 0;
                color: #1f2937;
                font-size: 18px;
                font-weight: 700;
                line-height: 1.2;
              ">${hotel.name}</h3>
              
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="display: flex; align-items: center;">
                  ${[...Array(5)].map((_, i) => 
                    `<span style="color: ${i < (hotel.rating?.stars || 0) ? '#F59E0B' : '#E5E7EB'}; font-size: 14px;">★</span>`
                  ).join('')}
                </div>
                <span style="color: #6b7280; font-size: 12px;">
                  ${hotel.rating?.stars || 0} stars
                </span>
              </div>
            </div>
            
            <!-- Location -->
            <div style="
              display: flex; 
              align-items: center; 
              gap: 4px; 
              margin-bottom: 12px;
              color: #6b7280;
              font-size: 13px;
            ">
              <span>📍</span>
              <span>${hotel.location.city}, ${hotel.location.country}</span>
            </div>
            
            <!-- Description -->
            ${hotel.description ? `
              <p style="
                margin: 0 0 12px 0;
                color: #4b5563;
                font-size: 13px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              ">${hotel.description}</p>
            ` : ''}
            
            <!-- Amenities -->
            ${hotel.amenities && hotel.amenities.length > 0 ? `
              <div style="
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 12px;
              ">
                ${hotel.amenities.slice(0, 4).map(amenity => `
                  <span style="
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 11px;
                    color: #6b7280;
                  ">
                    ${amenityIcons[amenity.toLowerCase()] || '✓'}
                    <span>${amenity}</span>
                  </span>
                `).join('')}
                ${hotel.amenities.length > 4 ? `
                  <span style="
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 11px;
                    color: #6b7280;
                  ">+${hotel.amenities.length - 4} more</span>
                ` : ''}
              </div>
            ` : ''}
            
            <!-- Price -->
            ${hotel.pricing?.baseRate ? `
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 8px 12px;
                background: #f8fafc;
                border-radius: 8px;
              ">
                <div>
                  <div style="
                    color: #1f2937;
                    font-size: 20px;
                    font-weight: 700;
                  ">${formatPrice(hotel.pricing.baseRate, 'USD')}</div>
                  <div style="
                    color: #6b7280;
                    font-size: 12px;
                  ">per night</div>
                </div>
                <div style="
                  color: #10b981;
                  font-size: 12px;
                  font-weight: 600;
                ">💰 Best Price</div>
              </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 8px;">
              <button onclick="window.selectHotel('${hotel.id}')" style="
                flex: 1;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
              ">
                👁️ View Details
              </button>
              <button onclick="window.bookHotel('${hotel.id}')" style="
                flex: 1;
                background: ${isLiteApi ? '#3B82F6' : '#10B981'};
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
              ">
                📅 Book Now
              </button>
            </div>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        infoWindowRef.current?.setContent(infoContent);
        infoWindowRef.current?.open(googleMapRef.current, marker);
        onHotelSelect(hotel);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Set up clustering (exactly like LiteAPI map)
    if (window.MarkerClusterer && newMarkers.length > 0) {
      clustererRef.current = new window.MarkerClusterer({
        map: googleMapRef.current,
        markers: newMarkers,
        algorithm: new window.GridAlgorithm({ maxDistance: 50 }),
        renderer: {
          render: ({ count, position }: any) => {
            // Create cluster icon that matches LiteAPI style
            const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
            const color = '#3B82F6'; // Same blue as LiteAPI clusters
            
            return new window.google.maps.Marker({
              position,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="22" fill="${color}" fill-opacity="0.8" stroke="white" stroke-width="3"/>
                    <text x="25" y="29" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
                      ${count}
                    </text>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(
                  size === 'small' ? 40 : size === 'medium' ? 50 : 60,
                  size === 'small' ? 40 : size === 'medium' ? 50 : 60
                ),
                anchor: new window.google.maps.Point(
                  size === 'small' ? 20 : size === 'medium' ? 25 : 30,
                  size === 'small' ? 20 : size === 'medium' ? 25 : 30
                )
              },
              label: undefined,
              zIndex: 999
            });
          }
        }
      });
    } else {
      // No clustering available, add markers directly to map
      newMarkers.forEach(marker => marker.setMap(googleMapRef.current));
    }

    // Set up global functions for info window buttons
    (window as unknown).selectHotel = (hotelId: string) => {
      const hotel = hotels.find(h => h.id === hotelId);
      if (hotel) onHotelSelect(hotel);
    };

    (window as unknown).bookHotel = (hotelId: string) => {
      const hotel = hotels.find(h => h.id === hotelId);
      if (hotel) onHotelBook(hotel);
    };

    // Fit bounds to show all markers
    if (hotels.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      hotels.forEach(hotel => {
        bounds.extend({
          lat: hotel.location.latitude,
          lng: hotel.location.longitude
        });
      });
      googleMapRef.current?.fitBounds(bounds);
      
      // Don't zoom in too much for single hotel
      if (hotels.length === 1) {
        setTimeout(() => {
          const currentZoom = googleMapRef.current?.getZoom();
          if (currentZoom && currentZoom > 15) {
            googleMapRef.current?.setZoom(15);
          }
        }, 100);
      }
    }

    if (import.meta.env.MODE === 'development') {
      console.log(`🗺️ Google Maps (LiteAPI Clone) updated with ${hotels.length} hotels, clustering: ${!!window.MarkerClusterer}`);
    }
  }, [hotels, selectedHotel, createLiteApiCloneIcon, onHotelSelect, onHotelBook, formatPrice]);

  // Handle selected hotel change
  useEffect(() => {
    if (!selectedHotel || !googleMapRef.current) return;

    // Update marker icons
    markersRef.current.forEach((marker, index) => {
      const hotel = hotels[index];
      if (hotel) {
        marker.setIcon(createLiteApiCloneIcon(hotel, selectedHotel.id === hotel.id));
      }
    });

    // Pan to selected hotel
    if (selectedHotel.location) {
      googleMapRef.current.panTo({
        lat: selectedHotel.location.latitude,
        lng: selectedHotel.location.longitude
      });
    }
  }, [selectedHotel, hotels, createLiteApiCloneIcon]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-600 p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium mb-2">Map Not Available</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-75">Manual hotels require Google Maps API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-600 p-8">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-medium">Loading Google Maps...</p>
          <p className="text-sm mt-1">For manual hotel locations</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`google-hotel-map-container relative ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`} 
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Badge variant="default" className="bg-blue-600 text-white shadow-lg">
            <MapPin className="h-3 w-3 mr-1" />
            LiteAPI Style
          </Badge>
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm text-xs">
            Google Maps API
          </Badge>
          
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm shadow-lg h-8 w-8 p-0"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Hotel Count Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-blue-600 text-white shadow-lg">
          {hotels.length} Hotel{hotels.length !== 1 ? 's' : ''} 
          <span className="ml-1 text-blue-200">• LiteAPI Style</span>
        </Badge>
      </div>

      {/* Google Maps Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default GoogleHotelMap;
