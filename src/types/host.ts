export interface HostApplication {
  id: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
  };
  property: {
    title: string;
    description: string;
    type: 'apartment' | 'house' | 'room' | 'villa' | 'hotel';
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
    amenities: string[];
    rules: string[];
    photos: string[]; // data urls or remote urls
    basePrice: number;
    currency: string;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    availabilityNote?: string;
  };
  payout: {
    method: 'bank' | 'paypal';
    accountName?: string;
    iban?: string;
    swift?: string;
    paypalEmail?: string;
  };
  verification: {
    idType: 'national_id' | 'passport' | 'license';
    idNumber: string;
    idPhotos: string[];
    agreeToTerms: boolean;
  };
  createdAt: string;
}


