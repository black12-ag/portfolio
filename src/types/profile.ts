export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
};

export type Transaction = {
  id: string;
  type: 'charge' | 'refund';
  amount: number;
  currency: string;
  date: string; // ISO
  bookingRef?: string;
};

export type InvoiceProfile = {
  company?: string;
  taxId?: string;
  address?: string;
};

export type Traveler = {
  id: string;
  name: string;
  dob?: string;
  passport?: string;
  notes?: string;
};

export type TravelDocument = {
  id: string;
  name: string;
  type: 'passport' | 'id' | 'visa';
  size?: number;
  lastModified?: number;
  expires?: string;
};

export type VerificationState = {
  emailVerified: boolean;
  phoneVerified: boolean;
  totpEnabled: boolean;
};

export type Session = { id: string; device: string; ip: string; lastActive: string };

export type NotificationPrefs = { push: boolean; email: boolean; sms: boolean };

export type Alert = { id: string; route: string; priceThreshold?: number; active: boolean };

export type Review = { id: string; subject: string; rating: number; content: string; date: string };

export type Message = { id: string; from: 'me' | 'support' | 'host'; text: string; date: string };
export type Thread = { id: string; subject: string; messages: Message[] };
export type SavedSearch = { id: string; query: string; createdAt: string; alertsEnabled: boolean };


