import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    // Prefer exact language codes present in public/locales first
    load: 'currentOnly',
    fallbackLng: ["en-US", "en"],
    nonExplicitSupportedLngs: true,
    detection: {
      // Prefer saved selection, then browser settings, then <html lang>
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    supportedLngs: [
      'en', 'en-US', 'en-GB',
      'es', 'fr', 'ar', 'pt', 'pt-BR', 'pt-PT', 'it', 'de', 'nl', 'ca', 'ru',
      'zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko',
      'hi', 'ur', 'fa', 'tr', 'he', 'el', 'bg', 'uk', 'mk', 'sr', 'ro', 'pl', 'cs', 'sk', 'sl', 'hr', 'hu',
      'da', 'no', 'sv', 'fi', 'et', 'lv', 'lt', 'is', 'ga',
      'am', 'om', 'ti', 'so', 'sw', 'rw', 'lg', 'ny', 'sn', 'af', 'zu', 'ha', 'yo', 'ig',
      'th', 'vi', 'id', 'ms', 'fil'
    ],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

// Update <html> lang and dir on language change
const rtlLangs = new Set(['ar', 'he', 'fa', 'ur']);
i18n.on('languageChanged', (lng) => {
  const html = document.documentElement;
  if (html) {
    html.setAttribute('lang', lng);
    const base = lng.split('-')[0];
    html.setAttribute('dir', rtlLangs.has(base) ? 'rtl' : 'ltr');
  }
});

export default i18n;