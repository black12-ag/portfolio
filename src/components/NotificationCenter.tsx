import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Star,
  Clock4,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  notificationSystem, 
  type Notification, 
  type NotificationPreferences 
} from '@/lib/notificationSystem';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Define callback functions first
  const loadNotifications = useCallback(() => {
    if (!user) return;
    
    const userNotifications = notificationSystem.getNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(notificationSystem.getUnreadCount(user.id));
  }, [user]);

  const loadPreferences = useCallback(() => {
    if (!user) return;
    
    const userPrefs = notificationSystem.getUserPreferences(user.id);
    setPreferences(userPrefs);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Load initial data
    loadNotifications();
    loadPreferences();

    // Subscribe to real-time updates
    const unsubscribe = notificationSystem.subscribe((notification) => {
      if (notification.recipients.some(r => r.id === user.id)) {
        loadNotifications();
      }
    });

    return unsubscribe;
  }, [user, loadNotifications, loadPreferences]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationSystem.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    notificationSystem.markAllAsRead(user.id);
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationSystem.deleteNotification(notificationId);
    loadNotifications();
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: string | number | boolean | string[]) => {
    if (!user || !preferences) return;
    
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    notificationSystem.setUserPreferences(user.id, updatedPreferences);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      case 'marketing':
        return <Star className="h-4 w-4" />;
      case 'reminder':
        return <Clock4 className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.readAt;
    return notification.type === activeTab;
  });

  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationSystem.requestPermission();
      if (permission === 'granted' && user) {
        await notificationSystem.subscribeToPush(user.id);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Settings</h3>
                      
                      {/* Permission Request */}
                      {Notification.permission !== 'granted' && (
                        <div className="p-3 border rounded-lg bg-blue-50">
                          <p className="text-sm text-blue-800 mb-2">
                            Enable browser notifications to stay updated
                          </p>
                          <Button 
                            size="sm" 
                            onClick={requestNotificationPermission}
                            className="w-full"
                          >
                            Enable Notifications
                          </Button>
                        </div>
                      )}

                      {preferences && (
                        <>
                          {/* Channel Preferences */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Delivery Methods</h4>
                            {Object.entries(preferences.channels).map(([channel, enabled]) => (
                              <div key={channel} className="flex items-center justify-between">
                                <Label htmlFor={channel} className="text-sm capitalize">
                                  {channel.replace('_', ' ')}
                                </Label>
                                <Switch
                                  id={channel}
                                  checked={enabled}
                                  onCheckedChange={(checked) => 
                                    handlePreferenceChange('channels', {
                                      ...preferences.channels,
                                      [channel]: checked
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>

                          <Separator />

                          {/* Type Preferences */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Notification Types</h4>
                            {Object.entries(preferences.types).map(([type, enabled]) => (
                              <div key={type} className="flex items-center justify-between">
                                <Label htmlFor={type} className="text-sm capitalize">
                                  {type.replace('_', ' ')}
                                </Label>
                                <Switch
                                  id={type}
                                  checked={enabled}
                                  onCheckedChange={(checked) => 
                                    handlePreferenceChange('types', {
                                      ...preferences.types,
                                      [type]: checked
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="booking" className="text-xs">Bookings</TabsTrigger>
                <TabsTrigger value="message" className="text-xs">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <ScrollArea className="h-96">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <BellOff className="h-8 w-8 mb-2" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`
                              p-4 border-l-4 cursor-pointer transition-colors hover:bg-gray-50
                              ${getPriorityColor(notification.priority)}
                              ${!notification.readAt ? 'font-medium' : 'opacity-75'}
                            `}
                            onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {!notification.readAt && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-red-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {notification.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </span>
                                  </div>
                                  
                                  {notification.actions && notification.actions.length > 0 && (
                                    <div className="flex gap-1">
                                      {notification.actions.map((action) => (
                                        <Button
                                          key={action.id}
                                          variant={action.style === 'primary' ? 'default' : 'outline'}
                                          size="sm"
                                          className="h-6 px-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (action.action === 'deep_link' || action.action === 'url') {
                                              window.open(action.target, '_blank');
                                            }
                                          }}
                                        >
                                          {action.label}
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < filteredNotifications.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
