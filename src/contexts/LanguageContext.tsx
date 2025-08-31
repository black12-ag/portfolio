import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';

export const languages = {
  // Global
  en: { name: 'English (US)', flag: '🇺🇸' },
  'en-US': { name: 'English (US)', flag: '🇺🇸' },
  'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  pt: { name: 'Português', flag: '🇵🇹' },
  'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷' },
  'pt-PT': { name: 'Português (Portugal)', flag: '🇵🇹' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  ca: { name: 'Català', flag: '🇪🇸' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  zh: { name: '中文', flag: '🇨🇳' },
  'zh-CN': { name: '中文 (简体)', flag: '🇨🇳' },
  'zh-TW': { name: '繁體中文', flag: '🇹🇼' },
  'zh-HK': { name: '繁體中文 (香港)', flag: '🇭🇰' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ur: { name: 'اردو', flag: '🇵🇰' },
  fa: { name: 'فارسی', flag: '🇮🇷' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  he: { name: 'עברית', flag: '🇮🇱' },
  el: { name: 'Ελληνικά', flag: '🇬🇷' },
  bg: { name: 'Български', flag: '🇧🇬' },
  uk: { name: 'Українська', flag: '🇺🇦' },
  mk: { name: 'Македонски', flag: '🇲🇰' },
  sr: { name: 'Srpski', flag: '🇷🇸' },
  ro: { name: 'Română', flag: '🇷🇴' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  cs: { name: 'Čeština', flag: '🇨🇿' },
  sk: { name: 'Slovenčina', flag: '🇸🇰' },
  sl: { name: 'Slovenščina', flag: '🇸🇮' },
  hr: { name: 'Hrvatski', flag: '🇭🇷' },
  hu: { name: 'Magyar', flag: '🇭🇺' },
  da: { name: 'Dansk', flag: '🇩🇰' },
  no: { name: 'Norsk', flag: '🇳🇴' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  fi: { name: 'Suomi', flag: '🇫🇮' },
  et: { name: 'Eesti', flag: '🇪🇪' },
  lv: { name: 'Latviešu', flag: '🇱🇻' },
  lt: { name: 'Lietuvių', flag: '🇱🇹' },
  is: { name: 'Íslenska', flag: '🇮🇸' },
  ga: { name: 'Gaeilge', flag: '🇮🇪' },
  // East Africa focus
  am: { name: 'አማርኛ', flag: '🇪🇹' },
  om: { name: 'Afaan Oromoo', flag: '🇪🇹' },
  ti: { name: 'ትግርኛ', flag: '🇪🇷' },
  so: { name: 'Af-Soomaali', flag: '🇸🇴' },
  sw: { name: 'Kiswahili', flag: '🇰🇪' },
  rw: { name: 'Kinyarwanda', flag: '🇷🇼' },
  lg: { name: 'Luganda', flag: '🇺🇬' },
  ny: { name: 'Chichewa', flag: '🇲🇼' },
  sn: { name: 'ChiShona', flag: '🇿🇼' },
  af: { name: 'Afrikaans', flag: '🇿🇦' },
  zu: { name: 'isiZulu', flag: '🇿🇦' },
  ha: { name: 'Hausa', flag: '🇳🇬' },
  yo: { name: 'Yorùbá', flag: '🇳🇬' },
  ig: { name: 'Igbo', flag: '🇳🇬' },
  // SEA/others
  th: { name: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  id: { name: 'Bahasa Indonesia', flag: '🇮🇩' },
  ms: { name: 'Bahasa Melayu', flag: '🇲🇾' },
  tl: { name: 'Filipino', flag: '🇵🇭' },
  fil: { name: 'Filipino', flag: '🇵🇭' }
};

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en-US');

  useEffect(() => {
    // Sync with i18next on mount
    const handleLanguageChanged = (lng: string) => {
      console.log('🌍 i18next language changed to:', lng);
      setCurrentLanguage(lng);
    };

    // Listen for i18next language changes
    i18n.on('languageChanged', handleLanguageChanged);
    
    // Set initial language
    setCurrentLanguage(i18n.language || 'en-US');
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const setLanguage = async (lang: string) => {
    console.log('🔄 Switching language to:', lang);
    
    // Update local state immediately
    setCurrentLanguage(lang);
    
    // Update i18next (this will trigger the languageChanged event)
    try {
      await i18n.changeLanguage(lang);
      console.log('✅ Language switched successfully to:', lang);
    } catch (error) {
      console.error('❌ Failed to switch language:', error);
    }
  };

  const t = (key: string): string => {
    // Use i18next for translations instead of local translations
    return i18n.t(key) || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};