import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

export default function LanguageCurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const { settings } = useAdminSettings();

  const currentLangData = languages[currentLanguage as keyof typeof languages];
  const currentCurrencyData = currencies[currentCurrency as keyof typeof currencies];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 px-3 flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-sm">
            {currentLangData?.flag}
          </span>
          <DollarSign className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
            <span>{currentCurrency}</span>
            <span className="opacity-80">{currentCurrencyData?.symbol}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </h3>
            <Select value={currentLanguage} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.entries(languages).filter(([code]) => settings.localization.enabledLanguages.includes(code)).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-sm">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Currency
            </h3>
            <Select value={currentCurrency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.entries(currencies).filter(([code]) => settings.localization.enabledCurrencies.includes(code)).map(([code, currency]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-sm">{currency.flag}</span>
                      <span>{currency.name}</span>
                      <span className="text-gray-500">({code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}