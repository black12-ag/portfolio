/**
 * Hotel Search Component
 * Demonstrates LiteAPI integration with the METAH platform
 * Shows combined LiteAPI and custom hotel results
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useHotels, HotelSearchOptions, Hotel } from '../services/hotelManagementService';

interface HotelSearchProps {
  className?: string;
}

const HotelSearch: React.FC<HotelSearchProps> = ({ className = '' }) => {
  const [searchOptions, setSearchOptions] = useState<HotelSearchOptions>({
    countryCode: 'US',
    cityName: '',
    adults: 2,
    children: 0,
    limit: 24,
    source: 'all'
  });

  const { hotels, loading, error, refetch } = useHotels(searchOptions);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setSearchOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getLowestPrice = (hotel: Hotel): number => {
    const prices = hotel.rooms.map(room => room.price?.amount || 0).filter(price => price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const formatPrice = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < count ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const getSourceBadge = (hotel: Hotel) => {
    if (hotel.isLiteApiHotel) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          LiteAPI
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          METAH
        </span>
      );
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Hotels</h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Search */}
            <div>
              <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="cityName"
                type="text"
                value={searchOptions.cityName || ''}
                onChange={(e) => handleInputChange('cityName', e.target.value)}
                placeholder="Enter city name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country Code */}
            <div>
              <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="countryCode"
                value={searchOptions.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="AE">UAE</option>
              </select>
            </div>

            {/* Adults */}
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-1">
                Adults
              </label>
              <input
                id="adults"
                type="number"
                min="1"
                max="8"
                value={searchOptions.adults}
                onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Children */}
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">
                Children
              </label>
              <input
                id="children"
                type="number"
                min="0"
                max="8"
                value={searchOptions.children}
                onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Source
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'all', label: 'All Sources' },
                { value: 'liteapi', label: 'LiteAPI Only' },
                { value: 'custom', label: 'METAH Only' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={searchOptions.source === option.value}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Hotels'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Hotel Results {hotels.length > 0 && `(${hotels.length})`}
          </h2>
          {hotels.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing results from {searchOptions.source === 'all' ? 'all sources' : 
              searchOptions.source === 'liteapi' ? 'LiteAPI' : 'METAH platform'}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Searching hotels...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Hotel Results */}
        {!loading && hotels.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No hotels found. Try adjusting your search criteria.
            </div>
          </div>
        )}

        {/* Hotel Grid */}
        {hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Hotel Image */}
                <div className="relative h-48">
                  {hotel.images[0]?.url ? (
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-xs">No Image Available</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getSourceBadge(hotel)}
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center ml-2">
                      {renderStars(hotel.rating.stars)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {hotel.address.city}, {hotel.address.country}
                  </p>

                  <div className="flex items-center mb-3">
                    <span className="text-yellow-500 text-sm font-medium">
                      {hotel.rating.guestRating}/5
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({hotel.rating.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price and Book Button */}
                  <div className="flex justify-between items-center">
                    <div>
                      {getLowestPrice(hotel) > 0 ? (
                        <div>
                          <span className="text-sm text-gray-500">From</span>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(getLowestPrice(hotel))}
                          </div>
                          <span className="text-sm text-gray-500">per night</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Contact for pricing
                        </div>
                      )}
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700">
              Debug Information
            </summary>
            <div className="mt-2 text-sm">
              <p><strong>Search Options:</strong> {JSON.stringify(searchOptions, null, 2)}</p>
              <p><strong>Hotels Found:</strong> {hotels.length}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default HotelSearch;
