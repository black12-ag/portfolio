import {  useState, useEffect, useContext, createContext, ReactNode , useCallback } from 'react';
import {
  LocalizationManager,
  LocalizationConfig,
  SupportedLanguage,
  TranslateOptions,
  fetchLanguagePack
} from '../lib/localization';

// --- Context ---

export interface LocalizationContextValue {
  currentLanguage: string;
  supportedLanguages: SupportedLanguage[];
  setLanguage: (languageCode: string) => Promise<void>;
  translate: (key: string, options?: TranslateOptions) => string;
  isReady: boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

// --- Provider Component ---

export interface LocalizationProviderProps {
  children: ReactNode;
  config?: Partial<LocalizationConfig>;
}

export function LocalizationProvider({ children, config = {} as Record<string, never> }: LocalizationProviderProps) {
  const defaultConfig: LocalizationConfig = {
    defaultLanguage: 'en-US',
    supportedLanguages: [
      { code: 'en-US', name: 'English (US)' },
      { code: 'es-ES', name: 'Español (España)' },
      { code: 'fr-FR', name: 'Français (France)' },
      { code: 'de-DE', name: 'Deutsch (Deutschland)' },
      { code: 'it-IT', name: 'Italiano (Italia)' },
      { code: 'pt-BR', name: 'Português (Brasil)' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'ko-KR', name: '한국어' },
      { code: 'zh-CN', name: '中文 (简体)' },
      { code: 'ar-SA', name: 'العربية', isRTL: true },
    ],
    fallbackLanguage: 'en-US',
    loadLanguagePack: fetchLanguagePack,
    ...config
  };

  const [manager] = useState(() => new LocalizationManager(defaultConfig));
  const [currentLanguage, setCurrentLanguage] = useState(defaultConfig.defaultLanguage);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeLocalization = async () => {
      try {
        // Try to get saved language from localStorage
        const savedLanguage = localStorage.getItem('preferred-language');
        const browserLanguage = navigator.language || 'en-US';
        
        // Choose initial language based on saved preference, browser language, or default
        const initialLanguage = savedLanguage || 
          (defaultConfig.supportedLanguages.some(lang => lang.code === browserLanguage) 
            ? browserLanguage 
            : defaultConfig.defaultLanguage);

        await manager.initialize();
        
        if (initialLanguage !== defaultConfig.defaultLanguage) {
          await manager.setLanguage(initialLanguage);
        }
        
        setCurrentLanguage(manager.getCurrentLanguage());
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize localization:', error);
        setIsReady(true); // Still set ready to true to prevent blocking the app
      }
    };

    initializeLocalization();
  }, [manager, defaultConfig.defaultLanguage, defaultConfig.supportedLanguages]);

  const setLanguage = async (languageCode: string) => {
    try {
      await manager.setLanguage(languageCode);
      setCurrentLanguage(manager.getCurrentLanguage());
      
      // Save preference to localStorage
      localStorage.setItem('preferred-language', languageCode);
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  };

  const translate = (key: string, options?: TranslateOptions): string => {
    return manager.translate(key, options);
  };

  const contextValue: LocalizationContextValue = {
    currentLanguage,
    supportedLanguages: defaultConfig.supportedLanguages,
    setLanguage,
    translate,
    isReady
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
}

// --- Hook ---

export function useLocalization(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  
  return context;
}

// --- Utility Hooks ---

/**
 * A hook that returns a translate function bound to a specific namespace.
 * Useful for components that use many translations from the same namespace.
 */
export function useTranslation(namespace?: string) {
  const { translate } = useLocalization();
  
  const t = (key: string, options?: TranslateOptions): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return translate(fullKey, options);
  };
  
  return { t, translate };
}

/**
 * A hook for detecting right-to-left (RTL) languages.
 */
export function useRTL() {
  const { currentLanguage, supportedLanguages } = useLocalization();
  
  const currentLangInfo = supportedLanguages.find(lang => lang.code === currentLanguage);
  const isRTL = currentLangInfo?.isRTL || false;
  
  const getDirection = () => isRTL ? 'rtl' : 'ltr';
  const getTextAlign = () => isRTL ? 'right' : 'left';
  
  return {
    isRTL,
    direction: getDirection(),
    textAlign: getTextAlign()
  };
}

/**
 * A hook for formatting dates according to the current locale.
 */
export function useDateFormatter() {
  const { currentLanguage } = useLocalization();
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
  };
  
  const formatRelativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
    return new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' }).format(value, unit);
  };
  
  return { formatDate, formatRelativeTime };
}

/**
 * A hook for formatting numbers and currency according to the current locale.
 */
export function useNumberFormatter() {
  const { currentLanguage } = useLocalization();
  
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLanguage, options).format(number);
  };
  
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'percent'
    }).format(value);
  };
  
  return { formatNumber, formatCurrency, formatPercent };
}
