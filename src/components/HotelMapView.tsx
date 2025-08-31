import React, { useMemo, memo, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import NoMapComponent from '@/stubs/NoMapComponent';
import { UnifiedHotel } from '@/services/unifiedHotelService';
import { LiteApiHotelMap } from './LiteApiHotelMap';
import { HybridHotelMap } from './HybridHotelMap';
if (import.meta.env.VITE_MOBILE_BUILD !== 'true') {
  // Only load CSS on web builds
  import('leaflet/dist/leaflet.css');
}

interface HotelMapViewProps {
  hotels: UnifiedHotel[];
  selectedHotel?: UnifiedHotel | null;
  onHotelSelect: (hotel: UnifiedHotel) => void;
  onHotelBook?: (hotel: UnifiedHotel) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  showPopups?: boolean;
  center?: [number, number];
  zoom?: number;
}

const HotelMapView = memo(function HotelMapView({
  hotels,
  selectedHotel,
  onHotelSelect,
  onHotelBook = () => {},
  className = '',
  height = '500px',
  showControls = true,
  center,
  zoom,
}: HotelMapViewProps) {
  // Analyze hotel sources to determine optimal map implementation
  const mapStrategy = useMemo(() => {
    const sources = hotels.map(h => h.source);
    const hasLiteApi = sources.includes('liteapi');
    const hasManual = sources.includes('manual');
    
    // If only LiteAPI hotels, use LiteAPI map
    if (hasLiteApi && !hasManual) {
      return 'liteapi-only';
    }
    
    // If only manual hotels, use Google Maps
    if (hasManual && !hasLiteApi) {
      return 'manual-only';
    }
    
    // Mixed sources: use hybrid map
    return 'hybrid';
  }, [hotels]);

  console.log(`🗺️ Map Strategy: ${mapStrategy} (${hotels.length} hotels)`);

  // On native (mobile) disable maps entirely
  if (Capacitor.isNativePlatform()) {
    return <NoMapComponent />;
  }

  // For pure LiteAPI hotels, use the optimized LiteAPI map
  if (mapStrategy === 'liteapi-only') {
    return (
      <LiteApiHotelMap
        hotels={hotels}
        selectedHotel={selectedHotel}
        onHotelSelect={onHotelSelect}
        onHotelBook={onHotelBook}
        className={className}
        height={height}
        showControls={showControls}
        center={center}
        zoom={zoom}
      />
    );
  }

  // For mixed sources or manual-only, use the hybrid map
  return (
    <HybridHotelMap
      hotels={hotels}
      selectedHotel={selectedHotel}
      onHotelSelect={onHotelSelect}
      onHotelBook={onHotelBook}
      className={className}
      height={height}
      center={center}
      zoom={zoom}
    />
  );
});

export default HotelMapView;
