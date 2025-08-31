// Complete Notification System
// Handles push notifications, in-app notifications, email notifications, and SMS

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'system' | 'marketing' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  createdAt: Date;
  scheduledFor?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  actions?: NotificationAction[];
  category?: string;
  tags?: string[];
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'host' | 'admin' | 'guest';
  contactInfo: {
    email?: string;
    phone?: string;
    pushToken?: string;
  };
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  types: {
    booking: boolean;
    payment: boolean;
    message: boolean;
    system: boolean;
    marketing: boolean;
    reminder: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'url' | 'deep_link' | 'function';
  target: string;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  channels: NotificationChannel['type'][];
  templates: {
    push?: { title: string; body: string };
    email?: { subject: string; html: string; text: string };
    sms?: { message: string };
    in_app?: { title: string; message: string };
  };
  variables: string[];
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: number;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
}

class NotificationSystem {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private pushSubscriptions: Map<string, PushSubscription> = new Map();
  private listeners: Array<(notification: Notification) => void> = [];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.loadData();
    this.initializeServiceWorker();
    this.setupDefaultTemplates();
  }

  private loadData(): void {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const notificationsData = JSON.parse(savedNotifications);
      for (const notif of notificationsData) {
        this.notifications.set(notif.id, {
          ...notif,
          createdAt: new Date(notif.createdAt),
          scheduledFor: notif.scheduledFor ? new Date(notif.scheduledFor) : undefined,
          deliveredAt: notif.deliveredAt ? new Date(notif.deliveredAt) : undefined,
          readAt: notif.readAt ? new Date(notif.readAt) : undefined
        });
      }
    }

    // Load user preferences
    const savedPreferences = localStorage.getItem('notification_preferences');
    if (savedPreferences) {
      const preferencesData = JSON.parse(savedPreferences);
      for (const [userId, prefs] of Object.entries(preferencesData)) {
        this.userPreferences.set(userId, prefs as NotificationPreferences);
      }
    }
  }

  private saveData(): void {
    // Save notifications
    const notificationsArray = Array.from(this.notifications.values());
    localStorage.setItem('notifications', JSON.stringify(notificationsArray));

    // Save preferences
    const preferencesData: Record<string, NotificationPreferences> = {} as Record<string, never>;
    for (const [userId, prefs] of this.userPreferences.entries()) {
      preferencesData[userId] = prefs;
    }
    localStorage.setItem('notification_preferences', JSON.stringify(preferencesData));
  }

  private async initializeServiceWorker(): Promise<void> {
    // Only register notifications service worker in production and when explicitly enabled
    if (!('serviceWorker' in navigator)) return;
    if (!import.meta.env.PROD || import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'true') return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorkerRegistration = registration;
      if (import.meta.env.VITE_VERBOSE_LOGS === 'true') {
        console.debug('✅ Service Worker registered for notifications');
      }
    } catch (error) {
      if (import.meta.env.VITE_VERBOSE_LOGS === 'true') {
        console.warn('❌ Service Worker registration failed:', error);
      }
    }
  }

  private setupDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'booking_confirmation',
        name: 'Booking Confirmation',
        type: 'booking',
        channels: ['push', 'email', 'in_app'],
        templates: {
          push: {
            title: 'Booking Confirmed!',
            body: 'Your booking for {{propertyName}} has been confirmed'
          },
          email: {
            subject: 'Booking Confirmation - {{bookingId}}',
            html: '<h1>Booking Confirmed</h1><p>Your booking for {{propertyName}} has been confirmed.</p>',
            text: 'Your booking for {{propertyName}} has been confirmed.'
          },
          in_app: {
            title: 'Booking Confirmed',
            message: 'Your booking for {{propertyName}} has been confirmed for {{checkIn}} - {{checkOut}}'
          }
        },
        variables: ['propertyName', 'bookingId', 'checkIn', 'checkOut', 'totalAmount']
      },
      {
        id: 'payment_success',
        name: 'Payment Success',
        type: 'payment',
        channels: ['push', 'email', 'in_app'],
        templates: {
          push: {
            title: 'Payment Successful',
            body: 'Payment of {{amount}} {{currency}} processed successfully'
          },
          email: {
            subject: 'Payment Receipt - {{paymentId}}',
            html: '<h1>Payment Successful</h1><p>Your payment of {{amount}} {{currency}} has been processed.</p>',
            text: 'Your payment of {{amount}} {{currency}} has been processed successfully.'
          },
          in_app: {
            title: 'Payment Successful',
            message: 'Your payment of {{amount}} {{currency}} has been processed successfully'
          }
        },
        variables: ['amount', 'currency', 'paymentId', 'bookingId']
      },
      {
        id: 'new_message',
        name: 'New Message',
        type: 'message',
        channels: ['push', 'in_app'],
        templates: {
          push: {
            title: 'New message from {{senderName}}',
            body: '{{messagePreview}}'
          },
          in_app: {
            title: 'New Message',
            message: 'You have a new message from {{senderName}}'
          }
        },
        variables: ['senderName', 'messagePreview', 'conversationId']
      },
      {
        id: 'check_in_reminder',
        name: 'Check-in Reminder',
        type: 'reminder',
        channels: ['push', 'email', 'in_app'],
        templates: {
          push: {
            title: 'Check-in Tomorrow',
            body: 'Don\'t forget your check-in at {{propertyName}} tomorrow'
          },
          email: {
            subject: 'Check-in Reminder - {{propertyName}}',
            html: '<h1>Check-in Reminder</h1><p>Your check-in at {{propertyName}} is tomorrow.</p>',
            text: 'Your check-in at {{propertyName}} is tomorrow.'
          },
          in_app: {
            title: 'Check-in Reminder',
            message: 'Your check-in at {{propertyName}} is tomorrow at {{checkInTime}}'
          }
        },
        variables: ['propertyName', 'checkInTime', 'hostContact']
      }
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Push notifications permission denied');
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 'your_vapid_public_key_here'
        )
      });

      this.pushSubscriptions.set(userId, subscription);
      localStorage.setItem('push_subscription', JSON.stringify(subscription));
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendNotification(
    templateId: string,
    recipients: NotificationRecipient[],
    variables: Record<string, unknown> = {} as Record<string, never>,
    options: {
      priority?: Notification['priority'];
      scheduledFor?: Date;
      category?: string;
      tags?: string[];
    } = {} as Record<string, never>
  ): Promise<Notification> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: template.type,
      priority: options.priority || 'medium',
      title: this.replaceVariables(template.templates.in_app?.title || template.templates.push?.title || 'Notification', variables),
      message: this.replaceVariables(template.templates.in_app?.message || template.templates.push?.body || 'You have a new notification', variables),
      data: variables,
      channels: template.channels.map(type => ({ type, config: Record<string, never>, enabled: true })),
      recipients,
      status: 'pending',
      createdAt: new Date(),
      scheduledFor: options.scheduledFor,
      category: options.category,
      tags: options.tags,
      actions: this.getNotificationActions(template.type, variables)
    };

    this.notifications.set(notification.id, notification);
    this.saveData();

    // Send immediately or schedule
    if (options.scheduledFor && options.scheduledFor > new Date()) {
      this.scheduleNotification(notification);
    } else {
      await this.deliverNotification(notification);
    }

    // Notify listeners
    this.notifyListeners(notification);

    return notification;
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    const deliveryPromises: Promiseunknown[] = [];

    for (const recipient of notification.recipients) {
      const userPrefs = this.getUserPreferences(recipient.id);
      
      // Check if user wants this type of notification
      if (!userPrefs.types[notification.type]) {
        continue;
      }

      // Check quiet hours
      if (this.isQuietHours(userPrefs)) {
        // Schedule for after quiet hours
        this.scheduleNotification(notification, this.getQuietHoursEnd(userPrefs));
        continue;
      }

      for (const channel of notification.channels) {
        if (!channel.enabled || !userPrefs.channels[channel.type]) {
          continue;
        }

        switch (channel.type) {
          case 'push':
            deliveryPromises.push(this.sendPushNotification(notification, recipient));
            break;
          case 'email':
            deliveryPromises.push(this.sendEmailNotification(notification, recipient));
            break;
          case 'sms':
            deliveryPromises.push(this.sendSMSNotification(notification, recipient));
            break;
          case 'in_app':
            deliveryPromises.push(this.sendInAppNotification(notification, recipient));
            break;
          case 'webhook':
            deliveryPromises.push(this.sendWebhookNotification(notification, recipient));
            break;
        }
      }
    }

    try {
      await Promise.allSettled(deliveryPromises);
      notification.status = 'delivered';
      notification.deliveredAt = new Date();
    } catch (error) {
      notification.status = 'failed';
      console.error('Failed to deliver notification:', error);
    }

    this.saveData();
  }

  private async sendPushNotification(notification: Notification, recipient: NotificationRecipient): Promise<void> {
    const subscription = this.pushSubscriptions.get(recipient.id);
    if (!subscription) {
      console.warn(`No push subscription for user ${recipient.id}`);
      return;
    }

    const payload: PushNotificationPayload = {
      title: notification.title,
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        notificationId: notification.id,
        type: notification.type,
        ...notification.data
      },
      actions: notification.actions?.map(action => ({
        action: action.id,
        title: action.label
      })),
      tag: notification.category || notification.type,
      requireInteraction: notification.priority === 'urgent'
    };

    // In a real app, this would be sent to your push service
    // For now, we'll use the browser's Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction
      });
    }
  }

  private async sendEmailNotification(notification: Notification, recipient: NotificationRecipient): Promise<void> {
    if (!recipient.contactInfo.email) {
      console.warn(`No email address for user ${recipient.id}`);
      return;
    }

    try {
      const { emailService } = await import('./emailService');
      
      // Use a generic email template for notifications
      await emailService.sendEmail('template_notification', {
        to_email: recipient.contactInfo.email,
        to_name: recipient.id,
        from_name: 'METAH Travel Team',
        notification_title: notification.title,
        notification_message: notification.message,
        notification_type: notification.type,
        notification_priority: notification.priority
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSMSNotification(notification: Notification, recipient: NotificationRecipient): Promise<void> {
    if (!recipient.contactInfo.phone) {
      console.warn(`No phone number for user ${recipient.id}`);
      return;
    }

    // SMS implementation would go here
    // For now, we'll just log it
    console.log(`SMS to ${recipient.contactInfo.phone}: ${notification.title} - ${notification.message}`);
  }

  private async sendInAppNotification(notification: Notification, recipient: NotificationRecipient): Promise<void> {
    // In-app notifications are handled by the UI components
    // This just ensures the notification is stored and available
    console.log(`In-app notification for user ${recipient.id}: ${notification.title}`);
  }

  private async sendWebhookNotification(notification: Notification, recipient: NotificationRecipient): Promise<void> {
    // Webhook implementation would go here
    console.log(`Webhook notification for user ${recipient.id}: ${notification.title}`);
  }

  private scheduleNotification(notification: Notification, scheduledFor?: Date): void {
    const targetTime = scheduledFor || notification.scheduledFor;
    if (!targetTime) return;

    const delay = targetTime.getTime() - Date.now();
    if (delay <= 0) {
      this.deliverNotification(notification);
      return;
    }

    setTimeout(() => {
      this.deliverNotification(notification);
    }, delay);
  }

  private replaceVariables(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private getNotificationActions(type: Notification['type'], data: Record<string, unknown>): NotificationAction[] {
    switch (type) {
      case 'booking':
        return [
          {
            id: 'view_booking',
            label: 'View Booking',
            action: 'deep_link',
            target: `/bookings/${data.bookingId}`,
            style: 'primary'
          }
        ];
      case 'payment':
        return [
          {
            id: 'view_receipt',
            label: 'View Receipt',
            action: 'deep_link',
            target: `/profile/payments`,
            style: 'primary'
          }
        ];
      case 'message':
        return [
          {
            id: 'reply',
            label: 'Reply',
            action: 'deep_link',
            target: `/messages/${data.conversationId}`,
            style: 'primary'
          }
        ];
      default:
        return [];
    }
  }

  getUserPreferences(userId: string): NotificationPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences();
  }

  setUserPreferences(userId: string, preferences: NotificationPreferences): void {
    this.userPreferences.set(userId, preferences);
    this.saveData();
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      channels: {
        push: true,
        email: true,
        sms: false,
        in_app: true
      },
      types: {
        booking: true,
        payment: true,
        message: true,
        system: true,
        marketing: false,
        reminder: true
      },
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours?.enabled) return false;

    const now = new Date();
    const start = this.parseTime(preferences.quiet_hours.start);
    const end = this.parseTime(preferences.quiet_hours.end);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (start < end) {
      return currentMinutes >= start && currentMinutes < end;
    } else {
      return currentMinutes >= start || currentMinutes < end;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getQuietHoursEnd(preferences: NotificationPreferences): Date {
    if (!preferences.quiet_hours?.enabled) return new Date();

    const now = new Date();
    const endTime = this.parseTime(preferences.quiet_hours.end);
    const endDate = new Date(now);
    
    endDate.setHours(Math.floor(endTime / 60), endTime % 60, 0, 0);
    
    // If end time is tomorrow
    if (endTime < this.parseTime(preferences.quiet_hours.start)) {
      endDate.setDate(endDate.getDate() + 1);
    }

    return endDate;
  }

  getNotifications(userId: string, limit = 50): Notification[] {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.recipients.some(recipient => recipient.id === userId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.recipients.some(recipient => recipient.id === userId) &&
        !notification.readAt
      ).length;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.readAt = new Date();
      this.saveData();
    }
  }

  markAllAsRead(userId: string): void {
    for (const notification of this.notifications.values()) {
      if (notification.recipients.some(recipient => recipient.id === userId) && !notification.readAt) {
        notification.readAt = new Date();
      }
    }
    this.saveData();
  }

  deleteNotification(notificationId: string): void {
    this.notifications.delete(notificationId);
    this.saveData();
  }

  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(notification: Notification): void {
    for (const listener of this.listeners) {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    }
  }

  // Quick notification helpers
  async notifyBookingConfirmed(bookingId: string, recipientId: string, bookingData: any): Promise<void> {
    const recipient: NotificationRecipient = {
      id: recipientId,
      type: 'user',
      contactInfo: { email: 'user@example.com' },
      preferences: this.getUserPreferences(recipientId)
    };

    await this.sendNotification('booking_confirmation', [recipient], {
      bookingId,
      propertyName: bookingData.propertyName,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      totalAmount: bookingData.totalAmount
    }, { priority: 'high', category: 'booking' });
  }

  async notifyPaymentSuccess(paymentId: string, recipientId: string, paymentData: any): Promise<void> {
    const recipient: NotificationRecipient = {
      id: recipientId,
      type: 'user',
      contactInfo: { email: 'user@example.com' },
      preferences: this.getUserPreferences(recipientId)
    };

    await this.sendNotification('payment_success', [recipient], {
      paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      bookingId: paymentData.bookingId
    }, { priority: 'high', category: 'payment' });
  }

  async notifyNewMessage(senderId: string, recipientId: string, messageData: any): Promise<void> {
    const recipient: NotificationRecipient = {
      id: recipientId,
      type: 'user',
      contactInfo: { email: 'user@example.com' },
      preferences: this.getUserPreferences(recipientId)
    };

    await this.sendNotification('new_message', [recipient], {
      senderName: messageData.senderName,
      messagePreview: messageData.preview,
      conversationId: messageData.conversationId
    }, { priority: 'medium', category: 'communication' });
  }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem();
