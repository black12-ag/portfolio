// Advanced Security Service
// Handles rate limiting, audit logging, session management, and security monitoring

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'email_verification' | 
        'booking_created' | 'payment_processed' | 'data_access' | 'suspicious_activity' |
        'rate_limit_exceeded' | 'unauthorized_access' | 'data_export' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, unknown>;
  timestamp: Date;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  resolved: boolean;
  notes?: string;
}

export interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | '*';
  windowMs: number; // Time window in milliseconds
  maxAttempts: number;
  blockDurationMs: number; // How long to block after exceeding limit
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: unknown) => string;
}

export interface SecuritySettings {
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // Days
    preventReuse: number; // Number of previous passwords to check
  };
  session: {
    maxDuration: number; // Minutes
    extendOnActivity: boolean;
    maxConcurrentSessions: number;
    requireReauthForSensitive: boolean;
  };
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: ('sms' | 'email' | 'totp' | 'backup_codes')[];
  };
  monitoring: {
    logAllRequests: boolean;
    alertOnSuspiciousActivity: boolean;
    geoLocationTracking: boolean;
    deviceFingerprinting: boolean;
  };
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  ip: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: {
    country: string;
    city: string;
  };
  isActive: boolean;
}

export interface DeviceFingerprint {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
}

class SecurityService {
  private events: Map<string, SecurityEvent> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  private sessions: Map<string, Session> = new Map();
  private settings: SecuritySettings;
  private rules: Map<string, RateLimitRule> = new Map();
  private bannedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, number> = new Map();

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadData();
    this.setupDefaultRules();
    this.startCleanupTasks();
  }

  private getDefaultSettings(): SecuritySettings {
    return {
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      session: {
        maxDuration: 480, // 8 hours
        extendOnActivity: true,
        maxConcurrentSessions: 3,
        requireReauthForSensitive: true
      },
      twoFactor: {
        enabled: true,
        required: false,
        methods: ['email', 'sms']
      },
      monitoring: {
        logAllRequests: true,
        alertOnSuspiciousActivity: true,
        geoLocationTracking: true,
        deviceFingerprinting: true
      }
    };
  }

  private loadData(): void {
    // Load security events
    const savedEvents = localStorage.getItem('security_events');
    if (savedEvents) {
      const eventsData = JSON.parse(savedEvents);
      for (const event of eventsData) {
        this.events.set(event.id, {
          ...event,
          timestamp: new Date(event.timestamp)
        });
      }
    }

    // Load active sessions
    const savedSessions = localStorage.getItem('security_sessions');
    if (savedSessions) {
      const sessionsData = JSON.parse(savedSessions);
      for (const session of sessionsData) {
        this.sessions.set(session.id, {
          ...session,
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
          expiresAt: new Date(session.expiresAt)
        });
      }
    }

    // Load banned IPs
    const savedBannedIPs = localStorage.getItem('banned_ips');
    if (savedBannedIPs) {
      this.bannedIPs = new Set(JSON.parse(savedBannedIPs));
    }
  }

  private saveData(): void {
    // Save events (keep only last 1000)
    const eventsArray = Array.from(this.events.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 1000);
    localStorage.setItem('security_events', JSON.stringify(eventsArray));

    // Save active sessions
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isActive && session.expiresAt > new Date());
    localStorage.setItem('security_sessions', JSON.stringify(activeSessions));

    // Save banned IPs
    localStorage.setItem('banned_ips', JSON.stringify(Array.from(this.bannedIPs)));
  }

  private setupDefaultRules(): void {
    const defaultRules: RateLimitRule[] = [
      {
        id: 'login_attempts',
        name: 'Login Attempts',
        endpoint: '/api/auth/login',
        method: 'POST',
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5,
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
        skipSuccessfulRequests: true
      },
      {
        id: 'password_reset',
        name: 'Password Reset',
        endpoint: '/api/auth/reset-password',
        method: 'POST',
        windowMs: 60 * 60 * 1000, // 1 hour
        maxAttempts: 3,
        blockDurationMs: 60 * 60 * 1000 // 1 hour
      },
      {
        id: 'registration',
        name: 'User Registration',
        endpoint: '/api/auth/register',
        method: 'POST',
        windowMs: 60 * 60 * 1000, // 1 hour
        maxAttempts: 3,
        blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
      },
      {
        id: 'api_general',
        name: 'General API',
        endpoint: '/api/*',
        method: '*',
        windowMs: 60 * 1000, // 1 minute
        maxAttempts: 100,
        blockDurationMs: 5 * 60 * 1000 // 5 minutes
      },
      {
        id: 'search_requests',
        name: 'Search Requests',
        endpoint: '/api/search',
        method: 'GET',
        windowMs: 60 * 1000, // 1 minute
        maxAttempts: 30,
        blockDurationMs: 2 * 60 * 1000 // 2 minutes
      }
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  private startCleanupTasks(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);

    // Clean up old rate limit entries every hour
    setInterval(() => {
      this.cleanupRateLimits();
    }, 60 * 60 * 1000);

    // Save data every 10 minutes
    setInterval(() => {
      this.saveData();
    }, 10 * 60 * 1000);
  }

  // Rate Limiting
  checkRateLimit(endpoint: string, method: string, ip: string): { allowed: boolean; retryAfter?: number } {
    if (this.bannedIPs.has(ip)) {
      return { allowed: false, retryAfter: Infinity };
    }

    const applicableRules = Array.from(this.rules.values()).filter(rule => {
      return (rule.method === '*' || rule.method === method) &&
             this.matchesEndpoint(endpoint, rule.endpoint);
    });

    for (const rule of applicableRules) {
      const key = `${rule.id}:${ip}`;
      const now = Date.now();
      let limitData = this.rateLimits.get(key);

      if (!limitData) {
        limitData = { count: 0, resetTime: now + rule.windowMs, blocked: false };
        this.rateLimits.set(key, limitData);
      }

      // Reset if window has expired
      if (now > limitData.resetTime) {
        limitData.count = 0;
        limitData.resetTime = now + rule.windowMs;
        limitData.blocked = false;
      }

      // Check if currently blocked
      if (limitData.blocked) {
        const blockEndTime = limitData.resetTime + rule.blockDurationMs;
        if (now < blockEndTime) {
          return { allowed: false, retryAfter: Math.ceil((blockEndTime - now) / 1000) };
        } else {
          limitData.blocked = false;
          limitData.count = 0;
          limitData.resetTime = now + rule.windowMs;
        }
      }

      // Increment count
      limitData.count++;

      // Check if limit exceeded
      if (limitData.count > rule.maxAttempts) {
        limitData.blocked = true;
        
        // Log security event
        this.logEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          ip,
          details: {
            rule: rule.name,
            endpoint,
            method,
            attempts: limitData.count
          }
        });

        // Track suspicious IP
        this.trackSuspiciousIP(ip);

        return { 
          allowed: false, 
          retryAfter: Math.ceil(rule.blockDurationMs / 1000) 
        };
      }
    }

    return { allowed: true };
  }

  private matchesEndpoint(endpoint: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return endpoint.startsWith(pattern.slice(0, -1));
    }
    return endpoint === pattern;
  }

  private trackSuspiciousIP(ip: string): void {
    const count = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, count + 1);

    // Ban IP if too many rate limit violations
    if (count + 1 >= 5) {
      this.bannedIPs.add(ip);
      this.logEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ip,
        details: {
          action: 'ip_banned',
          violations: count + 1
        }
      });
    }
  }

  // Security Event Logging
  logEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'userAgent' | 'resolved'>): SecurityEvent {
    const event: SecurityEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      resolved: false,
      ...eventData
    };

    this.events.set(event.id, event);

    // Alert on high/critical severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.alertSecurityTeam(event);
    }

    this.saveData();
    return event;
  }

  private alertSecurityTeam(event: SecurityEvent): void {
    // In a real app, this would send alerts to security team
    console.warn('🚨 Security Alert:', event);
    
    // Could integrate with services like:
    // - Slack notifications
    // - Email alerts
    // - PagerDuty
    // - SMS alerts
  }

  // Session Management
  createSession(userId: string, ip: string): Session {
    const sessionId = this.generateSecureToken();
    const now = new Date();
    
    const session: Session = {
      id: sessionId,
      userId,
      token: this.generateSecureToken(),
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + this.settings.session.maxDuration * 60 * 1000),
      ip,
      userAgent: navigator.userAgent,
      deviceFingerprint: this.generateDeviceFingerprint(),
      isActive: true
    };

    // Enforce concurrent session limit
    this.enforceConcurrentSessionLimit(userId);

    this.sessions.set(sessionId, session);
    this.saveData();

    this.logEvent({
      type: 'login',
      severity: 'low',
      userId,
      sessionId,
      ip,
      details: {
        deviceFingerprint: session.deviceFingerprint
      }
    });

    return session;
  }

  validateSession(sessionId: string, ip: string): { valid: boolean; session?: Session; reason?: string } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session inactive' };
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      this.saveData();
      return { valid: false, reason: 'Session expired' };
    }

    // Check IP consistency (optional - could be disabled for mobile users)
    if (this.settings.monitoring.geoLocationTracking && session.ip !== ip) {
      this.logEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        userId: session.userId,
        sessionId,
        ip,
        details: {
          action: 'ip_change',
          originalIp: session.ip,
          newIp: ip
        }
      });
    }

    // Extend session if configured
    if (this.settings.session.extendOnActivity) {
      session.lastActivity = new Date();
      session.expiresAt = new Date(Date.now() + this.settings.session.maxDuration * 60 * 1000);
    }

    this.saveData();
    return { valid: true, session };
  }

  terminateSession(sessionId: string, reason = 'user_logout'): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      
      this.logEvent({
        type: 'logout',
        severity: 'low',
        userId: session.userId,
        sessionId,
        ip: session.ip,
        details: { reason }
      });
    }
    
    this.saveData();
  }

  terminateAllUserSessions(userId: string, exceptSessionId?: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && sessionId !== exceptSessionId) {
        session.isActive = false;
      }
    }
    
    this.logEvent({
      type: 'logout',
      severity: 'medium',
      userId,
      ip: 'system',
      details: { 
        action: 'terminate_all_sessions',
        exceptSession: exceptSessionId 
      }
    });
    
    this.saveData();
  }

  private enforceConcurrentSessionLimit(userId: string): void {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    // Terminate oldest sessions if limit exceeded
    if (userSessions.length >= this.settings.session.maxConcurrentSessions) {
      const sessionsToTerminate = userSessions.slice(this.settings.session.maxConcurrentSessions - 1);
      for (const session of sessionsToTerminate) {
        session.isActive = false;
      }
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now || !session.isActive) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      this.saveData();
    }
  }

  private cleanupRateLimits(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, limitData] of this.rateLimits.entries()) {
      if (now > limitData.resetTime + 24 * 60 * 60 * 1000) { // Keep for 24 hours
        this.rateLimits.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old rate limit entries`);
    }
  }

  // Password Security
  validatePassword(password: string, userId?: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const settings = this.settings.password;

    if (password.length < settings.minLength) {
      errors.push(`Password must be at least ${settings.minLength} characters long`);
    }

    if (settings.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (settings.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (settings.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (settings.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('This password is too common. Please choose a more unique password');
    }

    // Check password history (if userId provided)
    if (userId && this.isPasswordReused(userId, password)) {
      errors.push(`Password cannot be one of your last ${settings.preventReuse} passwords`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  private isPasswordReused(userId: string, password: string): boolean {
    // In a real app, this would check against stored password hashes
    // For now, just return false
    return false;
  }

  // Device Fingerprinting
  private generateDeviceFingerprint(): string {
    const fingerprint: DeviceFingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      canvasFingerprint: this.getCanvasFingerprint(),
      webglFingerprint: this.getWebGLFingerprint(),
      audioFingerprint: this.getAudioFingerprint()
    };

    return btoa(JSON.stringify(fingerprint)).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      
      return canvas.toDataURL().slice(-50);
    } catch (error) {
      return 'canvas-error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      
      return btoa(`${vendor}-${renderer}`).slice(-20);
    } catch (error) {
      return 'webgl-error';
    }
  }

  private getAudioFingerprint(): string {
    // Simplified audio fingerprinting
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioContext.sampleRate.toString();
    } catch (error) {
      return 'audio-error';
    }
  }

  // Utility Methods
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Public API Methods
  getSecurityEvents(filters?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let events = Array.from(this.events.values());

    if (filters) {
      if (filters.type) events = events.filter(e => e.type === filters.type);
      if (filters.severity) events = events.filter(e => e.severity === filters.severity);
      if (filters.userId) events = events.filter(e => e.userId === filters.userId);
      if (filters.startDate) events = events.filter(e => e.timestamp >= filters.startDate);
      if (filters.endDate) events = events.filter(e => e.timestamp <= filters.endDate);
    }

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return events.slice(0, filters?.limit || 100);
  }

  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  getSecuritySettings(): SecuritySettings {
    return { ...this.settings };
  }

  updateSecuritySettings(updates: Partial<SecuritySettings>): void {
    this.settings = { ...this.settings, ...updates };
    localStorage.setItem('security_settings', JSON.stringify(this.settings));
  }

  banIP(ip: string, reason: string): void {
    this.bannedIPs.add(ip);
    this.logEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip,
      details: {
        action: 'manual_ip_ban',
        reason
      }
    });
    this.saveData();
  }

  unbanIP(ip: string): void {
    this.bannedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
    this.saveData();
  }

  getBannedIPs(): string[] {
    return Array.from(this.bannedIPs);
  }

  getSuspiciousIPs(): Array<{ ip: string; violations: number }> {
    return Array.from(this.suspiciousIPs.entries())
      .map(([ip, violations]) => ({ ip, violations }))
      .sort((a, b) => b.violations - a.violations);
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Helper functions
export function isPasswordStrong(password: string): boolean {
  return securityService.validatePassword(password).valid;
}

export function checkRateLimit(endpoint: string, method = 'GET'): boolean {
  const ip = 'client-ip'; // In real app, this would be the actual client IP
  return securityService.checkRateLimit(endpoint, method, ip).allowed;
}

export function logSecurityEvent(
  type: SecurityEvent['type'], 
  details: Record<string, unknown>,
  severity: SecurityEvent['severity'] = 'low'
): void {
  securityService.logEvent({
    type,
    severity,
    ip: 'client-ip',
    details
  });
}
