
// src/lib/localization.ts

// --- Interfaces and Types ---

/**
 * Defines the structure for a language pack, which contains all translatable strings.
 */
export interface LanguagePack {
  [key: string]: string | LanguagePack;
}

/**
 * Represents a supported language in the application.
 */
export interface SupportedLanguage {
  code: string; // e.g., 'en-US'
  name: string; // e.g., 'English (US)'
  isRTL?: boolean; // Is it a right-to-left language?
}

/**
 * Configuration options for the LocalizationManager.
 */
export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: SupportedLanguage[];
  fallbackLanguage: string;
  loadLanguagePack: (languageCode: string) => Promise<LanguagePack>;
}

/**
 * Options for the `translate` method.
 */
export interface TranslateOptions {
  [key: string]: string | number;
}

/**
 * Options for the search query translator.
 */
export interface SearchTranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

// --- Localization Manager ---

/**
 * Manages the application\'s localization, including language switching and string translation.
 */
export class LocalizationManager {
  private currentLanguage: string;
  private languagePack: LanguagePack = {} as Record<string, never>;
  private config: LocalizationConfig;
  private isInitialized = false;

  constructor(config: LocalizationConfig) {
    this.config = config;
    this.currentLanguage = config.defaultLanguage;
  }

  /**
   * Initializes the manager by loading the default language pack.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.loadLanguage(this.currentLanguage);
    this.isInitialized = true;
  }

  /**
   * Switches the application\'s current language.
   * @param languageCode The code of the language to switch to.
   */
  async setLanguage(languageCode: string): Promise<void> {
    if (!this.config.supportedLanguages.some(lang => lang.code === languageCode)) {
      console.warn(`Language "${languageCode}" is not supported.`);
      return;
    }
    this.currentLanguage = languageCode;
    await this.loadLanguage(languageCode);
  }

  /**
   * Gets the current language code.
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Translates a string using a key from the language pack.
   * Supports nested keys and variable interpolation.
   * @param key The key of the string to translate (e.g., 'search.placeholder').
   * @param options An object with values to interpolate into the string.
   */
  translate(key: string, options?: TranslateOptions): string {
    const keys = key.split('.');
    let result: string | LanguagePack = this.languagePack;

    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = result[k];
      } else {
        // Fallback to default language if key not found
        console.warn(`Translation key "${key}" not found for language "${this.currentLanguage}".`);
        return key;
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    if (options) {
      return this.interpolate(result, options);
    }

    return result;
  }

  /**
   * Loads a language pack for a given language code.
   */
  private async loadLanguage(languageCode: string): Promise<void> {
    try {
      this.languagePack = await this.config.loadLanguagePack(languageCode);
    } catch (error) {
      console.error(`Failed to load language pack for "${languageCode}".`, error);
      if (languageCode !== this.config.fallbackLanguage) {
        console.log(`Falling back to "${this.config.fallbackLanguage}".`);
        await this.loadLanguage(this.config.fallbackLanguage);
      }
    }
  }

  /**
   * Interpolates variables into a translation string.
   * e.g., "Hello, {name}" + { name: "World" } = "Hello, World"
   */
  private interpolate(template: string, variables: TranslateOptions): string {
    return template.replace(/\{(\w+)\}/g, (placeholder, key) => {
      return variables[key]?.toString() || placeholder;
    });
  }
}

// --- Search Query Translator ---

/**
 * Handles the translation of search queries.
 * This can be connected to a third-party translation API.
 */
export class SearchQueryTranslator {
  private apiKey?: string;
  private apiUrl?: string;

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl || 'https://api.mock-translation.com/translate';
  }

  /**
   * Translates a search query from a source language to a target language.
   * @param query The search query to translate.
   * @param options The translation options.
   */
  async translate(query: string, options: SearchTranslationOptions): Promise<string> {
    if (options.sourceLanguage === options.targetLanguage) {
      return query;
    }

    // This is a mock implementation.
    // In a real application, you would make an API call to a translation service.
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey || 'mock-key'}`,
        },
        body: JSON.stringify({
          q: query,
          source: options.sourceLanguage,
          target: options.targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation API request failed');
      }

      const data = await response.json();
      return data.translatedText || `Translated: ${query}`;
    } catch (error) {
      console.error('Search query translation failed:', error);
      // Fallback to the original query
      return query;
    }
  }
}

// --- Language Pack Loader ---

/**
 * A utility function to demonstrate loading language packs dynamically.
 * In a real app, these would be separate JSON files.
 */
export async function fetchLanguagePack(languageCode: string): Promise<LanguagePack> {
    // In a real application, you would use dynamic imports:
    // const pack = await import(`../locales/${languageCode}.json`);
    // return pack.default;

    console.log(`Fetching language pack for: ${languageCode}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

    const packs: { [key: string]: LanguagePack } = {
        'en-US': {
            search: {
                placeholder: 'Search for hotels, flights, and more...',
                button: 'Search',
                voiceSearch: 'Voice Search',
                noResults: 'No results found for "{query}".',
            },
            filters: {
                price: 'Price',
                category: 'Category',
            },
            common: {
                loading: 'Loading...',
                error: 'An error occurred.',
            }
        },
        'es-ES': {
            search: {
                placeholder: 'Buscar hoteles, vuelos y más...',
                button: 'Buscar',
                voiceSearch: 'Búsqueda por voz',
                noResults: 'No se encontraron resultados para "{query}".',
            },
            filters: {
                price: 'Precio',
                category: 'Categoría',
            },
            common: {
                loading: 'Cargando...',
                error: 'Ocurrió un error.',
            }
        },
        'fr-FR': {
            search: {
                placeholder: 'Rechercher des hôtels, des vols et plus...',
                button: 'Rechercher',
                voiceSearch: 'Recherche vocale',
                noResults: 'Aucun résultat trouvé pour "{query}".',
            },
            filters: {
                price: 'Prix',
                category: 'Catégorie',
            },
            common: {
                loading: 'Chargement...',
                error: 'Une erreur est survenue.',
            }
        },
    };

    if (packs[languageCode]) {
        return packs[languageCode];
    }

    throw new Error(`Language pack for ${languageCode} not found.`);
}

