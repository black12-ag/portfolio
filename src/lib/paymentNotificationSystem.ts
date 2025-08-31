import { PaymentTransaction } from '@/types/payment';
import { supabaseHelpers } from '@/lib/supabase';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'slack' | 'webhook';
  trigger: 'payment_received' | 'verification_required' | 'payment_approved' | 'payment_declined' | 'escalation_needed' | 'sla_warning' | 'fraud_detected';
  recipients: NotificationRecipient[];
  subject: string;
  content: string;
  enabled: boolean;
  conditions?: NotificationCondition[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastUsed?: Date;
    sendCount: number;
    successRate: number;
  };
}

export interface NotificationRecipient {
  type: 'customer' | 'agent' | 'manager' | 'admin' | 'role' | 'email' | 'phone';
  value: string;
  conditions?: NotificationCondition[];
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'slack' | 'webhook';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  rateLimits: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
}

export interface NotificationLog {
  id: string;
  templateId: string;
  transactionId: string;
  channel: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface RealTimeNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actions?: {
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'destructive';
  }[];
}

class PaymentNotificationSystem {
  private templates: Map<string, NotificationTemplate> = new Map();
  private channels: Map<string, NotificationChannel> = new Map();
  private logs: NotificationLog[] = [];
  private realtimeSubscribers: Map<string, (notification: RealTimeNotification) => void> = new Map();
  private rateLimitCounters: Map<string, { minute: number; hour: number; day: number; lastReset: Date }> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultChannels();
    this.loadCustomConfiguration();
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'payment_received_customer',
        name: 'Payment Received - Customer',
        type: 'email',
        trigger: 'payment_received',
        recipients: [{ type: 'customer', value: 'transaction.userId' }],
        subject: 'Payment Received - Verification in Progress',
        content: `Dear {{customerName}},

We have received your payment of {{amount}} {{currency}} for booking #{{bookingId}}.

Transaction Details:
- Amount: {{amount}} {{currency}}
- Payment Method: {{paymentMethod}}
- Transaction ID: {{transactionId}}
- Date: {{date}}

Your payment is currently being verified by our team. You will receive another notification once the verification is complete.

Expected Processing Time: {{estimatedTime}}

If you have any questions, please contact our support team.

Best regards,
Metah Travel Team`,
        enabled: true,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 95.2
        }
      },
      {
        id: 'verification_required_agent',
        name: 'Verification Required - Agent',
        type: 'push',
        trigger: 'verification_required',
        recipients: [{ type: 'role', value: 'payment_agent' }],
        subject: 'New Payment Requires Verification',
        content: 'Transaction {{transactionId}} ({{amount}} {{currency}}) requires manual verification. Priority: {{priority}}',
        enabled: true,
        conditions: [
          { field: 'amount', operator: 'greater_than', value: 1000 }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 98.7
        }
      },
      {
        id: 'payment_approved_customer',
        name: 'Payment Approved - Customer',
        type: 'email',
        trigger: 'payment_approved',
        recipients: [{ type: 'customer', value: 'transaction.userId' }],
        subject: 'Payment Approved - Booking Confirmed',
        content: `Dear {{customerName}},

Great news! Your payment has been successfully verified and approved.

Payment Details:
- Amount: {{amount}} {{currency}}
- Transaction ID: {{transactionId}}
- Approved By: {{approvedBy}}
- Approval Date: {{approvalDate}}

Your booking #{{bookingId}} is now confirmed. You will receive a separate email with your booking details and confirmation.

Thank you for choosing Metah Travel!

Best regards,
Metah Travel Team`,
        enabled: true,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 97.1
        }
      },
      {
        id: 'payment_declined_customer',
        name: 'Payment Declined - Customer',
        type: 'email',
        trigger: 'payment_declined',
        recipients: [{ type: 'customer', value: 'transaction.userId' }],
        subject: 'Payment Verification Issue - Action Required',
        content: `Dear {{customerName}},

We were unable to verify your payment of {{amount}} {{currency}} for booking #{{bookingId}}.

Reason: {{declineReason}}

Next Steps:
{{#if canRetry}}
- You can try submitting your payment again with correct information
- Ensure all payment details are accurate and documents are clear
{{/if}}
{{#if needsContact}}
- Please contact our support team for assistance
- Have your transaction ID ready: {{transactionId}}
{{/if}}

We apologize for any inconvenience and are here to help resolve this quickly.

Support Contact: support@metah.travel

Best regards,
Metah Travel Team`,
        enabled: true,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 94.8
        }
      },
      {
        id: 'sla_warning_manager',
        name: 'SLA Warning - Manager',
        type: 'slack',
        trigger: 'sla_warning',
        recipients: [{ type: 'role', value: 'payment_manager' }],
        subject: 'SLA Warning: Transaction Approaching Deadline',
        content: '⚠️ *SLA Warning*\n\nTransaction {{transactionId}} is approaching its SLA deadline.\n\n• Amount: {{amount}} {{currency}}\n• Time Remaining: {{timeRemaining}}\n• Assigned Agent: {{assignedAgent}}\n• Priority: {{priority}}\n\n<{{transactionUrl}}|View Transaction>',
        enabled: true,
        conditions: [
          { field: 'timeToSLA', operator: 'less_than', value: 30 } // 30 minutes
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 99.1
        }
      },
      {
        id: 'fraud_detected_security',
        name: 'Fraud Detected - Security Team',
        type: 'email',
        trigger: 'fraud_detected',
        recipients: [
          { type: 'role', value: 'fraud_specialist' },
          { type: 'email', value: 'security@metah.travel' }
        ],
        subject: 'URGENT: Potential Fraud Detected',
        content: `URGENT: Potential fraudulent transaction detected.

Transaction Details:
- Transaction ID: {{transactionId}}
- Amount: {{amount}} {{currency}}
- Customer: {{customerName}} ({{customerEmail}})
- Payment Method: {{paymentMethod}}
- Risk Score: {{riskScore}}
- Fraud Confidence: {{fraudConfidence}}%

Fraud Indicators:
{{#each fraudIndicators}}
- {{this.type}}: {{this.description}} ({{this.confidence}}% confidence)
{{/each}}

Immediate Actions Required:
1. Review transaction immediately
2. Contact customer for verification if needed
3. Escalate to law enforcement if confirmed fraud

Transaction Link: {{transactionUrl}}

This is an automated alert from the Payment Security System.`,
        enabled: true,
        conditions: [
          { field: 'fraudScore', operator: 'greater_than', value: 80 }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 100
        }
      },
      {
        id: 'escalation_needed_manager',
        name: 'Escalation Required - Manager',
        type: 'push',
        trigger: 'escalation_needed',
        recipients: [{ type: 'role', value: 'payment_manager' }],
        subject: 'Payment Escalation Required',
        content: 'Transaction {{transactionId}} has been escalated by {{agentName}}. Reason: {{escalationReason}}. Priority: {{priority}}',
        enabled: true,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          sendCount: 0,
          successRate: 97.8
        }
      }
    ];

    defaultTemplates.forEach(template => this.templates.set(template.id, template));
  }

  private initializeDefaultChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'email_primary',
        type: 'email',
        name: 'Primary Email Service',
        enabled: true,
        config: {
          provider: 'sendgrid',
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: 'noreply@metah.travel',
          fromName: 'Metah Travel'
        },
        rateLimits: {
          maxPerMinute: 60,
          maxPerHour: 1000,
          maxPerDay: 10000
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxDelay: 300000 // 5 minutes
        }
      },
      {
        id: 'sms_primary',
        type: 'sms',
        name: 'Primary SMS Service',
        enabled: true,
        config: {
          provider: 'twilio',
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          fromNumber: '+1234567890'
        },
        rateLimits: {
          maxPerMinute: 30,
          maxPerHour: 500,
          maxPerDay: 2000
        },
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 3,
          maxDelay: 600000 // 10 minutes
        }
      },
      {
        id: 'push_primary',
        type: 'push',
        name: 'Push Notifications',
        enabled: true,
        config: {
          provider: 'firebase',
          serverKey: process.env.FIREBASE_SERVER_KEY,
          projectId: process.env.FIREBASE_PROJECT_ID
        },
        rateLimits: {
          maxPerMinute: 100,
          maxPerHour: 2000,
          maxPerDay: 20000
        },
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 2,
          maxDelay: 120000 // 2 minutes
        }
      },
      {
        id: 'slack_primary',
        type: 'slack',
        name: 'Slack Integration',
        enabled: true,
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: '#payment-alerts',
          botName: 'Payment Bot'
        },
        rateLimits: {
          maxPerMinute: 20,
          maxPerHour: 200,
          maxPerDay: 1000
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxDelay: 180000 // 3 minutes
        }
      },
      {
        id: 'webhook_primary',
        type: 'webhook',
        name: 'Webhook Integration',
        enabled: false,
        config: {
          url: process.env.WEBHOOK_URL,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`,
            'Content-Type': 'application/json'
          }
        },
        rateLimits: {
          maxPerMinute: 50,
          maxPerHour: 1000,
          maxPerDay: 5000
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxDelay: 300000 // 5 minutes
        }
      }
    ];

    defaultChannels.forEach(channel => this.channels.set(channel.id, channel));
  }

  private async loadCustomConfiguration(): Promise<void> {
    try {
      // Load custom templates
      const storedTemplates = localStorage.getItem('custom-notification-templates');
      if (storedTemplates) {
        const customTemplates = JSON.parse(storedTemplates);
        customTemplates.forEach((template: NotificationTemplate) => {
          this.templates.set(template.id, {
            ...template,
            metadata: {
              ...template.metadata,
              createdAt: new Date(template.metadata.createdAt)
            }
          });
        });
      }

      // Load custom channels
      const storedChannels = localStorage.getItem('custom-notification-channels');
      if (storedChannels) {
        const customChannels = JSON.parse(storedChannels);
        customChannels.forEach((channel: NotificationChannel) => {
          this.channels.set(channel.id, channel);
        });
      }
    } catch (error) {
      console.error('Failed to load custom notification configuration:', error);
    }
  }

  async sendNotification(
    trigger: NotificationTemplate['trigger'],
    transaction: PaymentTransaction,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const applicableTemplates = Array.from(this.templates.values())
      .filter(template => template.enabled && template.trigger === trigger)
      .filter(template => this.evaluateConditions(template.conditions, { ...transaction, ...additionalData }));

    for (const template of applicableTemplates) {
      await this.processTemplate(template, transaction, additionalData);
    }
  }

  private evaluateConditions(conditions: NotificationCondition[] | undefined, data: any): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async processTemplate(
    template: NotificationTemplate,
    transaction: PaymentTransaction,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const templateData = {
      ...transaction,
      ...additionalData,
      customerName: `Customer ${transaction.userId.slice(-4)}`,
      customerEmail: `customer${transaction.userId.slice(-4)}@example.com`,
      date: new Date().toLocaleDateString(),
      estimatedTime: '2-4 hours',
      transactionUrl: `${window.location.origin}/admin/payments/${transaction.id}`
    };

    for (const recipient of template.recipients) {
      if (this.evaluateConditions(recipient.conditions, templateData)) {
        await this.sendToRecipient(template, recipient, templateData);
      }
    }

    // Update template usage statistics
    template.metadata.sendCount++;
    template.metadata.lastUsed = new Date();
  }

  private async sendToRecipient(
    template: NotificationTemplate,
    recipient: NotificationRecipient,
    data: any
  ): Promise<void> {
    const channel = Array.from(this.channels.values())
      .find(c => c.type === template.type && c.enabled);

    if (!channel) {
      console.error(`No enabled channel found for type: ${template.type}`);
      return;
    }

    // Check rate limits
    if (!this.checkRateLimit(channel.id)) {
      console.warn(`Rate limit exceeded for channel: ${channel.id}`);
      return;
    }

    const recipientAddress = this.resolveRecipient(recipient, data);
    if (!recipientAddress) {
      console.warn(`Could not resolve recipient: ${recipient.type}:${recipient.value}`);
      return;
    }

    const processedContent = this.processTemplate(template.content, data);
    const processedSubject = this.processTemplate(template.subject, data);

    const logEntry: NotificationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      transactionId: data.id,
      channel: channel.id,
      recipient: recipientAddress,
      status: 'pending',
      sentAt: new Date(),
      retryCount: 0
    };

    try {
      await this.deliverNotification(channel, recipientAddress, processedSubject, processedContent, data);
      logEntry.status = 'sent';
      logEntry.deliveredAt = new Date();
    } catch (error) {
      logEntry.status = 'failed';
      logEntry.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Schedule retry if within retry limits
      if (logEntry.retryCount < channel.retryPolicy.maxRetries) {
        setTimeout(() => {
          this.retryNotification(logEntry, channel, processedSubject, processedContent, data);
        }, this.calculateBackoffDelay(logEntry.retryCount, channel.retryPolicy));
      }
    }

    this.logs.push(logEntry);
  }

  private checkRateLimit(channelId: string): boolean {
    const now = new Date();
    const counter = this.rateLimitCounters.get(channelId) || {
      minute: 0,
      hour: 0,
      day: 0,
      lastReset: now
    };

    const channel = this.channels.get(channelId);
    if (!channel) return false;

    // Reset counters if needed
    const timeSinceReset = now.getTime() - counter.lastReset.getTime();
    if (timeSinceReset >= 24 * 60 * 60 * 1000) { // 24 hours
      counter.day = 0;
      counter.hour = 0;
      counter.minute = 0;
      counter.lastReset = now;
    } else if (timeSinceReset >= 60 * 60 * 1000) { // 1 hour
      counter.hour = 0;
      counter.minute = 0;
    } else if (timeSinceReset >= 60 * 1000) { // 1 minute
      counter.minute = 0;
    }

    // Check limits
    if (counter.minute >= channel.rateLimits.maxPerMinute ||
        counter.hour >= channel.rateLimits.maxPerHour ||
        counter.day >= channel.rateLimits.maxPerDay) {
      return false;
    }

    // Increment counters
    counter.minute++;
    counter.hour++;
    counter.day++;
    this.rateLimitCounters.set(channelId, counter);

    return true;
  }

  private resolveRecipient(recipient: NotificationRecipient, data: any): string | null {
    switch (recipient.type) {
      case 'customer':
        return data.customerEmail || `customer${data.userId.slice(-4)}@example.com`;
      case 'email':
        return recipient.value;
      case 'phone':
        return recipient.value;
      case 'role':
        // In production, this would query the database for users with the specified role
        return this.getUsersByRole(recipient.value)[0] || null;
      case 'agent':
        return `agent${recipient.value}@metah.travel`;
      case 'manager':
        return 'manager@metah.travel';
      case 'admin':
        return 'admin@metah.travel';
      default:
        return null;
    }
  }

  private getUsersByRole(role: string): string[] {
    // Mock implementation - in production, query user database
    const mockUsers = {
      'payment_agent': ['agent1@metah.travel', 'agent2@metah.travel'],
      'payment_manager': ['manager@metah.travel'],
      'fraud_specialist': ['fraud@metah.travel'],
      'admin': ['admin@metah.travel']
    };
    
    return mockUsers[role as keyof typeof mockUsers] || [];
  }

  private processTemplate(template: string, data: any): string {
    let processed = template;
    
    // Simple template processing - in production, use a proper template engine
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(data[key] || ''));
    });

    return processed;
  }

  private async deliverNotification(
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    content: string,
    data: any
  ): Promise<void> {
    // Mock delivery - in production, integrate with actual services
    console.log(`[${channel.type.toUpperCase()}] To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${content}`);

    // Simulate delivery delay and potential failure
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    if (Math.random() < 0.05) { // 5% failure rate for simulation
      throw new Error('Delivery failed');
    }

    // Send real-time notification to dashboard
    if (channel.type === 'push') {
      this.sendRealTimeNotification({
        type: 'info',
        title: subject,
        message: `${content.substring(0, 100)  }...`,
        data: { transactionId: data.id },
        actionRequired: data.trigger === 'verification_required'
      });
    }
  }

  private async retryNotification(
    logEntry: NotificationLog,
    channel: NotificationChannel,
    subject: string,
    content: string,
    data: any
  ): Promise<void> {
    logEntry.retryCount++;
    
    try {
      await this.deliverNotification(channel, logEntry.recipient, subject, content, data);
      logEntry.status = 'sent';
      logEntry.deliveredAt = new Date();
    } catch (error) {
      logEntry.status = 'failed';
      logEntry.error = error instanceof Error ? error.message : 'Retry failed';
    }
  }

  private calculateBackoffDelay(retryCount: number, retryPolicy: NotificationChannel['retryPolicy']): number {
    const baseDelay = 1000; // 1 second
    const delay = Math.min(
      baseDelay * Math.pow(retryPolicy.backoffMultiplier, retryCount),
      retryPolicy.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  // Real-time notification methods
  subscribeToRealTimeNotifications(userId: string, callback: (notification: RealTimeNotification) => void): void {
    this.realtimeSubscribers.set(userId, callback);
  }

  unsubscribeFromRealTimeNotifications(userId: string): void {
    this.realtimeSubscribers.delete(userId);
  }

  sendRealTimeNotification(notification: Omit<RealTimeNotification, 'id' | 'timestamp' | 'read'>): void {
    const fullNotification: RealTimeNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    // Send to all subscribers (in production, filter by user permissions)
    this.realtimeSubscribers.forEach(callback => {
      try {
        callback(fullNotification);
      } catch (error) {
        console.error('Error sending real-time notification:', error);
      }
    });
  }

  // Management methods
  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'metadata'>): Promise<NotificationTemplate> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: NotificationTemplate = {
      ...template,
      id,
      metadata: {
        createdBy: 'admin',
        createdAt: new Date(),
        sendCount: 0,
        successRate: 100
      }
    };

    this.templates.set(id, newTemplate);
    await this.saveCustomTemplates();
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate = { ...template, ...updates, id };
    this.templates.set(id, updatedTemplate);
    await this.saveCustomTemplates();
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates.delete(id);
    await this.saveCustomTemplates();
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  getNotificationLogs(transactionId?: string): NotificationLog[] {
    if (transactionId) {
      return this.logs.filter(log => log.transactionId === transactionId);
    }
    return [...this.logs].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  getNotificationStats(): any {
    const logs = this.logs;
    const total = logs.length;
    const sent = logs.filter(l => l.status === 'sent').length;
    const failed = logs.filter(l => l.status === 'failed').length;
    const pending = logs.filter(l => l.status === 'pending').length;

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      byChannel: this.getStatsByChannel(),
      byTemplate: this.getStatsByTemplate(),
      recentActivity: logs.slice(0, 10)
    };
  }

  private getStatsByChannel(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.logs.forEach(log => {
      if (!stats[log.channel]) {
        stats[log.channel] = { total: 0, sent: 0, failed: 0 };
      }
      stats[log.channel].total++;
      if (log.status === 'sent') stats[log.channel].sent++;
      if (log.status === 'failed') stats[log.channel].failed++;
    });

    return stats;
  }

  private getStatsByTemplate(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.logs.forEach(log => {
      if (!stats[log.templateId]) {
        stats[log.templateId] = { total: 0, sent: 0, failed: 0 };
      }
      stats[log.templateId].total++;
      if (log.status === 'sent') stats[log.templateId].sent++;
      if (log.status === 'failed') stats[log.templateId].failed++;
    });

    return stats;
  }

  private async saveCustomTemplates(): Promise<void> {
    try {
      const customTemplates = Array.from(this.templates.values()).filter(
        template => !template.id.includes('_customer') && 
                   !template.id.includes('_agent') &&
                   !template.id.includes('_manager') &&
                   !template.id.includes('_security')
      );
      
      localStorage.setItem('custom-notification-templates', JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Failed to save custom templates:', error);
    }
  }
}

export const paymentNotificationSystem = new PaymentNotificationSystem();
