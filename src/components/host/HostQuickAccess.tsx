import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Calendar,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  X,
  Zap
} from 'lucide-react';

export default function HostQuickAccess() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Only show for authenticated hosts (or admins acting as host)
  if (!isAuthenticated || !isVisible || (user?.role !== 'host' && user?.role !== 'admin')) {
    return null;
  }

  const hostTools = [
    {
      name: 'Analytics',
      href: '/host/analytics',
      icon: BarChart3,
      color: 'bg-blue-500',
      description: 'Performance and revenue insights'
    },
    {
      name: 'Properties',
      href: '/host/properties',
      icon: Home,
      color: 'bg-green-500',
      description: 'Manage your listings'
    },
    {
      name: 'Bookings',
      href: '/host/bookings',
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'View and manage reservations'
    },
    {
      name: 'Messages',
      href: '/host/messages',
      icon: MessageSquare,
      color: 'bg-orange-500',
      description: 'Communicate with guests'
    }
  ];

  // Mock quick stats for visual context
  const currentStats = {
    occupancy: 76,
    newMessages: 5,
    upcomingCheckins: 3
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 border-emerald-200 dark:border-emerald-800 shadow-lg max-w-xs">
        <CardContent className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-xs">
                  {t('Host Tools')}
                </h3>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300">
                  {t('Quick shortcuts for hosts')}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="text-center">
              <div className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                {currentStats.occupancy}%
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300">{t('Occupancy')}</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                {currentStats.newMessages}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300">{t('Messages')}</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                {currentStats.upcomingCheckins}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300">{t('Check-ins')}</div>
            </div>
          </div>

          {/* Expanded Tools */}
          {isExpanded && (
            <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 space-y-2">
              {hostTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.name}
                    to={tool.href}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-200 group"
                  >
                    <div className={`w-8 h-8 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-emerald-900 dark:text-emerald-100">
                        {t(tool.name)}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">
                        {t(tool.description)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Expand hint */}
          {!isExpanded && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-[10px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 h-4 px-2"
              >
                {t('Click to expand host tools')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
