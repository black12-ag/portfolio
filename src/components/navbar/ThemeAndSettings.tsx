import React from 'react';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSelector from '@/components/LanguageSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThemeAndSettingsProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export default function ThemeAndSettings({ className, variant = 'desktop' }: ThemeAndSettingsProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  if (variant === 'mobile') {
    return (
      <div className={`flex flex-col space-y-4 p-4 border-t ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('settings.theme')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            className="h-9 w-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('settings.language')}</span>
          <LanguageSelector variant="compact" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('settings.currency')}</span>
          <CurrencySelector variant="compact" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Language Selector */}
        <LanguageSelector />
        
        {/* Currency Selector */}
        <CurrencySelector />
        
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
              className="h-9 w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
