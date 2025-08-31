// Two-Factor Authentication Service
// Supports SMS OTP, Email OTP, and TOTP (Google Authenticator)

// Avoid bundling Node-only 'speakeasy' in the browser. We'll dynamically import it only in non-browser envs.
let speakeasy: any = null;
import QRCode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface OTPVerificationResult {
  success: boolean;
  message: string;
  token?: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

export interface TwoFactorSettings {
  enabled: boolean;
  methods: {
    totp: boolean;
    sms: boolean;
    email: boolean;
  };
  backupCodes: BackupCode[];
  totpSecret?: string;
  phoneNumber?: string;
  recoveryEmail?: string;
}

class TwoFactorAuthService {
  private readonly APP_NAME = 'METAH Travel';
  private readonly ISSUER = 'metah.travel';

  // Generate TOTP secret and QR code
  async generateTOTPSecret(userEmail: string): Promise<TwoFactorSetup> {
    // Attempt to load speakeasy only in non-browser environments
    if (!speakeasy && typeof window === 'undefined') {
      const mod = await import('speakeasy');
      speakeasy = mod as unknown as typeof speakeasy;
    }

    if (!speakeasy) {
      throw new Error('Two-factor authentication (TOTP) is not available in this build');
    }
    
    const secret = speakeasy.generateSecret({
      name: `${this.APP_NAME} (${userEmail})`,
      issuer: this.ISSUER,
      length: 32
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32!
    };
  }

  // Verify TOTP code
  verifyTOTP(token: string, secret: string, window = 2): boolean {
    if (!speakeasy) {
      return false;
    }
    
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    });
  }

  // Whether TOTP is supported in this build/environment
  supportsTOTP(): boolean {
    return typeof window === 'undefined';
  }

  // Generate backup codes
  generateBackupCodes(count = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Generate SMS OTP
  generateSMSOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate Email OTP
  generateEmailOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send SMS OTP (mock implementation - integrate with Twilio/AWS SNS)
  async sendSMSOTP(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // In production, integrate with SMS service
      console.log(`SMS OTP: ${code} sent to ${phoneNumber}`);
      
      // Store OTP for verification (with expiration)
      const otpData = {
        code,
        phoneNumber,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0
      };
      
      localStorage.setItem(`sms_otp_${phoneNumber}`, JSON.stringify(otpData));
      
      // Mock SMS service integration
      if (typeof window !== 'undefined') {
        // Show mock SMS notification for demo
        this.showMockSMSNotification(phoneNumber, code);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS OTP:', error);
      return false;
    }
  }

  // Send Email OTP
  async sendEmailOTP(email: string, code: string): Promise<boolean> {
    try {
      // Store OTP for verification
      const otpData = {
        code,
        email,
        timestamp: Date.now(),
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0
      };
      
      localStorage.setItem(`email_otp_${email}`, JSON.stringify(otpData));
      
      // Use existing email service
      const { emailService } = await import('./emailService');
      
      const emailSent = await emailService.sendEmail('template_2fa_otp', {
        to_email: email,
        to_name: 'User',
        from_name: 'METAH Travel Security',
        otp_code: code,
        expires_in: '10 minutes',
        security_notice: 'If you did not request this code, please contact support immediately.'
      });

      return emailSent;
    } catch (error) {
      console.error('Failed to send Email OTP:', error);
      return false;
    }
  }

  // Verify SMS OTP
  verifySMSOTP(phoneNumber: string, code: string): OTPVerificationResult {
    try {
      const storedData = localStorage.getItem(`sms_otp_${phoneNumber}`);
      if (!storedData) {
        return { success: false, message: 'No OTP found for this phone number' };
      }

      const otpData = JSON.parse(storedData);
      
      // Check expiration
      if (Date.now() > otpData.expires) {
        localStorage.removeItem(`sms_otp_${phoneNumber}`);
        return { success: false, message: 'OTP has expired' };
      }

      // Check attempts
      if (otpData.attempts >= 3) {
        localStorage.removeItem(`sms_otp_${phoneNumber}`);
        return { success: false, message: 'Too many failed attempts' };
      }

      // Verify code
      if (otpData.code === code) {
        localStorage.removeItem(`sms_otp_${phoneNumber}`);
        return { 
          success: true, 
          message: 'SMS OTP verified successfully',
          token: this.generateVerificationToken()
        };
      } else {
        // Increment attempts
        otpData.attempts++;
        localStorage.setItem(`sms_otp_${phoneNumber}`, JSON.stringify(otpData));
        return { 
          success: false, 
          message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining` 
        };
      }
    } catch (error) {
      return { success: false, message: 'Error verifying SMS OTP' };
    }
  }


  // Get user's 2FA settings
  getUserTwoFactorSettings(userId: string): TwoFactorSettings {
    const settings = localStorage.getItem(`2fa_settings_${userId}`);
    if (settings) {
      return JSON.parse(settings);
    }

    // Default settings
    return {
      enabled: false,
      methods: {
        totp: false,
        sms: false,
        email: false
      },
      backupCodes: []
    };
  }

  // Save user's 2FA settings
  saveUserTwoFactorSettings(userId: string, settings: TwoFactorSettings): void {
    localStorage.setItem(`2fa_settings_${userId}`, JSON.stringify(settings));
  }

  // Enable 2FA for user
  async enableTwoFactor(userId: string, method: 'totp' | 'sms' | 'email', config: Record<string, unknown>): Promise<TwoFactorSetup | boolean> {
    const settings = this.getUserTwoFactorSettings(userId);
    
    if (method === 'totp') {
      const setup = await this.generateTOTPSecret(config.email);
      settings.totpSecret = setup.secret;
      settings.methods.totp = true;
      settings.enabled = true;
      settings.backupCodes = setup.backupCodes.map(code => ({
        code,
        used: false
      }));
      
      this.saveUserTwoFactorSettings(userId, settings);
      return setup;
    } else if (method === 'sms') {
      settings.phoneNumber = config.phoneNumber;
      settings.methods.sms = true;
      settings.enabled = true;
      
      this.saveUserTwoFactorSettings(userId, settings);
      return true;
    } else if (method === 'email') {
      settings.recoveryEmail = config.email;
      settings.methods.email = true;
      settings.enabled = true;
      
      this.saveUserTwoFactorSettings(userId, settings);
      return true;
    }

    return false;
  }

  // Disable 2FA for user
  disableTwoFactor(userId: string): void {
    const settings = this.getUserTwoFactorSettings(userId);
    settings.enabled = false;
    settings.methods = { totp: false, sms: false, email: false };
    
    this.saveUserTwoFactorSettings(userId, settings);
  }

  // Check if 2FA is required for user
  isTwoFactorRequired(userId: string): boolean {
    const settings = this.getUserTwoFactorSettings(userId);
    return settings.enabled && (settings.methods.totp || settings.methods.sms || settings.methods.email);
  }

  // Generate verification token
  generateVerificationToken(): string {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36),
      verified: true
    }));
  }

  // Verify Email OTP
  verifyEmailOTP(email: string, code: string): OTPVerificationResult {
    try {
      const storedData = localStorage.getItem(`email_otp_${email}`);
      if (!storedData) {
        return { success: false, message: 'No OTP found for this email address' };
      }

      const otpData = JSON.parse(storedData);
      
      // Check expiration
      if (Date.now() > otpData.expires) {
        localStorage.removeItem(`email_otp_${email}`);
        return { success: false, message: 'OTP has expired' };
      }

      // Check attempts
      if (otpData.attempts >= 3) {
        localStorage.removeItem(`email_otp_${email}`);
        return { success: false, message: 'Too many failed attempts' };
      }

      // Verify code
      if (otpData.code === code) {
        localStorage.removeItem(`email_otp_${email}`);
        return { 
          success: true, 
          message: 'Email OTP verified successfully',
          token: this.generateVerificationToken()
        };
      } else {
        // Increment attempts
        otpData.attempts++;
        localStorage.setItem(`email_otp_${email}`, JSON.stringify(otpData));
        return { 
          success: false, 
          message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining` 
        };
      }
    } catch (error) {
      return { success: false, message: 'Failed to verify email OTP' };
    }
  }

  // Verify Backup Code
  verifyBackupCode(userId: string, code: string): OTPVerificationResult {
    const settings = this.getUserTwoFactorSettings(userId);
    const backupCode = settings.backupCodes.find(bc => bc.code === code.toUpperCase() && !bc.used);
    
    if (!backupCode) {
      return { success: false, message: 'Invalid or already used backup code' };
    }
    
    // Mark backup code as used
    backupCode.used = true;
    backupCode.usedAt = new Date();
    
    this.saveUserTwoFactorSettings(userId, settings);
    
    return {
      success: true,
      message: 'Backup code verified successfully',
      token: this.generateVerificationToken()
    };
  }

  // Verify 2FA token
  verifyTwoFactorToken(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token));
      const age = Date.now() - decoded.timestamp;
      
      // Token valid for 5 minutes
      return decoded.verified && age < 5 * 60 * 1000;
    } catch (error) {
      return false;
    }
  }

  // Show mock SMS notification for demo
  private showMockSMSNotification(phoneNumber: string, code: string): void {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">📱 SMS Received</div>
      <div style="font-size: 14px; opacity: 0.9;">
        To: ${phoneNumber}<br>
        Your METAH Travel verification code: <strong>${code}</strong><br>
        Valid for 5 minutes.
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 8000);
  }

  // Get available 2FA methods for user
  getAvailableMethods(userId: string): string[] {
    const settings = this.getUserTwoFactorSettings(userId);
    const methods = [];
    
    if (settings.methods.totp) methods.push('totp');
    if (settings.methods.sms) methods.push('sms');
    if (settings.methods.email) methods.push('email');
    if (settings.backupCodes.some(bc => !bc.used)) methods.push('backup');
    
    return methods;
  }

  // Emergency disable 2FA (admin function)
  emergencyDisable(userId: string, adminToken: string): boolean {
    // In production, verify admin token
    if (adminToken === 'emergency_admin_token') {
      this.disableTwoFactor(userId);
      
      // Log security event
      // Note: In production, import logSecurityEvent at the top of the file
      // import { logSecurityEvent } from './securityService';
      // logSecurityEvent('unauthorized_access', {
      //   action: 'emergency_2fa_disable',
      //   userId,
      //   adminAction: true
      // }, 'high');
      
      console.log('2FA emergency disabled for user:', userId);
      
      return true;
    }
    return false;
  }

  // Get 2FA status for user
  getTwoFactorStatus(userId: string): {
    enabled: boolean;
    methods: string[];
    backupCodesRemaining: number;
    lastUsed?: Date;
  } {
    const settings = this.getUserTwoFactorSettings(userId);
    
    return {
      enabled: settings.enabled,
      methods: this.getAvailableMethods(userId),
      backupCodesRemaining: settings.backupCodes.filter(bc => !bc.used).length,
      lastUsed: settings.backupCodes
        .filter(bc => bc.used && bc.usedAt)
        .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())[0]?.usedAt
    };
  }
}

// Export singleton instance
export const twoFactorAuth = new TwoFactorAuthService();

// Helper functions
export async function setupTOTP(userId: string, email: string): Promise<TwoFactorSetup> {
  return twoFactorAuth.enableTwoFactor(userId, 'totp', { email }) as Promise<TwoFactorSetup>;
}

export function verifyTOTPCode(token: string, secret: string): boolean {
  return twoFactorAuth.verifyTOTP(token, secret);
}

export async function sendSMSCode(phoneNumber: string): Promise<boolean> {
  const code = twoFactorAuth.generateSMSOTP();
  return twoFactorAuth.sendSMSOTP(phoneNumber, code);
}

export async function sendEmailCode(email: string): Promise<boolean> {
  const code = twoFactorAuth.generateEmailOTP();
  return twoFactorAuth.sendEmailOTP(email, code);
}

export function requiresTwoFactor(userId: string): boolean {
  return twoFactorAuth.isTwoFactorRequired(userId);
}
