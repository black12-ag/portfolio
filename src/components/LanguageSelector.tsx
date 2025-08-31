import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';
import { useToast } from '@/hooks/use-toast';

const LanguageSelector = React.memo(() => {
  const isMobile = useIsMobile();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { settings } = useAdminSettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const entries = useMemo(() => {
    // Filter by enabled list, then alphabetical by display name
    const enabled = settings?.enabledLanguages || [];
    return Object.entries(languages)
      .filter(([code]) => enabled.includes(code))
      .sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [languages, settings?.enabledLanguages]);

  const suggested = useMemo(() => {
    const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
    const list = [currentLanguage, browser, 'en-GB', 'en', 'en-US', 'am', 'sw'].filter(Boolean);
    const unique: string[] = [];
    const enabledLanguages = settings?.enabledLanguages || [];
    list.forEach((code) => {
      if (enabledLanguages.includes(code) && languages[code as keyof typeof languages] && !unique.includes(code)) unique.push(code);
    });
    return unique.slice(0, 6);
  }, [currentLanguage, languages, settings?.enabledLanguages]);

  const filtered = useMemo(() => {
    if (!query) return entries;
    const q = query.toLowerCase();
    return entries.filter(([code, l]) => code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
  }, [entries, query]);

  const handleLanguageChange = async (code: string) => {
    if (code === currentLanguage) {
      setOpen(false);
      return;
    }
    
    setLoading(true);
    try {
      await setLanguage(code);
      
      // Show success toast
      const languageInfo = languages[code as keyof typeof languages];
      toast({
        title: "Language Changed! 🌍",
        description: `Switched to ${languageInfo?.name || code}`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Failed to switch language:', error);
      toast({
        title: "Language Switch Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const Trigger = (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:text-primary h-9 w-9"
          aria-label="Language"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-base">
              {languages[currentLanguage as keyof typeof languages]?.flag}
            </span>
          )}
        </Button>
  );

  const Panel = (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search language" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      
      {/* Current Language Display */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-muted-foreground mb-2">Current Language</p>
        <div className="flex items-center gap-2">
          <span className="text-xl">{languages[currentLanguage as keyof typeof languages]?.flag}</span>
          <span className="font-medium">{languages[currentLanguage as keyof typeof languages]?.name}</span>
          <Check className="h-4 w-4 text-green-500" />
        </div>
      </div>
      
      {/* Suggested */}
      {!query && suggested.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Suggested for you</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {suggested.map((code) => {
              const l = languages[code as keyof typeof languages];
              return (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  disabled={loading}
            className={cn(
                    "flex items-center gap-2 p-2 rounded-md border hover:bg-accent disabled:opacity-50",
                    currentLanguage === code && "border-primary bg-accent"
                  )}
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-base">{l.flag}</span>
                  <span className="text-sm">{l.name}</span>
                </button>
              );
            })}
          </div>
            </div>
      )}

      {/* All languages */}
      <div className="space-y-2">
        {!query && <p className="text-xs text-muted-foreground">All languages</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map(([code, l]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border hover:bg-accent text-left disabled:opacity-50",
                currentLanguage === code && "border-primary bg-accent"
              )}
            >
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-base">{l.flag}</span>
              <span className="text-sm truncate">{l.name}</span>
              {currentLanguage === code && <Check className="ml-auto h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{Trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select your language</SheetTitle>
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
          <DialogTitle>Select your language</DialogTitle>
        </DialogHeader>
        {Panel}
      </DialogContent>
    </Dialog>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;