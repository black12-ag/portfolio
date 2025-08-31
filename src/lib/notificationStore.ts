// Real-time API-integrated Notification Store - Comprehensive notification management
import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from './apiClient';

// Notification Types
export type NotificationType = 'new_chat' | 'new_ticket' | 'urgent_escalation' | 'customer_callback' | 'shift_reminder' | 'performance_update' | 'system_alert' | 'chat_transfer' | 'booking_issue' | 'refund_request';

export type NotificationChannel = 'email' | 'app' | 'whatsapp' | 'sms' | 'push' | 'webhook';

export interface NotificationPreference {
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM format
    end_time: string;   // HH:MM format
  };
  urgency_override: boolean; // Allow urgent notifications during quiet hours
  threshold?: number; // For aggregated notifications
}

export interface AgentNotificationSettings {
  agentId: string;
  preferences: NotificationPreference[];
  global_settings: {
    do_not_disturb: boolean;
    sound_enabled: boolean;
    vibration_enabled: boolean;
    badge_count_enabled: boolean;
    language: string;
    timezone: string;
    desktop_notifications: boolean;
    email_digest: boolean;
    digest_frequency: 'hourly' | 'daily' | 'weekly';
  };
  contact_info: {
    whatsapp_number?: string;
    sms_number?: string;
    email_verified: boolean;
    whatsapp_verified: boolean;
    webhook_url?: string;
  };
  last_updated: string;
}

export interface NotificationMessage {
  id: string;
  agentId: string;
  type: NotificationType;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>; // Additional context data
  action_required: boolean;
  channels_sent: NotificationChannel[];
  delivery_status: Record<NotificationChannel, 'pending' | 'sent' | 'delivered' | 'failed'>;
  expires_at?: string; // For time-sensitive notifications
  category?: string;
  source_system?: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  channels: NotificationChannel[];
  variables: string[]; // Template variables like {{customerName}}
  active: boolean;
}

export interface NotificationAnalytics {
  agentId: string;
  period: 'day' | 'week' | 'month';
  total_sent: number;
  total_read: number;
  read_rate: number;
  response_time: number; // Average time to read/act
  channel_performance: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    delivery_rate: number;
  }>;
  type_breakdown: Record<NotificationType, number>;
}

// API endpoints
const API_ENDPOINTS = {
  NOTIFICATION_SETTINGS: '/api/v1/notifications/settings',
  NOTIFICATIONS: '/api/v1/notifications',
  NOTIFICATION_TEMPLATES: '/api/v1/notifications/templates',
  NOTIFICATION_ANALYTICS: '/api/v1/notifications/analytics',
  REAL_TIME_SUBSCRIBE: '/api/v1/notifications/subscribe',
  BULK_ACTIONS: '/api/v1/notifications/bulk'
};

// Fallback storage keys for offline/development
const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: 'metah-notification-settings-cache',
  NOTIFICATIONS: 'metah-notifications-cache',
  TEMPLATES: 'metah-notification-templates-cache'
};

// Utility functions for localStorage fallback
function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read ${key} from storage:`, error);
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to write ${key} to storage:`, error);
  }
}

// Default notification preferences for new agents
const defaultNotificationPreferences: NotificationPreference[] = [
  {
    type: 'new_chat',
    channels: ['app', 'push'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: true
  },
  {
    type: 'new_ticket',
    channels: ['app', 'email'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  },
  {
    type: 'urgent_escalation',
    channels: ['app', 'email', 'sms', 'push'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: true
  },
  {
    type: 'customer_callback',
    channels: ['app', 'push'],
    enabled: true,
    quiet_hours: { enabled: true, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  },
  {
    type: 'shift_reminder',
    channels: ['app', 'email'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  },
  {
    type: 'performance_update',
    channels: ['app', 'email'],
    enabled: true,
    quiet_hours: { enabled: true, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  },
  {
    type: 'system_alert',
    channels: ['app', 'push'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: true
  },
  {
    type: 'chat_transfer',
    channels: ['app', 'push'],
    enabled: true,
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    urgency_override: true
  },
  {
    type: 'booking_issue',
    channels: ['app', 'email'],
    enabled: true,
    quiet_hours: { enabled: true, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  },
  {
    type: 'refund_request',
    channels: ['app', 'email'],
    enabled: true,
    quiet_hours: { enabled: true, start_time: '22:00', end_time: '08:00' },
    urgency_override: false
  }
];

// Mock data for fallback
const fallbackSettings: AgentNotificationSettings[] = [];
const fallbackNotifications: NotificationMessage[] = [];

// Real API Functions with localStorage fallback
export async function getAgentNotificationSettings(agentId: string): Promise<AgentNotificationSettings> {
  try {
    // Try API first
    const response = await apiRequest<{ settings: AgentNotificationSettings }>(
      `${API_ENDPOINTS.NOTIFICATION_SETTINGS}/${agentId}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.settings) {
      // Cache for offline usage
      const cached = readFromStorage<AgentNotificationSettings[]>(STORAGE_KEYS.NOTIFICATION_SETTINGS, fallbackSettings);
      const existingIndex = cached.findIndex(s => s.agentId === agentId);
      if (existingIndex >= 0) {
        cached[existingIndex] = response.settings;
      } else {
        cached.push(response.settings);
      }
      writeToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, cached);
      
      return response.settings;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or create default
  const cached = readFromStorage<AgentNotificationSettings[]>(STORAGE_KEYS.NOTIFICATION_SETTINGS, fallbackSettings);
  const existing = cached.find(s => s.agentId === agentId);
  
  if (existing) {
    return existing;
  }
  
  // Create default settings for new agent
  const defaultSettings: AgentNotificationSettings = {
    agentId,
    preferences: defaultNotificationPreferences,
    global_settings: {
      do_not_disturb: false,
      sound_enabled: true,
      vibration_enabled: true,
      badge_count_enabled: true,
      language: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      desktop_notifications: true,
      email_digest: false,
      digest_frequency: 'daily'
    },
    contact_info: {
      email_verified: false,
      whatsapp_verified: false
    },
    last_updated: new Date().toISOString()
  };
  
  cached.push(defaultSettings);
  writeToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, cached);
  
  return defaultSettings;
}

export async function updateAgentNotificationSettings(settings: AgentNotificationSettings): Promise<void> {
  const updatedSettings = {
    ...settings,
    last_updated: new Date().toISOString()
  };

  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.NOTIFICATION_SETTINGS}/${settings.agentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<AgentNotificationSettings[]>(STORAGE_KEYS.NOTIFICATION_SETTINGS, fallbackSettings);
  const index = cached.findIndex(s => s.agentId === settings.agentId);
  
  if (index >= 0) {
    cached[index] = updatedSettings;
  } else {
    cached.push(updatedSettings);
  }
  
  writeToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, cached);
  console.log('Updated notification settings for agent:', settings.agentId);
}

export async function sendNotification(
  notification: Omit<NotificationMessage, 'id' | 'timestamp' | 'read' | 'channels_sent' | 'delivery_status'>
): Promise<void> {
  const fullNotification: NotificationMessage = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
    channels_sent: [],
    delivery_status: Record<string, never>,
    ...notification
  };

  try {
    // Try API first
    const response = await apiRequest<{ notification: NotificationMessage }>(
      API_ENDPOINTS.NOTIFICATIONS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullNotification),
      }
    );
    
    if (response?.notification) {
      return;
    }
  } catch (error) {
    console.warn('API call failed, using local processing fallback:', error);
  }

  // Fallback to local processing
  const agentSettings = await getAgentNotificationSettings(notification.agentId);
  
  // Check if notifications are enabled globally
  if (agentSettings.global_settings.do_not_disturb && notification.urgency !== 'critical') {
    console.log('Notification blocked by DND mode');
    return;
  }
  
  // Find preference for this notification type
  const preference = agentSettings.preferences.find(p => p.type === notification.type);
  
  if (!preference?.enabled) {
    console.log('Notification type disabled');
    return;
  }
  
  // Check quiet hours
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  if (preference.quiet_hours.enabled && !preference.urgency_override && notification.urgency !== 'critical') {
    const isQuietTime = isInQuietHours(currentTime, preference.quiet_hours.start_time, preference.quiet_hours.end_time);
    if (isQuietTime) {
      console.log('Notification blocked by quiet hours');
      return;
    }
  }
  
  fullNotification.channels_sent = preference.channels;
  
  // Store notification
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  cached.push(fullNotification);
  
  // Keep only last 1000 notifications to prevent storage overflow
  if (cached.length > 1000) {
    cached.splice(0, cached.length - 1000);
  }
  
  writeToStorage(STORAGE_KEYS.NOTIFICATIONS, cached);
  
  // Send via enabled channels
  for (const channel of preference.channels) {
    await sendViaChannel(channel, fullNotification, agentSettings);
  }
}

export async function getAgentNotifications(
  agentId: string, 
  filters?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
    type?: NotificationType;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    since?: string;
  }
): Promise<NotificationMessage[]> {
  try {
    // Try API first
    const queryParams = new URLSearchParams();
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());
    if (filters?.unread_only) queryParams.append('unread_only', 'true');
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.urgency) queryParams.append('urgency', filters.urgency);
    if (filters?.since) queryParams.append('since', filters.since);
    
    const response = await apiRequest<{ notifications: NotificationMessage[] }>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${agentId}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.notifications) {
      return response.notifications;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  let filtered = cached.filter(n => n.agentId === agentId);
  
  if (filters?.unread_only) {
    filtered = filtered.filter(n => !n.read);
  }
  
  if (filters?.type) {
    filtered = filtered.filter(n => n.type === filters.type);
  }
  
  if (filters?.urgency) {
    filtered = filtered.filter(n => n.urgency === filters.urgency);
  }
  
  if (filters?.since) {
    filtered = filtered.filter(n => n.timestamp >= filters.since);
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Apply limit and offset
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;
  
  return filtered.slice(offset, offset + limit);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`,
      {
        method: 'PUT',
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  const notification = cached.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    writeToStorage(STORAGE_KEYS.NOTIFICATIONS, cached);
  }
}

export async function markAllNotificationsAsRead(agentId: string): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.BULK_ACTIONS}/mark-all-read`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  cached
    .filter(n => n.agentId === agentId)
    .forEach(n => n.read = true);
  writeToStorage(STORAGE_KEYS.NOTIFICATIONS, cached);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
      {
        method: 'DELETE',
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  const index = cached.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    cached.splice(index, 1);
    writeToStorage(STORAGE_KEYS.NOTIFICATIONS, cached);
  }
}

export async function getUnreadNotificationCount(agentId: string): Promise<number> {
  try {
    // Try API first
    const response = await apiRequest<{ count: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${agentId}/unread-count`,
      {
        method: 'GET',
      }
    );
    
    if (response?.count !== undefined) {
      return response.count;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<NotificationMessage[]>(STORAGE_KEYS.NOTIFICATIONS, fallbackNotifications);
  return cached.filter(n => n.agentId === agentId && !n.read).length;
}

export async function getNotificationAnalytics(
  agentId: string, 
  period: 'day' | 'week' | 'month' = 'week'
): Promise<NotificationAnalytics | null> {
  try {
    // Try API first
    const response = await apiRequest<{ analytics: NotificationAnalytics }>(
      `${API_ENDPOINTS.NOTIFICATION_ANALYTICS}/${agentId}?period=${period}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.analytics) {
      return response.analytics;
    }
  } catch (error) {
    console.warn('API call failed, using mock fallback:', error);
  }

  // Mock analytics as fallback
  const notifications = await getAgentNotifications(agentId, { limit: 1000 });
  const totalSent = notifications.length;
  const totalRead = notifications.filter(n => n.read).length;
  
  return {
    agentId,
    period,
    total_sent: totalSent,
    total_read: totalRead,
    read_rate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
    response_time: 300, // Mock 5 minutes average
    channel_performance: {
      app: { sent: totalSent, delivered: totalSent, failed: 0, delivery_rate: 100 },
      email: { sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      whatsapp: { sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      sms: { sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      push: { sent: 0, delivered: 0, failed: 0, delivery_rate: 0 },
      webhook: { sent: 0, delivered: 0, failed: 0, delivery_rate: 0 }
    },
    type_breakdown: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>)
  };
}

// Helper Functions
function isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  
  if (start <= end) {
    // Same day quiet hours (e.g., 22:00 to 23:00)
    return current >= start && current <= end;
  } else {
    // Overnight quiet hours (e.g., 22:00 to 08:00)
    return current >= start || current <= end;
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

async function sendViaChannel(
  channel: NotificationChannel, 
  notification: NotificationMessage, 
  settings: AgentNotificationSettings
): Promise<void> {
  // Mock implementations for different channels
  switch (channel) {
    case 'email':
      console.log(`📧 Email sent to agent ${notification.agentId}: ${notification.title}`);
      notification.delivery_status.email = 'sent';
      break;
    case 'app':
      // This would trigger in-app notification
      console.log(`📱 In-app notification for agent ${notification.agentId}: ${notification.title}`);
      notification.delivery_status.app = 'delivered';
      
      // Trigger browser notification if supported and enabled
      if (settings.global_settings.desktop_notifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
      break;
    case 'whatsapp':
      if (settings.contact_info.whatsapp_verified) {
        console.log(`💬 WhatsApp sent to ${settings.contact_info.whatsapp_number}: ${notification.title}`);
        notification.delivery_status.whatsapp = 'sent';
      }
      break;
    case 'sms':
      if (settings.contact_info.sms_number) {
        console.log(`📱 SMS sent to ${settings.contact_info.sms_number}: ${notification.title}`);
        notification.delivery_status.sms = 'sent';
      }
      break;
    case 'push':
      console.log(`🔔 Push notification sent to agent ${notification.agentId}: ${notification.title}`);
      notification.delivery_status.push = 'sent';
      break;
    case 'webhook':
      if (settings.contact_info.webhook_url) {
        console.log(`🔗 Webhook sent to ${settings.contact_info.webhook_url}: ${notification.title}`);
        notification.delivery_status.webhook = 'sent';
      }
      break;
  }
}

// React Hook for Notification Management
export function useAgentNotifications(agentId: string) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        getAgentNotifications(agentId),
        getUnreadNotificationCount(agentId)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  // Track user activity to pause notifications when idle
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => document.addEventListener(event, updateActivity));
    return () => events.forEach(event => document.removeEventListener(event, updateActivity));
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      // Only refresh if page is visible and user is active
      if (!document.hidden && Date.now() - lastActivity < 300000) { // 5 minutes
        loadNotifications();
      }
    }, 120000); // Check every 2 minutes (reduced from 30 seconds)
    return () => clearInterval(interval);
  }, [loadNotifications, lastActivity]);

  const markAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await markAllNotificationsAsRead(agentId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notif = notifications.find(n => n.id === notificationId);
      return notif && !notif.read ? Math.max(0, prev - 1) : prev;
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    refresh: loadNotifications
  };
}

// Real-time notification subscription (WebSocket/SSE)
export function useRealTimeNotifications(agentId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    // In a real implementation, this would establish a WebSocket or SSE connection
    // For now, we'll use a mock implementation
    console.log(`Subscribing to real-time notifications for agent ${agentId}`);
    
    // Mock connection
    setIsConnected(true);
    
    // Cleanup
    return () => {
      console.log(`Unsubscribing from real-time notifications for agent ${agentId}`);
      setIsConnected(false);
    };
  }, [agentId]);

  return {
    isConnected,
    lastNotification
  };
}

// Mock data for testing
export function seedMockNotifications(agentId: string): void {
  const mockNotifications: Omit<NotificationMessage, 'id' | 'timestamp' | 'read' | 'channels_sent' | 'delivery_status'>[] = [
    {
      agentId,
      type: 'new_chat',
      title: 'New Chat Request',
      message: 'Customer John Smith has started a new chat about booking issues',
      urgency: 'medium',
      action_required: true,
      data: { customerId: 'cust-123', chatId: 'chat-456' }
    },
    {
      agentId,
      type: 'urgent_escalation',
      title: 'Urgent Escalation',
      message: 'Payment dispute case #12345 requires immediate attention',
      urgency: 'high',
      action_required: true,
      data: { ticketId: 'ticket-789' }
    },
    {
      agentId,
      type: 'performance_update',
      title: 'Weekly Performance Summary',
      message: 'Your satisfaction score increased by 5% this week!',
      urgency: 'low',
      action_required: false
    },
    {
      agentId,
      type: 'chat_transfer',
      title: 'Chat Transferred to You',
      message: 'A chat about billing issues has been transferred to you from Maria Rodriguez',
      urgency: 'medium',
      action_required: true,
      data: { chatId: 'chat-transfer-123', fromAgent: 'maria.rodriguez' }
    },
    {
      agentId,
      type: 'refund_request',
      title: 'New Refund Request',
      message: 'Customer requesting refund for booking #BK12345 - $250.00',
      urgency: 'high',
      action_required: true,
      data: { bookingId: 'BK12345', amount: 250.00, currency: 'USD' }
    }
  ];

  // Send mock notifications with staggered timing
  mockNotifications.forEach((notification, index) => {
    setTimeout(() => {
      sendNotification(notification);
    }, index * 2000); // 2 seconds apart
  });
}