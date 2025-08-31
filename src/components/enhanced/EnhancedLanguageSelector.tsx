import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Globe, 
  Search, 
  Check, 
  Star, 
  Users, 
  MapPin, 
  Zap,
  Clock,
  ArrowRight,
  Download,
  Settings,
  RefreshCw,
  Volume2,
  Eye,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { languageManager, ALL_LANGUAGES } from '@/lib/translations/languageManager';

interface EnhancedLanguageSelectorProps {
  compact?: boolean;
  showSearch?: boolean;
  showGroups?: boolean;
  showProgress?: boolean;
  onLanguageChange?: (langCode: string) => void;
}

export default function EnhancedLanguageSelector({
  compact = false,
  showSearch = true,
  showGroups = true,
  showProgress = true,
  onLanguageChange
}: EnhancedLanguageSelectorProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(languageManager.getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, boolean>>({});

  // Language groups
  const languageGroups = useMemo(() => {
    const groups = languageManager.getLanguageGroups();
    return Object.entries(groups).map(([groupId, languages]) => ({
      id: groupId,
      name: groupId.charAt(0).toUpperCase() + groupId.slice(1),
      languages,
      description: getGroupDescription(groupId)
    }));
  }, []);

  // Current language info
  const currentLangInfo = useMemo(() => 
    ALL_LANGUAGES[currentLanguage as keyof typeof ALL_LANGUAGES], 
    [currentLanguage]
  );

  // Filtered languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return Object.entries(ALL_LANGUAGES);
    
    const query = searchQuery.toLowerCase();
    return Object.entries(ALL_LANGUAGES).filter(([code, info]) =>
      info.name.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      (info.flag && info.flag.includes(query))
    );
  }, [searchQuery]);

  // Popular languages (most commonly used)
  const popularLanguages = useMemo(() => [
    'en-US', 'es', 'fr', 'de', 'zh-CN', 'ja', 'ar', 'hi', 'pt', 'ru'
  ], []);

  // Suggested languages based on user's browser/location
  const suggestedLanguages = useMemo(() => {
    const browser = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const suggestions = [currentLanguage, browser, 'en-US', 'am', 'sw'];
    const unique = Array.from(new Set(suggestions)).filter(lang => 
      ALL_LANGUAGES[lang as keyof typeof ALL_LANGUAGES]
    );
    return unique.slice(0, 5);
  }, [currentLanguage]);

  // Listen to language changes
  useEffect(() => {
    const unsubscribe = languageManager.addListener((newLang) => {
      setCurrentLanguage(newLang);
      onLanguageChange?.(newLang);
    });
    return unsubscribe;
  }, [onLanguageChange]);

  // Group descriptions
  function getGroupDescription(groupId: string): string {
    const descriptions = {
      popular: 'Most commonly used languages worldwide',
      european: 'European Union and other European languages',
      african: 'Major African languages including Ethiopian languages',
      asian: 'Asian and Pacific languages',
      americas: 'Languages from the Americas',
      chinese: 'Chinese language variants'
    };
    return descriptions[groupId as keyof typeof descriptions] || '';
  }

  // Handle language change
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLanguage) {
      setOpen(false);
      return;
    }

    setIsLoading(true);
    setLoadingProgress(prev => ({ ...prev, [langCode]: true }));

    try {
      await languageManager.switchLanguage(langCode);
      
      toast({
        title: `Language Changed! 🌍`,
        description: `Switched to ${ALL_LANGUAGES[langCode as keyof typeof ALL_LANGUAGES]?.name}`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Failed to switch language:', error);
      toast({
        title: "Language Switch Failed",
        description: "Failed to switch language. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingProgress(prev => ({ ...prev, [langCode]: false }));
    }
  };

  // Preload popular languages
  const preloadLanguages = async () => {
    setIsLoading(true);
    try {
      await languageManager.preloadLanguages(popularLanguages);
      toast({
        title: "Languages Preloaded! ⚡",
        description: "Popular languages are now cached for faster switching",
      });
    } catch (error) {
      console.error('Failed to preload languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get cache status
  const cacheStatus = languageManager.getCacheStatus();

  // Language item component
  const LanguageItem = ({ langCode, info }: { langCode: string; info: any }) => {
    const isActive = langCode === currentLanguage;
    const isLoading = loadingProgress[langCode];
    const isCached = cacheStatus.cached.includes(langCode);
    const isPopular = popularLanguages.includes(langCode);
    const isSuggested = suggestedLanguages.includes(langCode);

    return (
      <Button
        key={langCode}
        variant={isActive ? "default" : "outline"}
        className={`w-full justify-start h-auto p-3 ${isActive ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => handleLanguageChange(langCode)}
        disabled={isLoading}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-lg">{info.flag}</span>
            <div className="text-left">
              <div className="font-medium">{info.name}</div>
              <div className="text-xs text-muted-foreground">{langCode}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
            {isActive && <Check className="h-4 w-4 text-green-500" />}
            {isPopular && <Star className="h-3 w-3 text-yellow-500" />}
            {isSuggested && <Sparkles className="h-3 w-3 text-purple-500" />}
            {isCached && <Zap className="h-3 w-3 text-blue-500" />}
            {info.rtl && <ArrowRight className="h-3 w-3 text-orange-500" />}
          </div>
        </div>
      </Button>
    );
  };

  // Compact view
  if (compact) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLangInfo?.flag}</span>
        <span className="text-sm">{currentLanguage}</span>
      </Button>
    );
  }

  // Trigger button
  const TriggerButton = (
    <Button variant="outline" className="gap-2 min-w-[120px]">
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{currentLangInfo?.flag}</span>
      <span>{currentLangInfo?.name || currentLanguage}</span>
    </Button>
  );

  // Content component
  const SelectorContent = () => (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Select Language</h2>
          <p className="text-sm text-muted-foreground">
            Choose your preferred language for the interface
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            {Object.keys(ALL_LANGUAGES).length} languages
          </Badge>
          {showProgress && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {cacheStatus.cached.length} cached
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button size="sm" variant="outline" onClick={preloadLanguages} disabled={isLoading}>
          <Download className="h-3 w-3 mr-1" />
          Preload Popular
        </Button>
        <Button size="sm" variant="outline" onClick={() => languageManager.clearCache()}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Clear Cache
        </Button>
      </div>

      {/* Current Language */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentLangInfo?.flag}</span>
              <div>
                <div className="font-medium">Current Language</div>
                <div className="text-sm text-muted-foreground">
                  {currentLangInfo?.name} ({currentLanguage})
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Active</Badge>
              {languageManager.isRTL() && <Badge variant="outline">RTL</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      {showGroups ? (
        <Tabs defaultValue="suggested" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="groups">By Region</TabsTrigger>
            <TabsTrigger value="all">All Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="space-y-3">
            <h3 className="font-medium mb-3">Suggested for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedLanguages.map(langCode => {
                const info = ALL_LANGUAGES[langCode as keyof typeof ALL_LANGUAGES];
                return info ? <LanguageItem key={langCode} langCode={langCode} info={info} /> : null;
              })}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-3">
            <h3 className="font-medium mb-3">Most Popular Languages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularLanguages.map(langCode => {
                const info = ALL_LANGUAGES[langCode as keyof typeof ALL_LANGUAGES];
                return info ? <LanguageItem key={langCode} langCode={langCode} info={info} /> : null;
              })}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {languageGroups.map(group => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.languages.map(langCode => {
                      const info = ALL_LANGUAGES[langCode as keyof typeof ALL_LANGUAGES];
                      return info ? <LanguageItem key={langCode} langCode={langCode} info={info} /> : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            <h3 className="font-medium mb-3">All Languages ({filteredLanguages.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {filteredLanguages.map(([langCode, info]) => (
                <LanguageItem key={langCode} langCode={langCode} info={info} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium mb-3">Available Languages ({filteredLanguages.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredLanguages.map(([langCode, info]) => (
              <LanguageItem key={langCode} langCode={langCode} info={info} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Legend:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>Popular</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-500" />
            <span>Suggested</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-500" />
            <span>Cached</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-orange-500" />
            <span>RTL</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on device
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {TriggerButton}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Language Selection</SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            <SelectorContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Language Selection</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <SelectorContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
