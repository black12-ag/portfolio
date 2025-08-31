import React, { useState, memo, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

// Import new modular components
import NavbarSearch from '@/components/navbar/NavbarSearch';
import UserMenu from '@/components/navbar/UserMenu';
import NavigationItems from '@/components/navbar/NavigationItems';
import ThemeAndSettings from '@/components/navbar/ThemeAndSettings';

interface OptimizedNavbarProps {
  className?: string;
}

const OptimizedNavbar = memo(function OptimizedNavbar({ className }: OptimizedNavbarProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { settings } = useAdminSettings();

  const closeSheet = () => setIsOpen(false);

  // Get site name from admin settings or use default
  const siteName = settings?.siteName || 'Metah';

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
              aria-label={t('nav.home')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                M
              </div>
              <span className="hidden sm:inline-block">{siteName}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {/* Navigation Items */}
              <NavigationItems variant="desktop" />

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <NavbarSearch />
              </div>

              {/* Theme & Settings + User Menu */}
              <div className="flex items-center space-x-2">
                <ThemeAndSettings variant="desktop" />
                <UserMenu />
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <NavbarSearch />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2"
                    aria-label={t('nav.menu')}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* Mobile Navigation Header */}
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                        M
                      </div>
                      <span className="text-lg font-bold">{siteName}</span>
                    </div>

                    {/* Mobile Navigation Items */}
                    <div className="flex-1 py-6">
                      <NavigationItems variant="mobile" onItemClick={closeSheet} />
                    </div>

                    {/* Mobile User Menu */}
                    <div className="py-4 border-t">
                      <UserMenu />
                    </div>

                    {/* Mobile Theme & Settings */}
                    <ThemeAndSettings variant="mobile" />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default OptimizedNavbar;
