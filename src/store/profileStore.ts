import { useSyncExternalStore } from 'react';
import type {
  PaymentMethod, Transaction, InvoiceProfile, Traveler, TravelDocument, VerificationState,
  Session, NotificationPrefs, Alert, Review, Thread
} from '@/types/profile';

type ProfileState = {
  // Payments
  methods: PaymentMethod[];
  transactions: Transaction[];
  invoiceProfile: InvoiceProfile;

  // Travelers & docs
  travelers: Traveler[];
  documents: TravelDocument[];
  verification: VerificationState;

  // Security
  sessions: Session[];

  // Notifications & Alerts
  notificationPrefs: NotificationPrefs;
  alerts: Alert[];

  // Social
  reviews: Review[];
  threads: Thread[];
  coupons: string[];
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tickets: { id: string; bookingRef: string; date: string; status: 'issued' | 'used' | 'cancelled' }[];
  referralCode: string;
  connectedAccounts: string[]; // e.g., ['google','facebook']
  recoveryCodes: string[];
  savedSearches: import('@/types/profile').SavedSearch[];
  unreadCounts: { notifications: number; messages: number };

  // Actions
  addMethod: (m: PaymentMethod) => void;
  removeMethod: (id: string) => void;
  makeDefaultMethod: (id: string) => void;
  addTransaction: (t: Transaction) => void;
  setInvoiceProfile: (p: InvoiceProfile) => void;

  addTraveler: (t: Traveler) => void;
  removeTraveler: (id: string) => void;
  addDocument: (d: TravelDocument) => void;
  removeDocument: (id: string) => void;
  setVerification: (v: Partial<VerificationState>) => void;

  addSession: (s: Session) => void;
  revokeSession: (id: string) => void;

  setNotificationPrefs: (p: Partial<NotificationPrefs>) => void;
  addAlert: (a: Alert) => void;
  updateAlert: (id: string, a: Partial<Alert>) => void;
  removeAlert: (id: string) => void;

  addReview: (r: Review) => void;
  removeReview: (id: string) => void;
  addMessage: (threadId: string, message: Thread['messages'][number]) => void;
  addCoupon: (code: string) => void;
  removeCoupon: (code: string) => void;
  addPoints: (points: number) => void;
  redeemPoints: (points: number) => void;
  regenerateReferral: () => void;
  addThread: (t: Thread) => void;
  linkAccount: (provider: string) => void;
  unlinkAccount: (provider: string) => void;
  generateRecoveryCodes: (count?: number) => void;
  addSavedSearch: (s: import('@/types/profile').SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  toggleSavedSearchAlerts: (id: string, enabled: boolean) => void;
  incrementUnread: (key: 'notifications' | 'messages', by?: number) => void;
  markAllRead: (key: 'notifications' | 'messages') => void;
};

type StoreData = {
  methods: PaymentMethod[];
  transactions: Transaction[];
  invoiceProfile: InvoiceProfile;
  travelers: Traveler[];
  documents: TravelDocument[];
  verification: VerificationState;
  sessions: Session[];
  notificationPrefs: NotificationPrefs;
  alerts: Alert[];
  reviews: Review[];
  threads: Thread[];
  coupons: string[];
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tickets: { id: string; bookingRef: string; date: string; status: 'issued' | 'used' | 'cancelled' }[];
  referralCode: string;
  connectedAccounts: string[];
  recoveryCodes: string[];
  savedSearches: import('@/types/profile').SavedSearch[];
  unreadCounts: { notifications: number; messages: number };
};

const STORAGE_KEY = 'metah-profile-store';

const defaultData: StoreData = {
  methods: [{ id: 'pm_1', brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2028, isDefault: true }],
  transactions: [
    { id: 'rcp_1', type: 'charge', amount: 120.0, currency: 'USD', date: new Date().toISOString(), bookingRef: 'BK12345' },
    { id: 'rcp_2', type: 'refund', amount: 30.0, currency: 'USD', date: new Date(Date.now() - 86400000).toISOString(), bookingRef: 'BK12345' },
  ],
  invoiceProfile: {},
  travelers: [],
  documents: [],
  verification: { emailVerified: false, phoneVerified: false, totpEnabled: false },
  sessions: [
    { id: 'sess1', device: 'Mac Safari', ip: '192.168.1.10', lastActive: new Date().toISOString() },
    { id: 'sess2', device: 'iPhone App', ip: '10.0.0.5', lastActive: new Date(Date.now() - 3600_000).toISOString() },
  ],
  notificationPrefs: { push: true, email: true, sms: false },
  alerts: [{ id: 'al1', route: 'Addis → Lalibela', priceThreshold: 100, active: true }],
  reviews: [],
  threads: [{ id: 't1', subject: 'Booking BK12345', messages: [{ id: 'm1', from: 'support', text: 'How can we help?', date: new Date().toISOString() }] }],
  coupons: [],
  loyaltyPoints: 2500,
  loyaltyTier: 'Silver',
  tickets: [{ id: 'tk1', bookingRef: 'BK12345', date: new Date().toISOString(), status: 'issued' }],
  referralCode: 'abcd1234',
  connectedAccounts: [],
  recoveryCodes: [],
  savedSearches: [],
  unreadCounts: { notifications: 0, messages: 0 },
};

function loadData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed } as StoreData;
  } catch {
    return defaultData;
  }
}

function saveData(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

let data: StoreData = loadData();

const listeners = new Set<() => void>();

function notify() {
  saveData(data);
  listeners.forEach((l) => l());
}

function buildState(): ProfileState {
  return {
    ...data,
    addMethod: (m) => { data = { ...data, methods: [m, ...data.methods] }; notify(); },
    removeMethod: (id) => { data = { ...data, methods: data.methods.filter((x) => x.id !== id) }; notify(); },
    makeDefaultMethod: (id) => { data = { ...data, methods: data.methods.map((x) => ({ ...x, isDefault: x.id === id })) }; notify(); },
    addTransaction: (t) => { data = { ...data, transactions: [t, ...data.transactions] }; notify(); },
    setInvoiceProfile: (p) => { data = { ...data, invoiceProfile: { ...data.invoiceProfile, ...p } }; notify(); },
    addTraveler: (t) => { data = { ...data, travelers: [t, ...data.travelers] }; notify(); },
    removeTraveler: (id) => { data = { ...data, travelers: data.travelers.filter((x) => x.id !== id) }; notify(); },
    addDocument: (d) => { data = { ...data, documents: [d, ...data.documents] }; notify(); },
    removeDocument: (id) => { data = { ...data, documents: data.documents.filter((x) => x.id !== id) }; notify(); },
    setVerification: (v) => { data = { ...data, verification: { ...data.verification, ...v } }; notify(); },
    addSession: (s) => { data = { ...data, sessions: [s, ...data.sessions] }; notify(); },
    revokeSession: (id) => { data = { ...data, sessions: data.sessions.filter((x) => x.id !== id) }; notify(); },
    setNotificationPrefs: (p) => { data = { ...data, notificationPrefs: { ...data.notificationPrefs, ...p } }; notify(); },
    addAlert: (a) => { data = { ...data, alerts: [a, ...data.alerts] }; notify(); },
    updateAlert: (id, a) => { data = { ...data, alerts: data.alerts.map((x) => (x.id === id ? { ...x, ...a } : x)) }; notify(); },
    removeAlert: (id) => { data = { ...data, alerts: data.alerts.filter((x) => x.id !== id) }; notify(); },
    addReview: (r) => { data = { ...data, reviews: [r, ...data.reviews] }; notify(); },
    removeReview: (id) => { data = { ...data, reviews: data.reviews.filter((x) => x.id !== id) }; notify(); },
    addMessage: (threadId, message) => {
      data = {
        ...data,
        threads: data.threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, message] } : t)),
      };
      data = { ...data, unreadCounts: { ...data.unreadCounts, messages: data.unreadCounts.messages + 1 } };
      notify();
    },
    addThread: (t) => { data = { ...data, threads: [t, ...data.threads] }; notify(); },
    addCoupon: (code) => {
      const upper = code.toUpperCase();
      data = { ...data, coupons: [upper, ...data.coupons.filter((c) => c.toUpperCase() !== upper)] };
      notify();
    },
    removeCoupon: (code) => { data = { ...data, coupons: data.coupons.filter((c) => c !== code) }; notify(); },
    addPoints: (points) => { data = { ...data, loyaltyPoints: data.loyaltyPoints + points }; notify(); },
    redeemPoints: (points) => { data = { ...data, loyaltyPoints: Math.max(0, data.loyaltyPoints - points) }; notify(); },
    regenerateReferral: () => { data = { ...data, referralCode: Math.random().toString(36).slice(2, 10) }; notify(); },
    linkAccount: (provider) => { data = { ...data, connectedAccounts: Array.from(new Set([provider, ...data.connectedAccounts])) }; notify(); },
    unlinkAccount: (provider) => { data = { ...data, connectedAccounts: data.connectedAccounts.filter((p) => p !== provider) }; notify(); },
    generateRecoveryCodes: (count = 8) => {
      data = {
        ...data,
        recoveryCodes: Array.from({ length: count }, () => Math.random().toString(36).slice(2, 10)),
      };
      notify();
    },
    addSavedSearch: (s) => { data = { ...data, savedSearches: [s, ...data.savedSearches] }; notify(); },
    removeSavedSearch: (id) => { data = { ...data, savedSearches: data.savedSearches.filter((x) => x.id !== id) }; notify(); },
    toggleSavedSearchAlerts: (id, enabled) => { data = { ...data, savedSearches: data.savedSearches.map((x) => x.id === id ? { ...x, alertsEnabled: enabled } : x) }; notify(); },
    incrementUnread: (key, by = 1) => { data = { ...data, unreadCounts: { ...data.unreadCounts, [key]: data.unreadCounts[key] + by } as any }; notify(); },
    markAllRead: (key) => { data = { ...data, unreadCounts: { ...data.unreadCounts, [key]: 0 } }; notify(); },
  };
}

let state: ProfileState = buildState();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProfileStore<T>(selector: (s: ProfileState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// Keep state reference updated after each notify
listeners.add(() => {
  state = buildState();
});

// Zustand-free custom store finished above


