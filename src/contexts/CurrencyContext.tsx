import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { liveCurrencyService } from '@/services/liveCurrencyService';

export const currencies = {
  // East Africa core
  ETB: { name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  RWF: { name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  BIF: { name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮' },
  SOS: { name: 'Somali Shilling', symbol: 'Sh', flag: '🇸🇴' },
  ERN: { name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷' },
  SDG: { name: 'Sudanese Pound', symbol: '£', flag: '🇸🇩' },
  SSP: { name: 'South Sudanese Pound', symbol: '£', flag: '🇸🇸' },
  // Popular
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  SAR: { name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  EGP: { name: 'Egyptian Pound', symbol: 'ج.م', flag: '🇪🇬' },
  MAD: { name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  TND: { name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
  GHS: { name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  XOF: { name: 'West African CFA Franc', symbol: 'CFA', flag: '🌍' },
  XAF: { name: 'Central African CFA Franc', symbol: 'CFA', flag: '🌍' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  PLN: { name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  RUB: { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  TRY: { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  MXN: { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  ARS: { name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  // Added from requested list
  BGN: { name: 'Bulgarian Lev', symbol: 'лв.', flag: '🇧🇬' },
  CLP: { name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  COP: { name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  CRC: { name: 'Costa Rican Colon', symbol: '₡', flag: '🇨🇷' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  HKD: { name: 'Hong Kong Dollar', symbol: '$', flag: '🇭🇰' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  ILS: { name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱' },
  KZT: { name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  TWD: { name: 'New Taiwan Dollar', symbol: '$', flag: '🇹🇼' },
  NZD: { name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿' },
  PEN: { name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  QAR: { name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  RON: { name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  SGD: { name: 'Singapore Dollar', symbol: '$', flag: '🇸🇬' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  UYU: { name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  ISK: { name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  JOD: { name: 'Jordanian Dinar', symbol: 'د.أ', flag: '🇯🇴' },
  OMR: { name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲' },
  NAD: { name: 'Namibian Dollar', symbol: '$', flag: '🇳🇦' },
  MDL: { name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩' }
};

// Live exchange rates - will be loaded from API daily
let liveExchangeRates: Record<string, number> | null = null;

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: number, fromCurrency?: string) => number;
  formatPrice: (price: number, fromCurrency?: string) => string;
  currencies: typeof currencies;
  refreshRates: () => Promise<void>;
  debugRefreshRates: () => Promise<void>;
  ratesStatus: {
    isLoading: boolean;
    lastUpdated: string | null;
    source: 'live' | 'fallback';
  };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [ratesStatus, setRatesStatus] = useState({
    isLoading: true,
    lastUpdated: null as string | null,
    source: 'fallback' as 'live' | 'fallback'
  });

  // Load exchange rates on mount and setup
  useEffect(() => {
    const initializeCurrency = async () => {
      // Load saved currency preference
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency && currencies[savedCurrency as keyof typeof currencies]) {
        setCurrentCurrency(savedCurrency);
      }

      // Load live exchange rates
      await loadExchangeRates();
    };

    initializeCurrency();
  }, []);

  // Load live exchange rates
  const loadExchangeRates = async () => {
    try {
      setRatesStatus(prev => ({ ...prev, isLoading: true }));
      
      const rates = await liveCurrencyService.getExchangeRates();
      liveExchangeRates = rates;
      
      const cacheStatus = liveCurrencyService.getCacheStatus();
      setRatesStatus({
        isLoading: false,
        lastUpdated: cacheStatus.date,
        source: cacheStatus.hasCache ? 'live' : 'fallback'
      });
      
      console.log('💰 Live exchange rates loaded:', {
        totalCurrencies: Object.keys(rates).length,
        sampleRates: { EUR: rates.EUR, GBP: rates.GBP, ETB: rates.ETB },
        source: cacheStatus.hasCache ? 'API' : 'fallback'
      });
      
    } catch (error) {
      console.error('❌ Failed to load exchange rates:', error);
      setRatesStatus({
        isLoading: false,
        lastUpdated: null,
        source: 'fallback'
      });
    }
  };

  const setCurrency = (currency: string) => {
    setCurrentCurrency(currency);
    localStorage.setItem('currency', currency);
  };

  const convertPrice = (price: number, fromCurrency = 'USD'): number => {
    if (fromCurrency === currentCurrency) return price;
    
    // Use live rates if available, otherwise fallback won't work since we removed static rates
    const rates = liveExchangeRates;
    if (!rates) {
      console.warn('⚠️ No exchange rates available, returning original price');
      return price;
    }
    
    // Convert to USD first if needed (USD is base currency)
    const priceInUSD = fromCurrency === 'USD' ? price : price / (rates[fromCurrency] || 1);
    
    // Convert to target currency
    const convertedPrice = currentCurrency === 'USD' ? priceInUSD : priceInUSD * (rates[currentCurrency] || 1);
    
    return Math.round(convertedPrice * 100) / 100;
  };

  const formatPrice = (price: number, fromCurrency = 'USD'): string => {
    const convertedPrice = convertPrice(price, fromCurrency);
    const currency = currencies[currentCurrency as keyof typeof currencies];
    
    if (currentCurrency === 'JPY' || currentCurrency === 'KRW') {
      return `${currency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
    }
    
    return `${currency.symbol}${convertedPrice.toLocaleString()}`;
  };

  // Force refresh rates (manual trigger)
  const refreshRates = async () => {
    await loadExchangeRates();
  };

  // Debug refresh (clear cache and force fresh fetch)
  const debugRefreshRates = async () => {
    try {
      setRatesStatus(prev => ({ ...prev, isLoading: true }));
      
      const rates = await liveCurrencyService.debugRefresh();
      liveExchangeRates = rates;
      
      const cacheStatus = liveCurrencyService.getCacheStatus();
      setRatesStatus({
        isLoading: false,
        lastUpdated: cacheStatus.date,
        source: 'live'
      });
      
      console.log('🔄 DEBUG: Fresh rates loaded with ETB =', rates.ETB);
      
    } catch (error) {
      console.error('❌ DEBUG refresh failed:', error);
      setRatesStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currentCurrency, 
      setCurrency, 
      convertPrice, 
      formatPrice, 
      currencies,
      refreshRates,
      debugRefreshRates,
      ratesStatus
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};