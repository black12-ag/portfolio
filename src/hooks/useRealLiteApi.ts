/**
 * React hooks for using real LiteAPI data
 * Separated from service for better Fast Refresh performance
 */

import { useState, useEffect } from 'react';
import realLiteApiService from '@/services/realLiteApiService';
import type { LiteApiHotel, LiteApiSearchParams } from '@/services/realLiteApiService';

export const useRealLiteApiHotels = (searchParams?: LiteApiSearchParams) => {
  const [hotels, setHotels] = useState<LiteApiHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async () => {
    if (!searchParams) return;

    setLoading(true);
    setError(null);

    try {
      const result = await realLiteApiService.searchHotels(searchParams);
      setHotels(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams) {
      fetchHotels();
    }
  }, [searchParams, fetchHotels]);

  return { hotels, loading, error, refetch: fetchHotels };
};

export const useRealLiteApiHotelDetails = (hotelId?: string, searchParams?: LiteApiSearchParams) => {
  const [hotel, setHotel] = useState<LiteApiHotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelDetails = async () => {
    if (!hotelId) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await realLiteApiService.getHotelDetails(hotelId, searchParams);
      setHotel(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId, searchParams, fetchHotelDetails]);

  return { hotel, loading, error, refetch: fetchHotelDetails };
};
