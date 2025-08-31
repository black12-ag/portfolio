import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

export default function CurrencySelector() {
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const { settings } = useAdminSettings();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrencyInfo = currencies[currentCurrency as keyof typeof currencies];

  const allowed = useMemo(() => new Set(settings?.enabledCurrencies || []), [settings?.enabledCurrencies]);
  const popularCurrencies = ['ETB', 'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'SAR', 'AED'].filter((c) => allowed.has(c));
  const otherCurrencies = Object.keys(currencies).filter((currency) => allowed.has(currency) && !popularCurrencies.includes(currency));

  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const entries = useMemo(() => {
    // Sort alphabetically by currency name
    return Object.entries(currencies)
      .filter(([code]) => allowed.has(code))
      .sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [currencies, allowed]);
  const filtered = useMemo(() => {
    if (!query) return entries;
    const q = query.toLowerCase();
    return entries.filter(([code, c]) =>
      code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.symbol || '').toLowerCase().includes(q)
    );
  }, [entries, query]);

  const Trigger = (
    <Button
      variant="ghost"
      size="icon"
      className="text-foreground hover:text-primary h-9 px-2 w-auto min-w-[2.25rem]"
      aria-label={`Currency: ${currentCurrency}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
        <span>{currentCurrency}</span>
        <span className="opacity-80">{currentCurrencyInfo?.symbol}</span>
      </span>
        </Button>
  );

  const Panel = (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search currency" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
      {/* Suggested top currencies */}
      {!query && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Suggested for you</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
            {[currentCurrency, 'ETB', 'USD', 'EUR', 'KES', 'UGX', 'TZS']
              .filter((code, idx, arr) => !!currencies[code as keyof typeof currencies] && arr.indexOf(code) === idx)
              .slice(0, 8)
              .map((code) => {
                const c = currencies[code as keyof typeof currencies];
              return (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); setOpen(false); }}
                    className={`flex items-center justify-between gap-3 p-2 rounded-md border hover:bg-accent ${currentCurrency === code ? 'border-primary bg-accent' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-base">{c.flag}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{code} – {c.symbol}</p>
                      </div>
                    </div>
                  </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map(([code, c]) => (
          <button
            key={code}
            onClick={() => { setCurrency(code); setOpen(false); }}
            className={`flex items-center justify-between gap-3 p-2 rounded-md border hover:bg-accent ${currentCurrency === code ? 'border-primary bg-accent' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-base">{c.flag}</span>
              <div className="text-left">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{code} – {c.symbol}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{Trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Choose a currency</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{Panel}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a currency</DialogTitle>
        </DialogHeader>
        {Panel}
      </DialogContent>
    </Dialog>
  );
}
