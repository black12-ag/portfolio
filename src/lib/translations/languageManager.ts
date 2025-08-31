import { MasterTranslations, enTranslations } from './masterTranslations';

// Complete list of all 58 supported languages
export const ALL_LANGUAGES = {
  // Global Major Languages
  'en-US': { name: 'English (US)', flag: '🇺🇸', rtl: false },
  'en-GB': { name: 'English (UK)', flag: '🇬🇧', rtl: false },
  'es': { name: 'Español', flag: '🇪🇸', rtl: false },
  'fr': { name: 'Français', flag: '🇫🇷', rtl: false },
  'de': { name: 'Deutsch', flag: '🇩🇪', rtl: false },
  'it': { name: 'Italiano', flag: '🇮🇹', rtl: false },
  'pt': { name: 'Português', flag: '🇵🇹', rtl: false },
  'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷', rtl: false },
  'pt-PT': { name: 'Português (Portugal)', flag: '🇵🇹', rtl: false },
  'ru': { name: 'Русский', flag: '🇷🇺', rtl: false },
  'zh-CN': { name: '中文 (简体)', flag: '🇨🇳', rtl: false },
  'zh-TW': { name: '中文 (繁體)', flag: '🇹🇼', rtl: false },
  'zh-HK': { name: '中文 (香港)', flag: '🇭🇰', rtl: false },
  'ja': { name: '日本語', flag: '🇯🇵', rtl: false },
  'ko': { name: '한국어', flag: '🇰🇷', rtl: false },
  'hi': { name: 'हिन्दी', flag: '🇮🇳', rtl: false },
  'ar': { name: 'العربية', flag: '🇸🇦', rtl: true },
  'fa': { name: 'فارسی', flag: '🇮🇷', rtl: true },
  'ur': { name: 'اردو', flag: '🇵🇰', rtl: true },
  'he': { name: 'עברית', flag: '🇮🇱', rtl: true },
  'tr': { name: 'Türkçe', flag: '🇹🇷', rtl: false },
  
  // European Languages
  'nl': { name: 'Nederlands', flag: '🇳🇱', rtl: false },
  'ca': { name: 'Català', flag: '🇪🇸', rtl: false },
  'el': { name: 'Ελληνικά', flag: '🇬🇷', rtl: false },
  'bg': { name: 'Български', flag: '🇧🇬', rtl: false },
  'uk': { name: 'Українська', flag: '🇺🇦', rtl: false },
  'mk': { name: 'Македонски', flag: '🇲🇰', rtl: false },
  'sr': { name: 'Српски', flag: '🇷🇸', rtl: false },
  'ro': { name: 'Română', flag: '🇷🇴', rtl: false },
  'pl': { name: 'Polski', flag: '🇵🇱', rtl: false },
  'cs': { name: 'Čeština', flag: '🇨🇿', rtl: false },
  'sk': { name: 'Slovenčina', flag: '🇸🇰', rtl: false },
  'sl': { name: 'Slovenščina', flag: '🇸🇮', rtl: false },
  'hr': { name: 'Hrvatski', flag: '🇭🇷', rtl: false },
  'hu': { name: 'Magyar', flag: '🇭🇺', rtl: false },
  'da': { name: 'Dansk', flag: '🇩🇰', rtl: false },
  'no': { name: 'Norsk', flag: '🇳🇴', rtl: false },
  'sv': { name: 'Svenska', flag: '🇸🇪', rtl: false },
  'fi': { name: 'Suomi', flag: '🇫🇮', rtl: false },
  'et': { name: 'Eesti', flag: '🇪🇪', rtl: false },
  'lv': { name: 'Latviešu', flag: '🇱🇻', rtl: false },
  'lt': { name: 'Lietuvių', flag: '🇱🇹', rtl: false },
  'is': { name: 'Íslenska', flag: '🇮🇸', rtl: false },
  'ga': { name: 'Gaeilge', flag: '🇮🇪', rtl: false },
  
  // African Languages
  'am': { name: 'አማርኛ', flag: '🇪🇹', rtl: false },
  'om': { name: 'Afaan Oromoo', flag: '🇪🇹', rtl: false },
  'ti': { name: 'ትግርኛ', flag: '🇪🇹', rtl: false },
  'so': { name: 'Soomaali', flag: '🇸🇴', rtl: false },
  'sw': { name: 'Kiswahili', flag: '🇰🇪', rtl: false },
  'rw': { name: 'Kinyarwanda', flag: '🇷🇼', rtl: false },
  'lg': { name: 'Luganda', flag: '🇺🇬', rtl: false },
  'ny': { name: 'Chichewa', flag: '🇲🇼', rtl: false },
  'sn': { name: 'ChiShona', flag: '🇿🇼', rtl: false },
  'af': { name: 'Afrikaans', flag: '🇿🇦', rtl: false },
  'zu': { name: 'isiZulu', flag: '🇿🇦', rtl: false },
  'ha': { name: 'Hausa', flag: '🇳🇬', rtl: false },
  'yo': { name: 'Yorùbá', flag: '🇳🇬', rtl: false },
  'ig': { name: 'Igbo', flag: '🇳🇬', rtl: false },
  
  // Asian Languages
  'th': { name: 'ไทย', flag: '🇹🇭', rtl: false },
  'vi': { name: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  'id': { name: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
  'ms': { name: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
  'fil': { name: 'Filipino', flag: '🇵🇭', rtl: false },
};

// Translation cache
const translationCache = new Map<string, MasterTranslations>();

// Set English as the base
translationCache.set('en-US', enTranslations);
translationCache.set('en', enTranslations);

// Language loading states
const loadingStates = new Map<string, Promise<MasterTranslations>>();

export class LanguageManager {
  private currentLanguage = 'en-US';
  private fallbackLanguage = 'en-US';
  private listeners: Set<(language: string) => void> = new Set();

  constructor() {
    // Load saved language
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('metah_language');
      if (saved && ALL_LANGUAGES[saved as keyof typeof ALL_LANGUAGES]) {
        this.currentLanguage = saved;
      } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
        const langCode = this.findBestMatch(browserLang);
        this.currentLanguage = langCode;
      }
      this.updateDocumentLanguage();
    }
  }

  // Find best language match
  private findBestMatch(browserLang: string): string {
    // Exact match
    if (ALL_LANGUAGES[browserLang as keyof typeof ALL_LANGUAGES]) {
      return browserLang;
    }

    // Language family match (e.g., en-AU -> en-US)
    const langFamily = browserLang.split('-')[0];
    const familyMatches = Object.keys(ALL_LANGUAGES).filter(lang => 
      lang.startsWith(`${langFamily  }-`) || lang === langFamily
    );
    
    if (familyMatches.length > 0) {
      return familyMatches[0];
    }

    return this.fallbackLanguage;
  }

  // Update document language and direction
  private updateDocumentLanguage() {
    if (typeof document !== 'undefined') {
      const langInfo = ALL_LANGUAGES[this.currentLanguage as keyof typeof ALL_LANGUAGES];
      document.documentElement.lang = this.currentLanguage;
      document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get language info
  getLanguageInfo(langCode?: string) {
    const code = langCode || this.currentLanguage;
    return ALL_LANGUAGES[code as keyof typeof ALL_LANGUAGES];
  }

  // Check if language is RTL
  isRTL(langCode?: string): boolean {
    const info = this.getLanguageInfo(langCode);
    return info?.rtl || false;
  }

  // Load translations for a language
  async loadTranslations(langCode: string): Promise<MasterTranslations> {
    // Check cache first
    if (translationCache.has(langCode)) {
      return translationCache.get(langCode);
    }

    // Check if already loading
    if (loadingStates.has(langCode)) {
      return loadingStates.get(langCode);
    }

    // Start loading
    const loadPromise = this.fetchTranslations(langCode);
    loadingStates.set(langCode, loadPromise);

    try {
      const translations = await loadPromise;
      translationCache.set(langCode, translations);
      return translations;
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}:`, error);
      loadingStates.delete(langCode);
      
      // Fallback to English
      if (langCode !== this.fallbackLanguage) {
        return this.loadTranslations(this.fallbackLanguage);
      }
      
      throw error;
    } finally {
      loadingStates.delete(langCode);
    }
  }

  // Fetch translations from server/files
  private async fetchTranslations(langCode: string): Promise<MasterTranslations> {
    try {
      // Try to load from public/locales
      const response = await fetch(`/locales/${langCode}/translation.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const jsonData = await response.json();
      
      // Convert flat JSON to nested structure
      return this.convertToMasterTranslations(jsonData);
    } catch (error) {
      console.warn(`Could not load translations for ${langCode}, using fallback`);
      
      // Return English translations as fallback
      return enTranslations;
    }
  }

  // Convert flat JSON to nested structure
  private convertToMasterTranslations(flatData: Record<string, string>): MasterTranslations {
    // If the data is already in the correct format, return it
    if (flatData.nav && typeof flatData.nav === 'object') {
      return flatData as any;
    }

    // Create nested structure from flat keys
    const nested: unknown = {};
    
    // Initialize structure
    Object.keys(enTranslations).forEach(key => {
      nested[key] = {};
    });

    // Fill in values from flat data or use English fallbacks
    Object.entries(enTranslations).forEach(([section, sectionData]) => {
      if (typeof sectionData === 'object') {
        Object.entries(sectionData).forEach(([key, englishValue]) => {
          // Try to find translation in flat data
          const flatKey = `${section}.${key}`;
          nested[section][key] = flatData[flatKey] || flatData[key] || englishValue;
        });
      }
    });

    return nested;
  }

  // Switch language
  async switchLanguage(langCode: string): Promise<void> {
    if (!ALL_LANGUAGES[langCode as keyof typeof ALL_LANGUAGES]) {
      console.warn(`Language ${langCode} not supported`);
      return;
    }

    if (langCode === this.currentLanguage) {
      return;
    }

    // Load translations first
    await this.loadTranslations(langCode);

    // Update current language
    this.currentLanguage = langCode;
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('metah_language', langCode);
    }

    // Update document
    this.updateDocumentLanguage();

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(langCode);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });
  }

  // Add language change listener
  addListener(listener: (language: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get translation
  async translate(keyPath: string, params?: Record<string, string>): Promise<string> {
    const translations = await this.loadTranslations(this.currentLanguage);
    return this.getNestedValue(translations, keyPath, params);
  }

  // Get translation synchronously (uses cache)
  translateSync(keyPath: string, params?: Record<string, string>): string {
    const translations = translationCache.get(this.currentLanguage) || enTranslations;
    return this.getNestedValue(translations, keyPath, params);
  }

  // Get nested value from translations
  private getNestedValue(obj: unknown, keyPath: string, params?: Record<string, string>): string {
    const keys = keyPath.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English
        const englishValue = this.getNestedValueFromObject(enTranslations, keys);
        console.warn(`Translation missing for ${keyPath} in ${this.currentLanguage}, using English fallback`);
        return this.interpolate(englishValue || keyPath, params);
      }
    }

    return this.interpolate(value || keyPath, params);
  }

  // Get nested value from specific object
  private getNestedValueFromObject(obj: unknown, keys: string[]): string {
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }
    return value || '';
  }

  // Interpolate parameters
  private interpolate(text: string, params?: Record<string, string>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  // Get all available languages
  getAllLanguages() {
    return ALL_LANGUAGES;
  }

  // Get language groups for UI
  getLanguageGroups() {
    const groups = {
      popular: ['en-US', 'es', 'fr', 'de', 'zh-CN', 'ja', 'ar', 'hi'],
      european: ['en-GB', 'it', 'pt', 'ru', 'nl', 'pl', 'tr', 'el', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'da', 'no', 'sv', 'fi', 'et', 'lv', 'lt', 'is', 'ga'],
      african: ['am', 'om', 'ti', 'so', 'sw', 'rw', 'lg', 'ny', 'sn', 'af', 'zu', 'ha', 'yo', 'ig'],
      asian: ['ko', 'th', 'vi', 'id', 'ms', 'fil', 'ur', 'fa', 'he'],
      americas: ['pt-BR', 'pt-PT'],
      chinese: ['zh-CN', 'zh-TW', 'zh-HK']
    };

    return groups;
  }

  // Preload common languages
  async preloadLanguages(languages: string[] = ['en-US', 'am', 'es', 'fr']) {
    const promises = languages.map(lang => this.loadTranslations(lang));
    await Promise.allSettled(promises);
  }

  // Clear cache
  clearCache() {
    translationCache.clear();
    translationCache.set('en-US', enTranslations);
    translationCache.set('en', enTranslations);
  }

  // Get cache status
  getCacheStatus() {
    return {
      cached: Array.from(translationCache.keys()),
      loading: Array.from(loadingStates.keys()),
      current: this.currentLanguage,
      fallback: this.fallbackLanguage
    };
  }
}

// Global instance
export const languageManager = new LanguageManager();

// React hook for easy usage
export function useTranslation() {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const unsubscribe = languageManager.addListener(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const t = React.useCallback((keyPath: string, params?: Record<string, string>) => {
    return languageManager.translateSync(keyPath, params);
  }, []);

  const switchLanguage = React.useCallback((langCode: string) => {
    return languageManager.switchLanguage(langCode);
  }, []);

  return {
    t,
    currentLanguage: languageManager.getCurrentLanguage(),
    switchLanguage,
    isRTL: languageManager.isRTL(),
    languages: languageManager.getAllLanguages(),
    languageGroups: languageManager.getLanguageGroups()
  };
}

// Add React import for the hook
import React from 'react';
