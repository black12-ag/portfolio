import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';

/**
 * Currency Status Component
 * Shows live currency information and refresh controls
 */
export default function CurrencyStatus() {
  const { ratesStatus, refreshRates, currentCurrency } = useCurrency();

  const handleRefresh = async () => {
    try {
      await refreshRates();
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {/* Status Badge */}
      <Badge 
        variant={ratesStatus.source === 'live' ? 'default' : 'secondary'} 
        className="h-5 text-xs"
        title={ratesStatus.source === 'live' ? 'Live rates from FXRatesAPI' : 'Using fallback rates'}
      >
        <TrendingUp className="h-3 w-3 mr-1" />
        {ratesStatus.source === 'live' ? 'FXRates Live' : 'Fallback'}
      </Badge>

      {/* Last Updated */}
      {ratesStatus.lastUpdated && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{ratesStatus.lastUpdated}</span>
        </div>
      )}

      {/* Current Currency */}
      <span className="font-medium text-foreground">{currentCurrency}</span>

      {/* Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={ratesStatus.isLoading}
        className="h-6 px-2 text-xs"
      >
        <RefreshCw className={`h-3 w-3 ${ratesStatus.isLoading ? 'animate-spin' : ''}`} />
        {ratesStatus.isLoading ? 'Loading...' : 'Refresh'}
      </Button>
    </div>
  );
}

/**
 * Compact Currency Status (for footer or small spaces)
 */
export function CompactCurrencyStatus() {
  const { ratesStatus, currentCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <div 
        className={`h-2 w-2 rounded-full ${
          ratesStatus.source === 'live' ? 'bg-green-500' : 'bg-yellow-500'
        }`} 
      />
      <span>{currentCurrency}</span>
      {ratesStatus.lastUpdated && (
        <span className="opacity-75">({ratesStatus.lastUpdated})</span>
      )}
    </div>
  );
}
