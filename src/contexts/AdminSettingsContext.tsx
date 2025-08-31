import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

type SocialLinks = {
  facebook?: string;
  twitter?: string; // X/Twitter
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
};

type AppStoreLinks = {
  appStore?: string; // Apple App Store URL
  playStore?: string; // Google Play URL
};

type GeneralSettings = {
  siteName: string;
  logoUrl: string;
  primaryColor: string; // hex string
};

type ContactSettings = {
  phone?: string;
  email?: string;
  address?: string;
  socials: SocialLinks;
  stores: AppStoreLinks;
};

type PoliciesSettings = {
  privacy?: string; // HTML or markdown
  terms?: string;
  cookies?: string;
  sitemap?: string;
};

type LocalizationSettings = {
  defaultLanguage: string; // language code
  enabledLanguages: string[];
  defaultCurrency: string; // currency code
  enabledCurrencies: string[];
};

export interface AdminSettings {
  // General settings
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  
  // Contact information
  contacts: {
    phone: string;
    email: string;
    address: string;
  };
  
  // Social media links
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
    telegram: string;
  };
  
  // App store links
  appStoreLinks: {
    ios: string;
    android: string;
  };
  
  // Policy content
  policies: {
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    sitemap: string;
  };
  
  // Localization settings
  defaultLanguage: string;
  defaultCurrency: string;
  enabledLanguages: string[];
  enabledCurrencies: string[];
  
  // Support contact settings
  supportContacts: {
    phone: string;
    whatsapp: string;
    email: string;
    liveChatEnabled: boolean;
    businessHours: string;
    emergencyContact: string;
  };
}

const STORAGE_KEY = 'metah-admin-settings';

const defaultSettings: AdminSettings = {
  siteName: 'Metah',
  logoUrl: '/logo.png',
  primaryColor: '#3b82f6',
  contacts: {
    phone: '+1 (555) 123-4567',
    email: 'info@metah.com',
    address: '123 Travel Street, City, Country',
  },
  socialLinks: {
    facebook: 'https://facebook.com/metah',
    twitter: 'https://twitter.com/metah',
    instagram: 'https://instagram.com/metah',
    youtube: 'https://youtube.com/metah',
    whatsapp: '+15551234567',
    telegram: '@metah_support',
  },
  appStoreLinks: {
    ios: 'https://apps.apple.com/app/metah',
    android: 'https://play.google.com/store/apps/details?id=com.metah',
  },
  policies: {
    privacyPolicy: '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>',
    termsOfService: '<h1>Terms of Service</h1><p>By using our service...</p>',
    cookiePolicy: '<h1>Cookie Policy</h1><p>We use cookies to...</p>',
    sitemap: '<h1>Sitemap</h1><p>Site structure and navigation...</p>',
  },
  defaultLanguage: 'am',
  defaultCurrency: 'ETB',
  enabledLanguages: ['am', 'en', 'fr', 'ar', 'so'],
  enabledCurrencies: ['ETB', 'USD', 'EUR', 'GBP'],
  supportContacts: {
    phone: '+1 (555) 123-4567',
    whatsapp: '+15551234567',
    email: 'support@metah.com',
    liveChatEnabled: true,
    businessHours: '24/7',
    emergencyContact: '+1 (555) 999-9999',
  },
};

function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed } as AdminSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function isValidUrlMaybe(value?: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
}

export function isValidEmailMaybe(value?: string): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhoneMaybe(value?: string): boolean {
  if (!value) return true;
  // Lenient international phone validation
  return /^\+?[0-9 ()-]{7,}$/.test(value);
}

export interface AdminSettingsContextType {
  settings: AdminSettings;
  updateSettings: (partial: Partial<AdminSettings>) => void;
  updateGeneralSettings: (general: Partial<AdminSettings>) => void;
  updateContactSettings: (contacts: Partial<AdminSettings['contacts']>) => void;
  updateSocialLinks: (socialLinks: Partial<AdminSettings['socialLinks']>) => void;
  updateAppStoreLinks: (appStoreLinks: Partial<AdminSettings['appStoreLinks']>) => void;
  updatePolicySettings: (policies: Partial<AdminSettings['policies']>) => void;
  updateLocalizationSettings: (localization: Partial<Pick<AdminSettings, 'defaultLanguage' | 'defaultCurrency' | 'enabledLanguages' | 'enabledCurrencies'>>) => void;
  updateSupportContacts: (supportContacts: Partial<AdminSettings['supportContacts']>) => void;
  validateUrl: (url: string) => boolean;
  validateEmail: (email: string) => boolean;
  validatePhone: (phone: string) => boolean;
  exportSettings: () => void;
  importSettings: (json: string) => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    // Apply primary color to CSS variable for live preview
    try {
      document.documentElement.style.setProperty('--brand-primary', settings.primaryColor);
    } catch {
      // ignore if not available (SSR)
    }
  }, [settings.primaryColor]);

  useEffect(() => {
    // Seed defaults for language/currency if not set by user
    const currentLanguage = localStorage.getItem('language');
    const currentCurrency = localStorage.getItem('currency');
    const { defaultLanguage, enabledLanguages, defaultCurrency, enabledCurrencies } = settings;

    // If no saved values, seed with defaults
    if (!currentLanguage) {
      localStorage.setItem('language', defaultLanguage);
    }
    if (!currentCurrency) {
      localStorage.setItem('currency', defaultCurrency);
    }

    // Enforce enabled lists: if saved values are not enabled, fall back to defaults
    if (currentLanguage && !enabledLanguages.includes(currentLanguage)) {
      localStorage.setItem('language', enabledLanguages.includes(defaultLanguage) ? defaultLanguage : enabledLanguages[0] || 'en');
    }
    if (currentCurrency && !enabledCurrencies.includes(currentCurrency)) {
      localStorage.setItem('currency', enabledCurrencies.includes(defaultCurrency) ? defaultCurrency : enabledCurrencies[0] || 'ETB');
    }
  }, [settings]);

  const updateSettings = (partial: Partial<AdminSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateGeneralSettings = (general: Partial<AdminSettings>) => {
    updateSettings(general);
  };

  const updateContactSettings = (contacts: Partial<AdminSettings['contacts']>) => {
    updateSettings({ contacts: { ...settings.contacts, ...contacts } });
  };

  const updateSocialLinks = (socialLinks: Partial<AdminSettings['socialLinks']>) => {
    updateSettings({ socialLinks: { ...settings.socialLinks, ...socialLinks } });
  };

  const updateAppStoreLinks = (appStoreLinks: Partial<AdminSettings['appStoreLinks']>) => {
    updateSettings({ appStoreLinks: { ...settings.appStoreLinks, ...appStoreLinks } });
  };

  const updatePolicySettings = (policies: Partial<AdminSettings['policies']>) => {
    updateSettings({ policies: { ...settings.policies, ...policies } });
  };

  const updateLocalizationSettings = (localization: Partial<Pick<AdminSettings, 'defaultLanguage' | 'defaultCurrency' | 'enabledLanguages' | 'enabledCurrencies'>>) => {
    updateSettings(localization);
  };

  const updateSupportContacts = (supportContacts: Partial<AdminSettings['supportContacts']>) => {
    updateSettings({ supportContacts: { ...settings.supportContacts, ...supportContacts } });
  };

  const exportJson = () => JSON.stringify(settings, null, 2);

  const importJson = (json: string) => {
    try {
      const parsed = JSON.parse(json) as AdminSettings;
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid json
    }
  };

  const contextValue = {
    settings,
    updateSettings,
    updateGeneralSettings,
    updateContactSettings,
    updateSocialLinks,
    updateAppStoreLinks,
    updatePolicySettings,
    updateLocalizationSettings,
    updateSupportContacts,
    validateUrl: isValidUrlMaybe,
    validateEmail: isValidEmailMaybe,
    validatePhone: isValidPhoneMaybe,
    exportSettings: exportJson,
    importSettings: importJson,
  };

  return (
    <AdminSettingsContext.Provider value={contextValue}>{children}</AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) throw new Error('useAdminSettings must be used within AdminSettingsProvider');
  return ctx;
};


