/**
 * Admin Hotel Management Component
 * Provides interface for managing custom hotels (CRUD operations)
 * Role-based access control for admin/manager users
 */

import React, { useState, useEffect } from 'react';
import { useCustomHotels, CustomHotel } from '../services/hotelManagementService';

interface AdminHotelManagementProps {
  className?: string;
}

const AdminHotelManagement: React.FC<AdminHotelManagementProps> = ({ className = '' }) => {
  const { hotels, createHotel, updateHotel, deleteHotel, refreshHotels } = useCustomHotels();
  const [selectedHotel, setSelectedHotel] = useState<CustomHotel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CustomHotel>>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      countryCode: 'US',
      postalCode: ''
    },
    location: {
      latitude: 0,
      longitude: 0
    },
    rating: {
      stars: 3,
      guestRating: 4.0,
      reviewCount: 0
    },
    images: [{
      url: '',
      caption: 'Hotel Exterior',
      isPrimary: true
    }],
    amenities: [],
    rooms: [{
      id: 'room_1',
      name: 'Standard Room',
      description: '',
      maxOccupancy: 2,
      bedType: 'Queen',
      size: '25 sqm',
      images: [],
      amenities: [],
      price: {
        amount: 100,
        currency: 'USD'
      }
    }],
    policies: {
      checkinTime: '15:00',
      checkoutTime: '11:00',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
      petPolicy: 'No pets allowed',
      smokingPolicy: 'Non-smoking property'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    isActive: true
  });

  const commonAmenities = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Business Center',
    'Concierge', 'Room Service', 'Laundry', 'Parking', 'Pet Friendly',
    'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchen', 'TV', 'Safe'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        countryCode: 'US',
        postalCode: ''
      },
      location: {
        latitude: 0,
        longitude: 0
      },
      rating: {
        stars: 3,
        guestRating: 4.0,
        reviewCount: 0
      },
      images: [{
        url: '',
        caption: 'Hotel Exterior',
        isPrimary: true
      }],
      amenities: [],
      rooms: [{
        id: 'room_1',
        name: 'Standard Room',
        description: '',
        maxOccupancy: 2,
        bedType: 'Queen',
        size: '25 sqm',
        images: [],
        amenities: [],
        price: {
          amount: 100,
          currency: 'USD'
        }
      }],
      policies: {
        checkinTime: '15:00',
        checkoutTime: '11:00',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        petPolicy: 'No pets allowed',
        smokingPolicy: 'Non-smoking property'
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      isActive: true
    });
    setSelectedHotel(null);
    setIsEditing(false);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (hotel: CustomHotel) => {
    setFormData(hotel);
    setSelectedHotel(hotel);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleDelete = async (hotel: CustomHotel) => {
    if (window.confirm(`Are you sure you want to delete "${hotel.name}"?`)) {
      try {
        setLoading(true);
        await deleteHotel(hotel.id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete hotel');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && selectedHotel) {
        await updateHotel(selectedHotel.id, formData);
      } else {
        await createHotel(formData as Omit<CustomHotel, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'source' | 'isLiteApiHotel'>);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hotel');
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
          <p className="text-gray-600 mt-2">Manage custom hotels for the METAH platform</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Hotel
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Hotel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateFormField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stars</label>
                    <select
                      value={formData.rating?.stars || 3}
                      onChange={(e) => updateNestedField('rating', 'stars', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(star => (
                        <option key={star} value={star}>{star} Star</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        value={formData.address?.street || ''}
                        onChange={(e) => updateNestedField('address', 'street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.address?.city || ''}
                        onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.address?.state || ''}
                        onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.address?.country || ''}
                        onChange={(e) => updateNestedField('address', 'country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {commonAmenities.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.amenities?.includes(amenity) || false}
                          onChange={() => toggleAmenity(amenity)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.contact?.phone || ''}
                        onChange={(e) => updateNestedField('contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.contact?.email || ''}
                        onChange={(e) => updateNestedField('contact', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={formData.contact?.website || ''}
                        onChange={(e) => updateNestedField('contact', 'website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Custom Hotels ({hotels.length})
          </h2>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No custom hotels found. Create your first hotel to get started.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-4"
                          src={hotel.images[0]?.url || ''}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500">{hotel.rating.stars} stars</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hotel.address.city}, {hotel.address.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hotel.rating.guestRating}/5 ({hotel.rating.reviewCount} reviews)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hotel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(hotel.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hotel)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHotelManagement;
