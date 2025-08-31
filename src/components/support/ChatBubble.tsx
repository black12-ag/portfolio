import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Minimize2, Zap, HeadphonesIcon } from 'lucide-react';
import SuperiorLiveChat from './SuperiorLiveChat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatBubbleProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme?: 'blue' | 'purple' | 'green' | 'orange';
  showWelcomeMessage?: boolean;
  autoOpen?: boolean;
  workingHours?: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: { start: string; end: string; enabled: boolean };
    };
  };
}

export default function ChatBubble({ 
  position = 'bottom-right',
  theme = 'blue',
  showWelcomeMessage = true,
  autoOpen = false,
  workingHours
}: ChatBubbleProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Theme configurations
  const themes = {
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      hover: 'from-blue-700 to-blue-800',
      accent: 'bg-blue-600'
    },
    purple: {
      gradient: 'from-purple-600 to-purple-700', 
      hover: 'from-purple-700 to-purple-800',
      accent: 'bg-purple-600'
    },
    green: {
      gradient: 'from-green-600 to-green-700',
      hover: 'from-green-700 to-green-800', 
      accent: 'bg-green-600'
    },
    orange: {
      gradient: 'from-orange-600 to-orange-700',
      hover: 'from-orange-700 to-orange-800',
      accent: 'bg-orange-600'
    }
  };

  // Position configurations
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  // Check working hours
  const checkWorkingHours = () => {
    if (!workingHours?.enabled) return true;
    
    const now = new Date();
    const dayName = now.toLocaleDateString('en', { weekday: 'short' }).toLowerCase(); // mon, tue, etc.
    const schedule = workingHours.schedule[dayName];
    
    if (!schedule?.enabled) return false;
    
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM
    return currentTime >= schedule.start && currentTime <= schedule.end;
  };

  // Auto-show welcome message
  useEffect(() => {
    if (showWelcomeMessage && !isOpen) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcomeMessage, isOpen]);

  // Auto-open chat
  useEffect(() => {
    if (autoOpen && !localStorage.getItem('chat-auto-opened')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('chat-auto-opened', 'true');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  // Check online status
  useEffect(() => {
    setIsOnline(checkWorkingHours());
    
    // Check every minute
    const interval = setInterval(() => {
      setIsOnline(checkWorkingHours());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [workingHours, checkWorkingHours]);

  // Handle welcome message click
  const handleWelcomeClick = () => {
    setShowWelcome(false);
    setIsOpen(true);
  };

  const currentTheme = themes[theme];

  return (
    <>
      {/* Main Chat Bubble */}
      <div className={`fixed ${positions[position]} z-50 flex flex-col items-end gap-3`}>
        {/* Welcome Message */}
        {showWelcome && !isOpen && (
          <div className="bg-card rounded-lg shadow-lg p-4 max-w-64 border border-border animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentTheme.gradient} flex items-center justify-center flex-shrink-0`}>
                <HeadphonesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground mb-1">
                  {t('Need help?')}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('Chat with our support team for instant assistance!')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleWelcomeClick}
                    className={`bg-gradient-to-r ${currentTheme.gradient} hover:${currentTheme.hover} text-white border-0 h-7 text-xs`}
                  >
                    {t('Start Chat')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowWelcome(false)}
                    className="h-7 text-xs text-gray-500"
                  >
                    {t('Later')}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcome(false)}
                className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Chat Bubble Button */}
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentTheme.gradient} hover:${currentTheme.hover} shadow-lg hover:shadow-xl transition-all duration-300 border-0 group`}
            aria-label={t('Open live chat')}
          >
            <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-200" />
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs border-2 border-background">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            
            {/* Online status indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`} />
            
            {/* Pulse animation when online */}
            {isOnline && (
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTheme.gradient} animate-ping opacity-75`} />
            )}
          </Button>

          {/* Quick action buttons when hovered */}
          <div className="absolute bottom-0 right-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            {/* Quick FAQ button */}
            <Button
              size="sm"
              variant="outline"
              className="bg-card shadow-md hover:shadow-lg h-8 w-8 p-0"
              title={t('Quick FAQ')}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isOnline ? t('We\'re online!') : t('We\'ll be back soon')}
          </p>
          {workingHours?.enabled && !isOnline && (
            <p className="text-xs text-muted-foreground">
              {t('Available during business hours')}
            </p>
          )}
        </div>
      </div>

      {/* Superior Live Chat Component */}
      <SuperiorLiveChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customerInfo={{
          id: user?.id,
          name: user?.email?.split('@')[0] || 'User',
          email: user?.email
        }}
        chatBubbleMode={false}
        isAgentView={false}
        onClickOutside={true}
      />

      {/* Floating notifications */}
      {unreadCount > 0 && !isOpen && (
        <div className={`fixed ${positions[position]} z-40 -translate-y-20 -translate-x-4`}>
          <div className="bg-card rounded-lg shadow-lg p-2 border border-border animate-bounce">
            <p className="text-xs text-muted-foreground">
              {t('{{count}} new message', { count: unreadCount })}
            </p>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      <div className={`fixed ${positions[position]} z-40 -translate-y-24 -translate-x-8 opacity-0 transition-opacity duration-200`}>
        <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-75" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-150" />
          </div>
          <span className="text-xs text-muted-foreground">{t('Agent typing...')}</span>
        </div>
      </div>
    </>
  );
}

// Working hours configuration helper
export const defaultWorkingHours = {
  enabled: true,
  timezone: 'UTC',
  schedule: {
    mon: { start: '09:00', end: '17:00', enabled: true },
    tue: { start: '09:00', end: '17:00', enabled: true },
    wed: { start: '09:00', end: '17:00', enabled: true },
    thu: { start: '09:00', end: '17:00', enabled: true },
    fri: { start: '09:00', end: '17:00', enabled: true },
    sat: { start: '10:00', end: '14:00', enabled: true },
    sun: { start: '10:00', end: '14:00', enabled: false }
  }
};
