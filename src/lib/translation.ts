// Enhanced translation utility with caching and faster mock translations
// - If VITE_TRANSLATE_API_URL is provided, it will POST { q, source, target }
//   expecting a JSON { translatedText } or { translations: [{ text }] }
// - Otherwise, returns a mock translation with language-specific modifications

type ImportMetaEnv = { env?: { VITE_TRANSLATE_API_URL?: string; VITE_TRANSLATE_API_KEY?: string } };

const meta = (import.meta as unknown as ImportMetaEnv);

// Simple in-memory cache for faster repeat translations
const translationCache = new Map<string, string>();

// Mock translations with basic language patterns for demo
const mockTranslations: Record<string, (text: string) => string> = {
  es: (text) => `[ES] ${text.replace(/hello/gi, 'hola').replace(/thank you/gi, 'gracias').replace(/help/gi, 'ayuda')}`,
  fr: (text) => `[FR] ${text.replace(/hello/gi, 'bonjour').replace(/thank you/gi, 'merci').replace(/help/gi, 'aide')}`,
  de: (text) => `[DE] ${text.replace(/hello/gi, 'hallo').replace(/thank you/gi, 'danke').replace(/help/gi, 'hilfe')}`,
  ar: (text) => `[AR] ${text.replace(/hello/gi, 'مرحبا').replace(/thank you/gi, 'شكراً').replace(/help/gi, 'مساعدة')}`,
  pt: (text) => `[PT] ${text.replace(/hello/gi, 'olá').replace(/thank you/gi, 'obrigado').replace(/help/gi, 'ajuda')}`,
  hi: (text) => `[HI] ${text.replace(/hello/gi, 'नमस्ते').replace(/thank you/gi, 'धन्यवाद').replace(/help/gi, 'सहायता')}`,
  zh: (text) => `[ZH] ${text.replace(/hello/gi, '你好').replace(/thank you/gi, '谢谢').replace(/help/gi, '帮助')}`,
  ja: (text) => `[JA] ${text.replace(/hello/gi, 'こんにちは').replace(/thank you/gi, 'ありがとう').replace(/help/gi, 'ヘルプ')}`,
  ru: (text) => `[RU] ${text.replace(/hello/gi, 'привет').replace(/thank you/gi, 'спасибо').replace(/help/gi, 'помощь')}`
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const normalizedSource = (sourceLang || 'en').toLowerCase();
    const normalizedTarget = (targetLang || 'en').toLowerCase();

    if (!text || normalizedSource === normalizedTarget) {
      return text;
    }

    // Check cache first for instant results
    const cacheKey = `${normalizedSource}-${normalizedTarget}-${text}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    const apiUrl = meta.env?.VITE_TRANSLATE_API_URL;
    const apiKey = meta.env?.VITE_TRANSLATE_API_KEY;

    let translatedText = '';

    if (apiUrl) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
          },
          body: JSON.stringify({ q: text, source: normalizedSource, target: normalizedTarget })
        });
        const data = await res.json().catch(() => ({}));
        
        if (data?.translatedText && typeof data.translatedText === 'string') {
          translatedText = data.translatedText;
        } else if (Array.isArray(data?.translations) && data.translations[0]?.text) {
          translatedText = String(data.translations[0].text);
        } else if (data?.data?.translations?.[0]?.translatedText) {
          translatedText = String(data.data.translations[0].translatedText);
        }
      } catch (apiError) {
        console.warn('API translation failed, using mock:', apiError);
      }
    }

    // Use mock translation if API failed or not configured
    if (!translatedText) {
      const mockTranslator = mockTranslations[normalizedTarget];
      translatedText = mockTranslator ? mockTranslator(text) : `[${normalizedTarget.toUpperCase()}] ${text}`;
    }

    // Cache the result for faster future lookups
    translationCache.set(cacheKey, translatedText);
    
    // Limit cache size to prevent memory issues
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    return translatedText;
  } catch (error) {
    console.warn('translateText failed; returning original text', error);
    return text;
  }
}

export const commonLanguageOptions: Array<{ code: string; label: string; shortLabel: string }> = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'ar', label: 'العربية', shortLabel: 'AR' },
  { code: 'pt', label: 'Português', shortLabel: 'PT' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'HI' },
  { code: 'zh', label: '中文', shortLabel: 'ZH' },
  { code: 'ja', label: '日本語', shortLabel: 'JA' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' }
];


