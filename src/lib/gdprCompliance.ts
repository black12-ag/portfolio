// GDPR Compliance Service
// Handles cookie consent, data portability, right to deletion, and privacy management

import Cookies from 'js-cookie';

export interface GDPRConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: Date;
  version: string;
  ip?: string;
  userAgent?: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  dataTypes: string[];
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledFor?: Date;
  reason?: string;
  dataTypes: string[];
  retentionPeriod?: number; // Days
}

export interface PersonalDataCategory {
  category: string;
  description: string;
  dataTypes: string[];
  purposes: string[];
  retention: string;
  legal_basis: string;
  canDelete: boolean;
  canExport: boolean;
}

export interface PrivacySettings {
  dataMinimization: boolean;
  anonymizeData: boolean;
  autoDeleteAfter: number; // Days
  allowProfiling: boolean;
  allowMarketing: boolean;
  allowDataSharing: boolean;
  preferredLanguage: string;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    postal: boolean;
  };
}

class GDPRComplianceService {
  private readonly CONSENT_COOKIE_NAME = 'metah_gdpr_consent';
  private readonly CONSENT_VERSION = '1.0';
  private readonly DATA_RETENTION_DAYS = 2555; // 7 years default

  // Cookie categories and their purposes
  private readonly COOKIE_CATEGORIES = {
    necessary: {
      name: 'Necessary',
      description: 'Essential cookies required for the website to function',
      required: true,
      cookies: ['session', 'csrf_token', 'auth_token', 'language', 'currency']
    },
    analytics: {
      name: 'Analytics',
      description: 'Help us understand how visitors interact with our website',
      required: false,
      cookies: ['_ga', '_gid', '_gat', 'performance_metrics', 'user_timing']
    },
    marketing: {
      name: 'Marketing',
      description: 'Used to track visitors and display relevant advertisements',
      required: false,
      cookies: ['_fbp', '_fbc', 'conversion_tracking', 'retargeting']
    },
    preferences: {
      name: 'Preferences',
      description: 'Remember your preferences and settings',
      required: false,
      cookies: ['theme', 'layout_preference', 'notification_settings']
    }
  };

  // Data categories we collect
  private readonly DATA_CATEGORIES: PersonalDataCategory[] = [
    {
      category: 'Account Information',
      description: 'Basic account details and profile information',
      dataTypes: ['name', 'email', 'phone', 'profile_picture', 'date_of_birth'],
      purposes: ['Account management', 'Service provision', 'Communication'],
      retention: '7 years after account closure',
      legal_basis: 'Contract performance',
      canDelete: true,
      canExport: true
    },
    {
      category: 'Booking Data',
      description: 'Information about your travel bookings and preferences',
      dataTypes: ['booking_history', 'payment_info', 'travel_preferences', 'reviews'],
      purposes: ['Service provision', 'Customer support', 'Service improvement'],
      retention: '7 years for tax and legal requirements',
      legal_basis: 'Contract performance, Legal obligation',
      canDelete: false, // Due to legal requirements
      canExport: true
    },
    {
      category: 'Communication Data',
      description: 'Messages, support tickets, and communication history',
      dataTypes: ['messages', 'support_tickets', 'call_logs', 'email_correspondence'],
      purposes: ['Customer support', 'Service improvement', 'Quality assurance'],
      retention: '3 years',
      legal_basis: 'Legitimate interest',
      canDelete: true,
      canExport: true
    },
    {
      category: 'Usage Analytics',
      description: 'How you use our website and services',
      dataTypes: ['page_views', 'click_tracking', 'search_queries', 'performance_data'],
      purposes: ['Service improvement', 'Performance optimization', 'User experience'],
      retention: '2 years',
      legal_basis: 'Legitimate interest',
      canDelete: true,
      canExport: true
    },
    {
      category: 'Marketing Data',
      description: 'Preferences and data for marketing communications',
      dataTypes: ['marketing_preferences', 'campaign_interactions', 'newsletter_subscriptions'],
      purposes: ['Marketing communications', 'Personalized offers'],
      retention: 'Until withdrawal of consent',
      legal_basis: 'Consent',
      canDelete: true,
      canExport: true
    }
  ];

  // Get current consent status
  getConsent(): GDPRConsent | null {
    const consentCookie = Cookies.get(this.CONSENT_COOKIE_NAME);
    if (!consentCookie) return null;

    try {
      return JSON.parse(consentCookie);
    } catch {
      return null;
    }
  }

  // Save consent preferences
  saveConsent(consent: Omit<GDPRConsent, 'timestamp' | 'version'>): void {
    const fullConsent: GDPRConsent = {
      ...consent,
      timestamp: new Date(),
      version: this.CONSENT_VERSION,
      userAgent: navigator.userAgent
    };

    // Save to cookie (expires in 1 year)
    Cookies.set(this.CONSENT_COOKIE_NAME, JSON.stringify(fullConsent), { 
      expires: 365,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });

    // Save to localStorage for backup
    localStorage.setItem('gdpr_consent_backup', JSON.stringify(fullConsent));

    // Apply consent preferences
    this.applyConsentPreferences(fullConsent);

    // Log consent for audit trail
    this.logConsentEvent('consent_given', fullConsent);
  }

  // Check if consent is required
  isConsentRequired(): boolean {
    const consent = this.getConsent();
    
    // No consent given
    if (!consent) return true;
    
    // Consent version outdated
    if (consent.version !== this.CONSENT_VERSION) return true;
    
    // Consent older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (new Date(consent.timestamp) < oneYearAgo) return true;

    return false;
  }

  // Apply consent preferences to tracking scripts
  private applyConsentPreferences(consent: GDPRConsent): void {
    // Analytics (Google Analytics, etc.)
    if (consent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Marketing (Facebook Pixel, Google Ads, etc.)
    if (consent.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }

    // Preferences cookies
    if (!consent.preferences) {
      this.clearPreferencesCookies();
    }
  }

  private enableAnalytics(): void {
    // Enable Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }

    // Enable performance monitoring
    localStorage.setItem('analytics_enabled', 'true');
  }

  private disableAnalytics(): void {
    // Disable Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    // Clear analytics cookies
    this.clearCookiesByCategory('analytics');
    localStorage.removeItem('analytics_enabled');
  }

  private enableMarketing(): void {
    // Enable marketing cookies
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }

    localStorage.setItem('marketing_enabled', 'true');
  }

  private disableMarketing(): void {
    // Disable marketing cookies
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }

    // Clear marketing cookies
    this.clearCookiesByCategory('marketing');
    localStorage.removeItem('marketing_enabled');
  }

  private clearPreferencesCookies(): void {
    this.clearCookiesByCategory('preferences');
  }

  private clearCookiesByCategory(category: keyof typeof this.COOKIE_CATEGORIES): void {
    const categoryConfig = this.COOKIE_CATEGORIES[category];
    if (!categoryConfig) return;

    categoryConfig.cookies.forEach(cookieName => {
      Cookies.remove(cookieName);
      Cookies.remove(cookieName, { domain: '.metah.travel' });
      Cookies.remove(cookieName, { domain: '.localhost' });
    });
  }

  // Withdraw consent
  withdrawConsent(): void {
    // Clear all non-necessary cookies
    this.clearCookiesByCategory('analytics');
    this.clearCookiesByCategory('marketing');
    this.clearCookiesByCategory('preferences');

    // Update consent cookie
    const consent: GDPRConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date(),
      version: this.CONSENT_VERSION
    };

    this.saveConsent(consent);
    this.logConsentEvent('consent_withdrawn', consent);
  }

  // Data export functionality
  async requestDataExport(userId: string, dataTypes: string[] = []): Promise<DataExportRequest> {
    const exportRequest: DataExportRequest = {
      id: this.generateRequestId(),
      userId,
      requestedAt: new Date(),
      status: 'pending',
      dataTypes: dataTypes.length > 0 ? dataTypes : this.getAllDataTypes()
    };

    // Store request
    this.saveExportRequest(exportRequest);

    // Start processing (in real app, this would be a background job)
    this.processDataExport(exportRequest);

    return exportRequest;
  }

  private async processDataExport(request: DataExportRequest): Promise<void> {
    try {
      request.status = 'processing';
      this.saveExportRequest(request);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Collect user data
      const userData = await this.collectUserData(request.userId, request.dataTypes);

      // Create export file
      const exportData = {
        request_id: request.id,
        user_id: request.userId,
        generated_at: new Date().toISOString(),
        data_categories: request.dataTypes,
        data: userData
      };

      // Create downloadable blob
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);

      // Update request with download URL
      request.status = 'completed';
      request.downloadUrl = url;
      request.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      this.saveExportRequest(request);

      // Notify user (in real app, send email)
      this.notifyUserDataReady(request.userId, request.id);

    } catch (error) {
      request.status = 'failed';
      this.saveExportRequest(request);
      console.error('Data export failed:', error);
    }
  }

  private async collectUserData(userId: string, dataTypes: string[]): Promise<any> {
    const userData: unknown = {};

    // In a real application, this would query various databases and services
    for (const dataType of dataTypes) {
      switch (dataType) {
        case 'Account Information':
          userData.account = this.getAccountData(userId);
          break;
        case 'Booking Data':
          userData.bookings = this.getBookingData(userId);
          break;
        case 'Communication Data':
          userData.communications = this.getCommunicationData(userId);
          break;
        case 'Usage Analytics':
          userData.analytics = this.getAnalyticsData(userId);
          break;
        case 'Marketing Data':
          userData.marketing = this.getMarketingData(userId);
          break;
      }
    }

    return userData;
  }

  private getAccountData(userId: string): any {
    // Mock data - in real app, query user database
    return {
      id: userId,
      email: 'user@example.com',
      name: 'John Doe',
      phone: '+251911234567',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    };
  }

  private getBookingData(userId: string): any {
    // Mock data - in real app, query bookings database
    return [
      {
        id: 'booking_123',
        property_name: 'Luxury Hotel Addis Ababa',
        check_in: '2024-03-15',
        check_out: '2024-03-20',
        amount: 5000,
        currency: 'ETB'
      }
    ];
  }

  private getCommunicationData(userId: string): any {
    return [
      {
        type: 'support_ticket',
        created_at: '2024-02-01T10:00:00Z',
        subject: 'Booking inquiry',
        status: 'resolved'
      }
    ];
  }

  private getAnalyticsData(userId: string): any {
    return {
      page_views: 45,
      last_activity: new Date().toISOString(),
      preferred_language: 'en',
      device_type: 'desktop'
    };
  }

  private getMarketingData(userId: string): any {
    return {
      email_subscribed: true,
      marketing_consent: true,
      campaign_interactions: []
    };
  }

  // Data deletion functionality
  async requestDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest> {
    const deletionRequest: DataDeletionRequest = {
      id: this.generateRequestId(),
      userId,
      requestedAt: new Date(),
      status: 'pending',
      reason,
      dataTypes: this.getDeletableDataTypes(),
      scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days notice
    };

    this.saveDeletionRequest(deletionRequest);
    this.notifyUserDeletionScheduled(userId, deletionRequest);

    return deletionRequest;
  }

  // Cancel data deletion request
  cancelDataDeletion(requestId: string): boolean {
    const requests = this.getDeletionRequests();
    const request = requests.find(r => r.id === requestId);

    if (request && request.status === 'pending') {
      request.status = 'failed'; // Mark as cancelled
      this.saveDeletionRequests(requests);
      return true;
    }

    return false;
  }

  // Get user's privacy settings
  getPrivacySettings(userId: string): PrivacySettings {
    const settings = localStorage.getItem(`privacy_settings_${userId}`);
    if (settings) {
      return JSON.parse(settings);
    }

    // Default privacy settings
    return {
      dataMinimization: true,
      anonymizeData: false,
      autoDeleteAfter: this.DATA_RETENTION_DAYS,
      allowProfiling: false,
      allowMarketing: false,
      allowDataSharing: false,
      preferredLanguage: 'en',
      communicationPreferences: {
        email: true,
        sms: false,
        push: true,
        postal: false
      }
    };
  }

  // Update privacy settings
  updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): void {
    const currentSettings = this.getPrivacySettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    localStorage.setItem(`privacy_settings_${userId}`, JSON.stringify(updatedSettings));
    
    this.logConsentEvent('privacy_settings_updated', { userId, settings: updatedSettings });
  }

  // Get data categories
  getDataCategories(): PersonalDataCategory[] {
    return this.DATA_CATEGORIES;
  }

  // Get cookie categories
  getCookieCategories() {
    return this.COOKIE_CATEGORIES;
  }

  // Utility methods
  private generateRequestId(): string {
    return `req_${  Date.now().toString(36)  }${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAllDataTypes(): string[] {
    return this.DATA_CATEGORIES.map(cat => cat.category);
  }

  private getDeletableDataTypes(): string[] {
    return this.DATA_CATEGORIES.filter(cat => cat.canDelete).map(cat => cat.category);
  }

  private saveExportRequest(request: DataExportRequest): void {
    const requests = this.getExportRequests();
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    
    localStorage.setItem('gdpr_export_requests', JSON.stringify(requests));
  }

  private getExportRequests(): DataExportRequest[] {
    const requests = localStorage.getItem('gdpr_export_requests');
    return requests ? JSON.parse(requests) : [];
  }

  private saveDeletionRequest(request: DataDeletionRequest): void {
    const requests = this.getDeletionRequests();
    requests.push(request);
    this.saveDeletionRequests(requests);
  }

  private getDeletionRequests(): DataDeletionRequest[] {
    const requests = localStorage.getItem('gdpr_deletion_requests');
    return requests ? JSON.parse(requests) : [];
  }

  private saveDeletionRequests(requests: DataDeletionRequest[]): void {
    localStorage.setItem('gdpr_deletion_requests', JSON.stringify(requests));
  }

  private logConsentEvent(event: string, data: unknown): void {
    const log = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-ip' // In real app, get from server
    };

    const logs = JSON.parse(localStorage.getItem('gdpr_audit_log') || '[]');
    logs.push(log);
    
    // Keep only last 1000 events
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('gdpr_audit_log', JSON.stringify(logs));
  }

  private notifyUserDataReady(userId: string, requestId: string): void {
    // In real app, send email notification
    console.log(`Data export ready for user ${userId}, request ${requestId}`);
  }

  private notifyUserDeletionScheduled(userId: string, request: DataDeletionRequest): void {
    // In real app, send email notification
    console.log(`Data deletion scheduled for user ${userId} on ${request.scheduledFor}`);
  }

  // Public API methods
  getUserExportRequests(userId: string): DataExportRequest[] {
    return this.getExportRequests().filter(r => r.userId === userId);
  }

  getUserDeletionRequests(userId: string): DataDeletionRequest[] {
    return this.getDeletionRequests().filter(r => r.userId === userId);
  }

  downloadExportData(requestId: string): void {
    const request = this.getExportRequests().find(r => r.id === requestId);
    if (request && request.downloadUrl) {
      const a = document.createElement('a');
      a.href = request.downloadUrl;
      a.download = `metah-data-export-${request.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // Check if user is from EU (simplified)
  isEUUser(): boolean {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
      'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
      'Europe/Stockholm', 'Europe/Helsinki', 'Europe/Copenhagen', 'Europe/Oslo',
      'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Bucharest'
    ];
    
    return euTimezones.some(tz => timezone.includes(tz.split('/')[1]));
  }
}

// Export singleton instance
export const gdprCompliance = new GDPRComplianceService();

// Helper functions
export function isConsentRequired(): boolean {
  return gdprCompliance.isConsentRequired();
}

export function getCurrentConsent(): GDPRConsent | null {
  return gdprCompliance.getConsent();
}

export function saveUserConsent(consent: Omit<GDPRConsent, 'timestamp' | 'version'>): void {
  gdprCompliance.saveConsent(consent);
}

export function requestUserDataExport(userId: string): Promise<DataExportRequest> {
  return gdprCompliance.requestDataExport(userId);
}

export function requestUserDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest> {
  return gdprCompliance.requestDataDeletion(userId, reason);
}
