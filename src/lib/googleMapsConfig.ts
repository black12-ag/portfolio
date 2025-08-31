/**
 * Google Maps Configuration and Utilities
 * Centralized configuration for Google Maps API integration
 */

// Google Maps API Key from environment
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  libraries: ['places', 'geometry', 'directions'] as const,
  apiUrl: 'https://maps.googleapis.com/maps/api/js',
  
  // Default map options
  defaultMapOptions: {
    zoom: 15,
    mapTypeId: 'roadmap' as google.maps.MapTypeId,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  },

  // Default marker icon
  markerIcon: {
    url: `data:image/svg+xml;charset=UTF-8,${  encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="4"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
      </svg>
    `)}`,
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 }
  },

  // Regional defaults for different areas
  regionalCenters: {
    ethiopia: { lat: 9.0, lng: 38.75 },
    addisAbaba: { lat: 9.0319, lng: 38.7469 },
    world: { lat: 20.0, lng: 0.0 },
    africa: { lat: 0.0, lng: 20.0 },
    europe: { lat: 50.0, lng: 10.0 },
    asia: { lat: 35.0, lng: 100.0 },
    americas: { lat: 45.0, lng: -100.0 }
  }
};

// Load Google Maps script dynamically
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      resolve();
      return;
    }

    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not found in environment variables'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    const libraries = GOOGLE_MAPS_CONFIG.libraries.join(',');
    script.src = `${GOOGLE_MAPS_CONFIG.apiUrl}?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));

    document.head.appendChild(script);
  });
};

// Create marker with default styling
export const createMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  title: string,
  customIcon?: google.maps.Icon | google.maps.Symbol
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    title,
    animation: google.maps.Animation.DROP,
    icon: customIcon || {
      url: GOOGLE_MAPS_CONFIG.markerIcon.url,
      scaledSize: new google.maps.Size(
        GOOGLE_MAPS_CONFIG.markerIcon.scaledSize.width,
        GOOGLE_MAPS_CONFIG.markerIcon.scaledSize.height
      ),
      anchor: new google.maps.Point(
        GOOGLE_MAPS_CONFIG.markerIcon.anchor.x,
        GOOGLE_MAPS_CONFIG.markerIcon.anchor.y
      )
    }
  });
};

// Create info window with standard styling
export const createInfoWindow = (
  content: string,
  position?: google.maps.LatLngLiteral
): google.maps.InfoWindow => {
  return new google.maps.InfoWindow({
    content: `
      <div style="
        padding: 12px; 
        min-width: 200px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        ${content}
      </div>
    `,
    position
  });
};

// Generate directions URL
export const getDirectionsUrl = (
  destination: google.maps.LatLngLiteral,
  origin?: google.maps.LatLngLiteral
): string => {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`
  });

  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

// Check if Google Maps API key is configured
export const isGoogleMapsConfigured = (): boolean => {
  return Boolean(GOOGLE_MAPS_API_KEY);
};

// Get appropriate regional center based on coordinates
export const getRegionalCenter = (
  coordinates?: google.maps.LatLngLiteral
): google.maps.LatLngLiteral => {
  if (!coordinates) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.ethiopia;
  }

  // Simple region detection based on coordinates
  const { lat, lng } = coordinates;

  // Ethiopia region
  if (lat >= 3 && lat <= 15 && lng >= 33 && lng <= 48) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.ethiopia;
  }

  // Africa
  if (lat >= -35 && lat <= 37 && lng >= -25 && lng <= 55) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.africa;
  }

  // Europe
  if (lat >= 35 && lat <= 71 && lng >= -25 && lng <= 45) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.europe;
  }

  // Asia
  if (lat >= -10 && lat <= 70 && lng >= 45 && lng <= 180) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.asia;
  }

  // Americas
  if (lng >= -180 && lng <= -30) {
    return GOOGLE_MAPS_CONFIG.regionalCenters.americas;
  }

  // Default to world view
  return GOOGLE_MAPS_CONFIG.regionalCenters.world;
};

// Declare global types for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export default {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_CONFIG,
  loadGoogleMapsScript,
  createMarker,
  createInfoWindow,
  getDirectionsUrl,
  isGoogleMapsConfigured,
  getRegionalCenter
};
