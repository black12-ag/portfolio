import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Languages, 
  Globe, 
  Search, 
  Check,
  Star,
  Volume2,
  Download,
  Settings
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
  popular?: boolean;
}

interface Translation {
  [key: string]: string;
}

interface LanguageContextType {
  currentLanguage: string;
  translations: Translation;
  switchLanguage: (code: string) => void;
  t: (key: string, params?: { [key: string]: string }) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGES: Language[] = [
  // Ethiopian languages first
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', popular: true },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇹' },
  { code: 'or', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇪🇹' },
  { code: 'sid', name: 'Sidamo', nativeName: 'Sidaamu Afii', flag: '🇪🇹' },
  
  // Popular international languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', popular: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, popular: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', popular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', popular: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', popular: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', popular: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', popular: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', popular: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', popular: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', popular: true },
  
  // African languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am-dz', name: 'Berber', nativeName: 'Tamazight', flag: '🇩🇿' },
  
  // European languages
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  
  // Asian languages
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  
  // Other languages
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' }
];

// Base translations - Ethiopian Amharic and English
const BASE_TRANSLATIONS = {
  am: {
    'hotel_management': 'ሆቴል አመራር',
    'reception': 'መስተንግዶ',
    'bookings': 'ቦታ ማስያዝ',
    'rooms': 'ክፍሎች',
    'guests': 'እንግዶች',
    'staff': 'ሰራተኞች',
    'revenue': 'ገቢ',
    'expenses': 'ወጪዎች',
    'profit': 'ትርፍ',
    'occupancy': 'ኦኩፓንሲ',
    'available': 'ተገኝ',
    'booked': 'ተይዟል',
    'check_in': 'ግብዓት',
    'check_out': 'መውጣት',
    'guest_name': 'የእንግዳ ስም',
    'room_number': 'የክፍል ቁጥር',
    'payment': 'ክፍያ',
    'confirmed': 'ተረጋግጧል',
    'pending': 'በመጠባበቅ ላይ',
    'cancelled': 'ተሰርዟል',
    'total_amount': 'ጠቅላላ መጠን',
    'add_booking': 'ቦታ ማስያዝ ጨምር',
    'edit_booking': 'ቦታ ማስያዝ አርም',
    'cancel_booking': 'ቦታ ማስያዝ ሰርዝ',
    'new_guest': 'አዲስ እንግዳ',
    'search': 'ፈልግ',
    'filter': 'ማጣሪያ',
    'export': 'ወደ ውጭ',
    'print': 'አትም',
    'save': 'አስቀምጥ',
    'cancel': 'ሰርዝ',
    'delete': 'ሰርዝ',
    'edit': 'አርም',
    'view': 'እይ',
    'add': 'ጨምር',
    'welcome': 'እንኳን ደህና መጡ',
    'dashboard': 'ዳሽቦርድ',
    'settings': 'ቅንብሮች',
    'logout': 'ውጣ',
    'language': 'ቋንቋ',
    'currency': 'ምንዛሬ',
    'dark_mode': 'ጠቅላላ ሁኔታ',
    'light_mode': 'ብርሃን ሁኔታ',
    'notifications': 'ማሳወቂያዎች',
    'profile': 'መገለጫ',
    'help': 'እርዳታ',
    'support': 'ድጋፍ',
    'contact': 'ግንኙነት',
    'about': 'ስለ',
    'version': 'ቅጂ',
    'loading': 'እየጫነ ነው',
    'error': 'ስህተት',
    'success': 'ተሳክቷል',
    'warning': 'ማስጠንቀቂያ',
    'info': 'መረጃ',
    'yes': 'አዎ',
    'no': 'አይደለም',
    'ok': 'እሺ',
    'close': 'ዝጋ'
  },
  en: {
    'hotel_management': 'Hotel Management',
    'reception': 'Reception',
    'bookings': 'Bookings',
    'rooms': 'Rooms',
    'guests': 'Guests',
    'staff': 'Staff',
    'revenue': 'Revenue',
    'expenses': 'Expenses',
    'profit': 'Profit',
    'occupancy': 'Occupancy',
    'available': 'Available',
    'booked': 'Booked',
    'check_in': 'Check In',
    'check_out': 'Check Out',
    'guest_name': 'Guest Name',
    'room_number': 'Room Number',
    'payment': 'Payment',
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'total_amount': 'Total Amount',
    'add_booking': 'Add Booking',
    'edit_booking': 'Edit Booking',
    'cancel_booking': 'Cancel Booking',
    'new_guest': 'New Guest',
    'search': 'Search',
    'filter': 'Filter',
    'export': 'Export',
    'print': 'Print',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'add': 'Add',
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'logout': 'Logout',
    'language': 'Language',
    'currency': 'Currency',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    'notifications': 'Notifications',
    'profile': 'Profile',
    'help': 'Help',
    'support': 'Support',
    'contact': 'Contact',
    'about': 'About',
    'version': 'Version',
    'loading': 'Loading',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'close': 'Close'
  }
};

// Language Provider Component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('am'); // Default to Amharic for Ethiopia
  const [translations, setTranslations] = useState<Translation>(BASE_TRANSLATIONS.am);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('hotel_language');
    if (savedLanguage && LANGUAGES.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      loadTranslations(savedLanguage);
    }
  }, []);

  const loadTranslations = async (languageCode: string) => {
    try {
      // First check if we have base translations
      if (BASE_TRANSLATIONS[languageCode as keyof typeof BASE_TRANSLATIONS]) {
        setTranslations(BASE_TRANSLATIONS[languageCode as keyof typeof BASE_TRANSLATIONS]);
        return;
      }

      // For other languages, we would normally load from API or files
      // For now, we'll fall back to English
      console.log(`Loading translations for ${languageCode}...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fallback to English if translation not found
      setTranslations(BASE_TRANSLATIONS.en);
      
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations(BASE_TRANSLATIONS.en);
    }
  };

  const switchLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    loadTranslations(languageCode);
    localStorage.setItem('hotel_language', languageCode);
    
    // Update document direction for RTL languages
    const language = LANGUAGES.find(l => l.code === languageCode);
    document.dir = language?.rtl ? 'rtl' : 'ltr';
  };

  const t = (key: string, params?: { [key: string]: string }) => {
    let translation = translations[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  const getCurrentLanguage = LANGUAGES.find(l => l.code === currentLanguage);
  const isRTL = getCurrentLanguage?.rtl || false;

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      translations,
      switchLanguage,
      t,
      isRTL
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language Selector Component
export function LanguageSelector() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('LanguageSelector must be used within LanguageProvider');
  }

  const { currentLanguage, switchLanguage } = context;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage);
  const popularLanguages = LANGUAGES.filter(l => l.popular);
  const otherLanguages = LANGUAGES.filter(l => !l.popular);

  const filteredLanguages = searchQuery
    ? LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleLanguageSelect = (languageCode: string) => {
    switchLanguage(languageCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  const playPronunciation = (languageCode: string) => {
    // Text-to-speech for language pronunciation
    const language = LANGUAGES.find(l => l.code === languageCode);
    if (language && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(language.nativeName);
      utterance.lang = languageCode;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.nativeName}</span>
          <span className="sm:hidden">{currentLang?.flag}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Language
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-y-auto max-h-96">
          {/* Current Language */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Language</h3>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentLang?.flag}</span>
                  <div>
                    <p className="font-medium">{currentLang?.name}</p>
                    <p className="text-sm text-gray-600">{currentLang?.nativeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Current</Badge>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {filteredLanguages ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Search Results ({filteredLanguages.length})</h3>
              {filteredLanguages.map((language) => (
                <LanguageItem 
                  key={language.code}
                  language={language}
                  isSelected={language.code === currentLanguage}
                  onSelect={handleLanguageSelect}
                  onPlayPronunciation={playPronunciation}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Popular Languages */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Popular Languages
                </h3>
                <div className="space-y-1">
                  {popularLanguages.map((language) => (
                    <LanguageItem 
                      key={language.code}
                      language={language}
                      isSelected={language.code === currentLanguage}
                      onSelect={handleLanguageSelect}
                      onPlayPronunciation={playPronunciation}
                    />
                  ))}
                </div>
              </div>

              {/* Other Languages */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">All Languages ({otherLanguages.length})</h3>
                <div className="space-y-1">
                  {otherLanguages.map((language) => (
                    <LanguageItem 
                      key={language.code}
                      language={language}
                      isSelected={language.code === currentLanguage}
                      onSelect={handleLanguageSelect}
                      onPlayPronunciation={playPronunciation}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 text-center text-xs text-gray-500">
          Missing your language? <Button variant="link" className="text-xs p-0 h-auto">Request Translation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Language Item Component
function LanguageItem({ 
  language, 
  isSelected, 
  onSelect, 
  onPlayPronunciation 
}: { 
  language: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
  onPlayPronunciation: (code: string) => void;
}) {
  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 border border-blue-200' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(language.code)}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{language.flag}</span>
        <div>
          <p className="font-medium text-sm">{language.name}</p>
          <p className="text-xs text-gray-600" dir={language.rtl ? 'rtl' : 'ltr'}>
            {language.nativeName}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {language.popular && (
          <Badge variant="secondary" className="text-xs">Popular</Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onPlayPronunciation(language.code);
          }}
          className="p-1 h-6 w-6"
        >
          <Volume2 className="h-3 w-3" />
        </Button>
        {isSelected && <Check className="h-4 w-4 text-green-600" />}
      </div>
    </div>
  );
}

// Hook for using translations
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}

// RTL Layout Component
export function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { isRTL } = useTranslation();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}

// Language Stats Component for Admin
export function LanguageStats() {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-700">Supported Languages</h3>
        <p className="text-2xl font-bold text-blue-600">{LANGUAGES.length}</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-700">Popular Languages</h3>
        <p className="text-2xl font-bold text-green-600">
          {LANGUAGES.filter(l => l.popular).length}
        </p>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-700">RTL Support</h3>
        <p className="text-2xl font-bold text-purple-600">
          {LANGUAGES.filter(l => l.rtl).length}
        </p>
      </div>
    </div>
  );
}
