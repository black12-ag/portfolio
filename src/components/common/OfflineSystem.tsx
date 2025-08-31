import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  CloudOff,
  Cloud,
  HardDrive,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Currency types
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Exchange rate to ETB
  popular?: boolean;
}

const CURRENCIES: Currency[] = [
  // Ethiopian Birr (base currency)
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'ብር', flag: '🇪🇹', rate: 1, popular: true },
  
  // Popular international currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 0.018, popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.017, popular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.014, popular: true },
  
  // African currencies
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', rate: 2.85 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX', flag: '🇺🇬', rate: 67.5 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', rate: 44.2 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF', flag: '🇷🇼', rate: 20.8 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', rate: 0.34 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', rate: 14.2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭', rate: 0.21 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£E', flag: '🇪🇬', rate: 0.56 },
  
  // Other major currencies
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 2.65 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 0.13 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 1.52 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 0.028 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rate: 0.025 }
];

// Offline data structure
interface OfflineData {
  bookings: unknown[];
  expenses: unknown[];
  staff: unknown[];
  rooms: unknown[];
  lastSync: string;
  pendingChanges: unknown[];
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingCount: number;
  syncProgress: number;
  error: string | null;
}

interface CurrencyContextType {
  currentCurrency: Currency;
  currencies: Currency[];
  switchCurrency: (code: string) => void;
  convertAmount: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, currency?: string) => string;
}

interface OfflineContextType {
  syncStatus: SyncStatus;
  offlineData: OfflineData;
  syncData: () => Promise<void>;
  saveOfflineData: (type: string, data: unknown) => void;
  getOfflineData: (type: string) => unknown[];
}

// Create contexts
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Currency Provider
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(CURRENCIES[0]); // Default to ETB

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('hotel_currency');
    if (savedCurrency) {
      const currency = CURRENCIES.find(c => c.code === savedCurrency);
      if (currency) {
        setCurrentCurrency(currency);
      }
    }
  }, []);

  const switchCurrency = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    if (currency) {
      setCurrentCurrency(currency);
      localStorage.setItem('hotel_currency', code);
    }
  };

  const convertAmount = (amount: number, fromCurrency?: string, toCurrency?: string): number => {
    const from = CURRENCIES.find(c => c.code === (fromCurrency || currentCurrency.code));
    const to = CURRENCIES.find(c => c.code === (toCurrency || currentCurrency.code));
    
    if (!from || !to) return amount;
    
    // Convert to ETB first, then to target currency
    const etbAmount = amount / from.rate;
    return etbAmount * to.rate;
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const curr = currency ? CURRENCIES.find(c => c.code === currency) || currentCurrency : currentCurrency;
    
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{
      currentCurrency,
      currencies: CURRENCIES,
      switchCurrency,
      convertAmount,
      formatCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Offline Provider
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingCount: 0,
    syncProgress: 0,
    error: null
  });

  const [offlineData, setOfflineData] = useState<OfflineData>({
    bookings: [],
    expenses: [],
    staff: [],
    rooms: [],
    lastSync: '',
    pendingChanges: []
  });

  useEffect(() => {
    // Load offline data from localStorage
    loadOfflineData();
    
    // Set up online/offline listeners
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: null }));
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing data...",
        variant: "default"
      });
      syncData();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "You're Offline",
        description: "Don't worry, your data will be saved locally and synced when you're back online.",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData, toast]);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('hotel_offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
        setSyncStatus(prev => ({ 
          ...prev, 
          pendingCount: data.pendingChanges?.length || 0,
          lastSync: data.lastSync ? new Date(data.lastSync) : null
        }));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const saveOfflineData = (type: string, data: unknown) => {
    const newOfflineData = {
      ...offlineData,
      [type]: Array.isArray(data) ? data : [data],
      pendingChanges: [...offlineData.pendingChanges, {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString()
      }]
    };

    setOfflineData(newOfflineData);
    localStorage.setItem('hotel_offline_data', JSON.stringify(newOfflineData));
    
    setSyncStatus(prev => ({ 
      ...prev, 
      pendingCount: newOfflineData.pendingChanges.length 
    }));

    // Auto-sync if online
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      syncData();
    }
  };

  const getOfflineData = (type: string) => {
    return offlineData[type as keyof OfflineData] as unknown[] || [];
  };

  const syncData = async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0, error: null }));

    try {
      const pendingChanges = offlineData.pendingChanges;
      
      if (pendingChanges.length === 0) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync: new Date(),
          syncProgress: 100
        }));
        return;
      }

      // Simulate sync process
      for (let i = 0; i < pendingChanges.length; i++) {
        const change = pendingChanges[i];
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update progress
        const progress = ((i + 1) / pendingChanges.length) * 100;
        setSyncStatus(prev => ({ ...prev, syncProgress: progress }));
      }

      // Clear pending changes after successful sync
      const clearedData = {
        ...offlineData,
        pendingChanges: [],
        lastSync: new Date().toISOString()
      };

      setOfflineData(clearedData);
      localStorage.setItem('hotel_offline_data', JSON.stringify(clearedData));

      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSync: new Date(),
        pendingCount: 0,
        syncProgress: 100
      }));

      toast({
        title: "Sync Complete",
        description: `${pendingChanges.length} changes synced successfully`,
        variant: "default"
      });

    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error: 'Sync failed. Will retry automatically.',
        syncProgress: 0
      }));
      
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Will retry when connection improves.",
        variant: "destructive"
      });
    }
  };

  return (
    <OfflineContext.Provider value={{
      syncStatus,
      offlineData,
      syncData,
      saveOfflineData,
      getOfflineData
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

// Currency Selector Component
export function CurrencySelector() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('CurrencySelector must be used within CurrencyProvider');
  }

  const { currentCurrency, currencies, switchCurrency } = context;
  const [isOpen, setIsOpen] = useState(false);

  const popularCurrencies = currencies.filter(c => c.popular);
  const otherCurrencies = currencies.filter(c => !c.popular);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span>{currentCurrency.flag}</span>
        <span>{currentCurrency.code}</span>
        <span className="hidden sm:inline">({currentCurrency.symbol})</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Select Currency</h3>
            
            {/* Current Currency */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Current</p>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{currentCurrency.flag}</span>
                    <div>
                      <p className="font-medium">{currentCurrency.name}</p>
                      <p className="text-sm text-gray-600">{currentCurrency.code} ({currentCurrency.symbol})</p>
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Popular Currencies */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Popular</p>
              <div className="space-y-1">
                {popularCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      currency.code === currentCurrency.code ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => {
                      switchCurrency(currency.code);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span>{currency.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{currency.name}</p>
                        <p className="text-xs text-gray-500">{currency.code} ({currency.symbol})</p>
                      </div>
                    </div>
                    {currency.code === currentCurrency.code && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Currencies */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Other Currencies</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {otherCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      switchCurrency(currency.code);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span>{currency.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{currency.name}</p>
                        <p className="text-xs text-gray-500">{currency.code} ({currency.symbol})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Offline Status Component
export function OfflineStatus() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('OfflineStatus must be used within OfflineProvider');
  }

  const { syncStatus, syncData } = context;

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Indicator */}
      <Badge 
        variant={syncStatus.isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {syncStatus.isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Pending Changes */}
      {syncStatus.pendingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {syncStatus.pendingCount} pending
        </Badge>
      )}

      {/* Sync Button */}
      {syncStatus.isOnline && (
        <Button
          size="sm"
          variant="ghost"
          onClick={syncData}
          disabled={syncStatus.isSyncing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          {syncStatus.isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      )}

      {/* Last Sync Time */}
      {syncStatus.lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {syncStatus.lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// Sync Progress Component
export function SyncProgress() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('SyncProgress must be used within OfflineProvider');
  }

  const { syncStatus } = context;

  if (!syncStatus.isSyncing && syncStatus.pendingCount === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <span className="text-sm font-medium">
              {syncStatus.isSyncing ? 'Syncing data...' : `${syncStatus.pendingCount} changes pending`}
            </span>
          </div>
          
          {syncStatus.isSyncing && (
            <span className="text-sm text-gray-600">
              {Math.round(syncStatus.syncProgress)}%
            </span>
          )}
        </div>
        
        {syncStatus.isSyncing && (
          <Progress value={syncStatus.syncProgress} className="h-2" />
        )}
        
        {syncStatus.error && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {syncStatus.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Offline Dashboard Component
export function OfflineDashboard() {
  const offlineContext = useContext(OfflineContext);
  const currencyContext = useContext(CurrencyContext);
  
  if (!offlineContext || !currencyContext) {
    throw new Error('OfflineDashboard must be used within providers');
  }

  const { syncStatus, offlineData } = offlineContext;
  const { formatCurrency } = currencyContext;

  const dataStats = {
    bookings: offlineData.bookings?.length || 0,
    expenses: offlineData.expenses?.length || 0,
    staff: offlineData.staff?.length || 0,
    rooms: offlineData.rooms?.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offline Dashboard</h2>
        <OfflineStatus />
      </div>

      <SyncProgress />

      {/* Storage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-2xl font-bold">{dataStats.bookings}</p>
              </div>
              <Database className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold">{dataStats.expenses}</p>
              </div>
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff</p>
                <p className="text-2xl font-bold">{dataStats.staff}</p>
              </div>
              <Download className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Sync</p>
                <p className="text-2xl font-bold text-yellow-600">{syncStatus.pendingCount}</p>
              </div>
              <Upload className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <>
                <Globe className="h-5 w-5 text-green-600" />
                Connected to Server
              </>
            ) : (
              <>
                <CloudOff className="h-5 w-5 text-red-600" />
                Working Offline
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {syncStatus.isOnline 
                ? 'Your data is being synced automatically with the server.' 
                : 'You are currently offline. Your data is being saved locally and will sync when connection is restored.'}
            </p>
            
            {syncStatus.lastSync && (
              <p className="text-sm text-gray-500">
                Last successful sync: {syncStatus.lastSync.toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Custom hooks
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
