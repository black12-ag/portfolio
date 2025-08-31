import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import MobileMapFallback from './MobileMapFallback';

// Only import map components on web to avoid mobile bundle issues
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, useMap: any, Circle: any, Rectangle: any, ScaleControl: any, ZoomControl: any;
let L: any;
let leafletModulesLoaded = false;

// Function to dynamically load Leaflet modules
const loadLeafletModules = async () => {
  if (leafletModulesLoaded || Capacitor.isNativePlatform()) {
    return;
  }
  
  try {
    const [leafletComponents, leafletLib] = await Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]);
    
    MapContainer = leafletComponents.MapContainer;
    TileLayer = leafletComponents.TileLayer;
    Marker = leafletComponents.Marker;
    Popup = leafletComponents.Popup;
    useMap = leafletComponents.useMap;
    Circle = leafletComponents.Circle;
    Rectangle = leafletComponents.Rectangle;
    ScaleControl = leafletComponents.ScaleControl;
    ZoomControl = leafletComponents.ZoomControl;
    
    L = leafletLib.default;
    
    // Import CSS files only on web builds
    if (!import.meta.env.VITE_MOBILE_BUILD) {
      await Promise.all([
        import('leaflet/dist/leaflet.css'),
        import('leaflet.markercluster/dist/MarkerCluster.css'),
        import('leaflet.markercluster/dist/MarkerCluster.Default.css'),
        import('leaflet.markercluster')
      ]);
    }
    
    leafletModulesLoaded = true;
  } catch (error) {
    console.error('Failed to load Leaflet modules:', error);
  }
};

import { Property } from './PropertyCard';
import { MapPin, Navigation, Star, ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useWishlist } from '../hooks/useWishlist';

// Fix Leaflet default markers (only on web)
const fixLeafletDefaults = () => {
  if (!Capacitor.isNativePlatform() && L) {
delete (L.Icon.Default.prototype as unknown)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
  }
};

interface InteractiveMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  searchBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  onPropertySelect?: (property: Property) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
  showUserLocation?: boolean;
  searchLocation?: string;
  onClose?: () => void;
}

// Custom hotel marker icon
const createHotelIcon = (price?: number, isSelected = false) => {
  if (!L) return null;
  
  const color = isSelected ? '#3b82f6' : '#ef4444';
  const textColor = 'white';
  
  return L.divIcon({
    className: 'custom-hotel-marker',
    html: `
      <div style="
        background: ${color};
        color: ${textColor};
        border: 2px solid white;
        border-radius: 20px;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        ${price ? `$${price}` : '•'}
      </div>
    `,
    iconSize: [40, 30],
    iconAnchor: [20, 30],
  });
};

// User location icon
const createUserLocationIcon = () => {
  if (!L) return null;
  
  return L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        opacity: 0.3;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.1; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
};

// Global location defaults for different regions
const REGIONAL_CENTERS = {
  // Africa
  africa: [0.0, 20.0],
  ethiopia: [9.0, 38.75],
  kenya: [-1.28, 36.82],
  southAfrica: [-26.2, 28.0],
  
  // Europe
  europe: [50.0, 10.0],
  london: [51.5074, -0.1278],
  paris: [48.8566, 2.3522],
  
  // Asia
  asia: [35.0, 100.0],
  tokyo: [35.6762, 139.6503],
  mumbai: [19.0760, 72.8777],
  
  // Americas
  northAmerica: [45.0, -100.0],
  newYork: [40.7128, -74.0060],
  losAngeles: [34.0522, -118.2437],
  
  // Default world view
  world: [20.0, 0.0]
};

// Helper to get appropriate center based on user location or content
const getSmartCenter = (properties: Property[], fallback: [number, number] = REGIONAL_CENTERS.ethiopia): [number, number] => {
  // If we have properties, use their center
  if (properties.length > 0) {
    const validProperties = properties.filter((p: any) => p.extras?.coordinates?.lat && p.extras?.coordinates?.lng);
    if (validProperties.length > 0) {
      const lats = validProperties.map((p: any) => p.extras.coordinates.lat);
      const lngs = validProperties.map((p: any) => p.extras.coordinates.lng);
      return [
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      ];
    }
  }
  
  return fallback;
};

// Map bounds updater component
const MapBoundsUpdater: React.FC<{
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}> = ({ onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size shortly after mount/visibility changes to avoid grey tiles
    setTimeout(() => map.invalidateSize(), 50);

    let debounceTimer: number | null = null;
    const emitBounds = () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };
    const handleMoveEnd = () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(emitBounds, 250);
    };

    const handleMoveStart = () => {
      try { map.closePopup(); } catch (error) {
        // Silently handle popup close error
        console.debug('Popup close error:', error);
      }
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);
    map.on('movestart', handleMoveStart);
    map.whenReady(() => emitBounds());

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
      map.off('movestart', handleMoveStart);
      if (debounceTimer) window.clearTimeout(debounceTimer);
    };
  }, [map, onBoundsChange]);

  return null;
};

// Map cluster setup component
const MapClusterSetup: React.FC<{
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property;
}> = ({ properties, onPropertySelect, selectedProperty }) => {
  const map = useMap();
  const clusterGroupRef = useRef<any | null>(null);
  const { inWishlist, toggle } = useWishlist();

  useEffect(() => {
    if (!map) return;

    // Create cluster group
      const clusterGroup = (L as unknown).markerClusterGroup({
      chunkedLoading: true,
      chunkProgress: () => {},
      disableClusteringAtZoom: 16,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 45,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count >= 100) size = 'large';
        else if (count >= 10) size = 'medium';

        return L.divIcon({
          html: `<div style="
            background: #3b82f6;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ${size === 'small' ? 'width: 30px; height: 30px; font-size: 12px;' : ''}
            ${size === 'medium' ? 'width: 40px; height: 40px; font-size: 14px;' : ''}
            ${size === 'large' ? 'width: 50px; height: 50px; font-size: 16px;' : ''}
          ">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(size === 'small' ? 30 : size === 'medium' ? 40 : 50, 
                            size === 'small' ? 30 : size === 'medium' ? 40 : 50),
        });
      },
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!clusterGroupRef.current || !properties.length) return;

    // Clear existing markers (coalesced via requestAnimationFrame to avoid layout jank)
    const group = clusterGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // Helper to extract coordinates from property
    const getCoords = (p: Property): [number, number] | null => {
      const anyP: unknown = p as unknown;
      // extras.coordinates: { lat, lng }
      if (anyP.extras?.coordinates?.lat && anyP.extras?.coordinates?.lng) {
        return [anyP.extras.coordinates.lat, anyP.extras.coordinates.lng];
      }
      // direct lat/lng fields
      if (typeof anyP.lat === 'number' && typeof anyP.lng === 'number') {
        return [anyP.lat, anyP.lng];
      }
      // array coordinates [lat, lng]
      if (Array.isArray(anyP.coordinates) && anyP.coordinates.length === 2) {
        return [Number(anyP.coordinates[0]), Number(anyP.coordinates[1])];
      }
      // fallback by area/location keywords
      const areaToCoords: Record<string, [number, number]> = {
        bole: [8.994, 38.790],
        piazza: [9.037, 38.757],
        kazanchis: [9.012, 38.767],
        mexico: [9.010, 38.742],
        gerji: [8.995, 38.826],
        cmc: [9.006, 38.842],
        lebu: [8.960, 38.688],
        kirkos: [9.001, 38.760],
      };
      const area = (anyP.area || anyP.location || '').toString().toLowerCase();
      for (const key of Object.keys(areaToCoords)) {
        if (area.includes(key)) return areaToCoords[key];
      }
      return null;
    };

    // Add property markers
    properties.forEach((property) => {
      const coords = getCoords(property);
      if (!coords) return;

      const isSelected = selectedProperty?.id === property.id;
      const price = (property as unknown).price ?? (property as unknown).pricePerNight ?? 0;
      const marker = L.marker(coords, { icon: createHotelIcon(price, isSelected) });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.setAttribute('class', 'map-popup-content');
      popupContent.setAttribute('style', 'width: 300px; padding: 0;');

      const anyProp: unknown = property as unknown;
      const rooms: unknown[] = (anyProp.extras?.rooms || []) as unknown[];
      const topRoom = rooms
        .slice()
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];

      const roomHtml = topRoom
        ? `
        <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Popular room</div>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">${topRoom.name || 'Room'}</div>
              <div class="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">${topRoom.bedType || ''}${topRoom.capacity ? ` • Sleeps ${topRoom.capacity}` : ''}${topRoom.refundable ? ' • Free cancellation' : ''}</div>
              ${Array.isArray(topRoom.amenities) ? `<div class="mt-1 flex flex-wrap gap-1">${topRoom.amenities.slice(0,3).map((a:string)=>`<span class="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">${a}</span>`).join('')}</div>`:''}
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">$${topRoom.price ?? anyProp.price}</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400">per night</div>
            </div>
          </div>
        </div>`
        : '';

      popupContent.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div class="relative">
            <img 
              src="${property.images?.[0] || '/placeholder.svg'}" 
              alt="${property.title}"
              class="w-full h-32 object-cover"
              onerror="this.src='/placeholder.svg'"
            />
            <button 
              class="wishlist-btn absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:scale-110 transition-transform"
              data-property-id="${property.id}"
            >
              <svg class="h-4 w-4 ${inWishlist(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}" viewBox="0 0 24 24" fill="${inWishlist(property.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
          <div class="p-3">
            <h3 class="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">${property.title}</h3>
            <div class="flex items-center gap-1 mb-2">
              <svg class="h-3 w-3 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-xs text-gray-600 dark:text-gray-400">${property.rating || 'N/A'} (${property.reviews || 0} reviews)</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-lg font-bold text-gray-900 dark:text-gray-100">$${anyProp.price ?? anyProp.pricePerNight ?? 0}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">/night</span>
              </div>
              <button 
                class="view-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                data-property-id="${property.id}"
              >
                View Details
              </button>
            </div>
            ${roomHtml}
          </div>
        </div>
      `;

      // Add event listeners
      popupContent.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('wishlist-btn')) {
          e.preventDefault();
          e.stopPropagation();
          toggle(property.id);
          
          // Update heart icon
          const heartSvg = btn.querySelector('svg');
          if (heartSvg) {
            const isNowInWishlist = inWishlist(property.id);
            heartSvg.setAttribute('class', `h-4 w-4 ${isNowInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`);
            heartSvg.setAttribute('fill', isNowInWishlist ? 'currentColor' : 'none');
          }
        } else if (btn.classList.contains('view-btn')) {
          if (onPropertySelect) {
            onPropertySelect(property);
          }
        }
      });

      marker.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup', autoPanPadding: [24,24] });

      marker.on('click', () => {
        if (onPropertySelect) {
          onPropertySelect(property);
        }
        marker.openPopup();
      });
      // Only open on click, not hover, to prevent flicker

      clusterGroupRef.current?.addLayer(marker);
    });
  }, [properties, selectedProperty, onPropertySelect, inWishlist, toggle]);

  return null;
};

// User location component
const UserLocationMarker: React.FC<{ showUserLocation: boolean }> = ({ showUserLocation }) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!showUserLocation) {
      setUserPosition(null);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(pos);
          map.setView(pos, 13);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, [showUserLocation, map]);

  if (!userPosition) return null;

  const userLocationIcon = createUserLocationIcon();
  if (!userLocationIcon) return null;

  return (
    <>
      <Marker position={userPosition} icon={userLocationIcon}>
        <Popup>
          <div className="text-center p-2">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">Your Location</span>
            </div>
            <p className="text-sm text-gray-600">You are here</p>
          </div>
        </Popup>
      </Marker>
      <Circle
        center={userPosition}
        radius={1000}
        pathOptions={{ 
          color: '#3b82f6', 
          fillColor: '#3b82f6', 
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }}
      />
    </>
  );
};

// Search bounds overlay
const SearchBoundsOverlay: React.FC<{ 
  searchBounds?: InteractiveMapProps['searchBounds'];
  searchLocation?: string;
}> = ({ searchBounds, searchLocation }) => {
  if (!searchBounds) return null;

  const bounds: [number, number][] = [
    [searchBounds.south, searchBounds.west],
    [searchBounds.north, searchBounds.east],
  ];

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: '#3b82f6',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.1,
        dashArray: '10, 5',
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">Search Area</span>
          </div>
          {searchLocation && (
            <p className="text-sm text-gray-600">
              Results near: {searchLocation}
            </p>
          )}
        </div>
      </Popup>
    </Rectangle>
  );
};

// Internal map component (only rendered after modules are loaded)
const InteractiveMapInternal: React.FC<InteractiveMapProps> = ({
  properties,
  center = [9.0, 38.75], // Default to Addis Ababa (Ethiopia)
  zoom = 12,
  searchBounds,
  onPropertySelect,
  onBoundsChange,
  className = '',
  showUserLocation = false,
  searchLocation,
  onClose,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(getSmartCenter(properties, center));
  const [mapZoom, setMapZoom] = useState(zoom);
  const [tileStyle, setTileStyle] = useState<'light' | 'dark' | 'streets'>(() => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Fix Leaflet defaults after L is loaded
  useEffect(() => {
    fixLeafletDefaults();
  }, []);

  // Auto-center map based on properties
  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter((p: any) => p.extras?.coordinates?.lat && p.extras?.coordinates?.lng);
      if (validProperties.length > 0) {
        if (validProperties.length === 1) {
          const prop = validProperties[0];
          setMapCenter([prop.extras.coordinates.lat, prop.extras.coordinates.lng]);
          setMapZoom(14);
        } else {
          // Calculate bounds for multiple properties
          const lats = validProperties.map((p: any) => p.extras.coordinates.lat);
          const lngs = validProperties.map((p: any) => p.extras.coordinates.lng);
          const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
          const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
          setMapCenter([avgLat, avgLng]);
          setMapZoom(12);
        }
      }
    }
  }, [properties]);

  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  }, [onPropertySelect]);

  // Compute bounds for "fit to results"
  const fitResultsBounds = useCallback(() => {
    if (!L || !properties.length) return null;
    const valid = (properties as unknown[]).filter((p: any) => p.extras?.coordinates?.lat && p.extras?.coordinates?.lng);
    if (valid.length < 1) return null;
    const bounds = L.latLngBounds(valid.map((p: any) => [p.extras.coordinates.lat, p.extras.coordinates.lng] as [number, number]));
    return bounds;
  }, [properties]);

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Card className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{properties.length} properties</span>
          </div>
        </Card>
        
        {searchLocation && (
          <Card className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm max-w-48">
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              Searching: {searchLocation}
            </div>
          </Card>
        )}

        {/* Style switcher and utilities */}
        <Card className="p-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <button
              className={`px-2 py-1 rounded text-xs ${tileStyle==='light'?'bg-blue-600 text-white':'hover:bg-muted'}`}
              onClick={() => setTileStyle('light')}
            >Light</button>
            <button
              className={`px-2 py-1 rounded text-xs ${tileStyle==='dark'?'bg-blue-600 text-white':'hover:bg-muted'}`}
              onClick={() => setTileStyle('dark')}
            >Dark</button>
            <button
              className={`px-2 py-1 rounded text-xs ${tileStyle==='streets'?'bg-blue-600 text-white':'hover:bg-muted'}`}
              onClick={() => setTileStyle('streets')}
            >Streets</button>
            <button
              className="ml-2 px-2 py-1 rounded text-xs hover:bg-muted"
              onClick={() => {
                const map = (window as unknown)._leaflet_map_instance as L.Map | undefined;
                if (!map) return;
                const b = fitResultsBounds();
                if (b) map.fitBounds(b, { padding: [24, 24] });
              }}
            >Fit</button>
          </div>
        </Card>
      </div>

      {/* Close button */}
      {onClose && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] h-8 w-8 p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full rounded-lg overflow-hidden"
        preferCanvas={true}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
        worldCopyJump={true}
        whenReady={() => { const map = (window as unknown)._leaflet_map_instance ?? null; if (!map) { /* no-op */ } }}
      >
        {/* Zoom control bottom right for easier access */}
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        {tileStyle === 'light' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            maxZoom={19}
            detectRetina
            crossOrigin
          />
        )}
        {tileStyle === 'dark' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            maxZoom={19}
            detectRetina
            crossOrigin
          />
        )}
        {tileStyle === 'streets' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
            detectRetina
            crossOrigin
          />
        )}
        
        <MapBoundsUpdater onBoundsChange={onBoundsChange} />
        
        <MapClusterSetup
          properties={properties}
          onPropertySelect={handlePropertySelect}
          selectedProperty={selectedProperty}
        />
        
        <UserLocationMarker showUserLocation={showUserLocation} />
        
        <SearchBoundsOverlay 
          searchBounds={searchBounds}
          searchLocation={searchLocation}
        />
      </MapContainer>

      {/* Selected Property Card */}
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <div className="flex gap-3 p-3">
            <img
              src={selectedProperty.images?.[0] || '/placeholder.svg'}
              alt={selectedProperty.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{selectedProperty.title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedProperty.rating || 'N/A'} ({selectedProperty.reviews || 0})
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="font-bold">${selectedProperty.price}</span>
                  <span className="text-xs text-gray-500 ml-1">/night</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPropertySelect?.(selectedProperty)}
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProperty(null)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// Main wrapper component that handles loading and mobile fallback
export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use mobile fallback on Capacitor to avoid maps bundle issues
  if (Capacitor.isNativePlatform()) {
    return (
      <MobileMapFallback
        title="Interactive Property Map"
        description="Property locations and details"
        coordinates={props.center || [9.0, 38.75]}
        properties={props.properties.map(p => ({
          id: p.id,
          name: p.title,
          address: p.location,
          coordinates: p.coordinates
        }))}
        onLocationSelect={(coords) => props.onPropertySelect?.(props.properties.find(p => 
          p.coordinates && p.coordinates[0] === coords[0] && p.coordinates[1] === coords[1]
        ))}
        className={props.className}
      />
    );
  }

  // Load Leaflet modules on web
  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      try {
        await loadLeafletModules();
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative ${props.className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`relative ${props.className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}>
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Failed to load interactive map</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">{props.properties.length} properties available</p>
        </div>
      </div>
    );
  }

  // Render the actual map component
  return <InteractiveMapInternal {...props} />;
};

export default InteractiveMap;
