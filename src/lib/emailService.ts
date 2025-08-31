// Email Service Implementation using EmailJS (free service)
// This provides real email sending capabilities without backend requirements

import emailjs from '@emailjs/browser';

// EmailJS configuration - get these from https://emailjs.com
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_metah_travel',
  TEMPLATE_IDS: {
    EMAIL_VERIFICATION: import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE || 'template_verification',
    PASSWORD_RESET: import.meta.env.VITE_EMAILJS_PASSWORD_RESET_TEMPLATE || 'template_password_reset',
    BOOKING_CONFIRMATION: import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE || 'template_booking',
    WELCOME: import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE || 'template_welcome',
    HOST_APPLICATION: import.meta.env.VITE_EMAILJS_HOST_APPLICATION_TEMPLATE || 'template_host_app',
    BOOKING_UPDATE: import.meta.env.VITE_EMAILJS_BOOKING_UPDATE_TEMPLATE || 'template_booking_update',
  },
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key_here'
};

export interface EmailTemplate {
  to_email: string;
  to_name: string;
  from_name: string;
  [key: string]: string | number;
}

export interface VerificationEmailData extends EmailTemplate {
  verification_link: string;
  verification_code: string;
}

export interface BookingConfirmationData extends EmailTemplate {
  booking_id: string;
  property_name: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: string;
  guest_count: string;
  host_name: string;
  property_address: string;
}

export interface PasswordResetData extends EmailTemplate {
  reset_link: string;
  reset_code: string;
  expires_in: string;
}

export interface WelcomeEmailData extends EmailTemplate {
  user_name: string;
  platform_benefits: string;
}

export interface HostApplicationData extends EmailTemplate {
  applicant_name: string;
  property_title: string;
  application_status: string;
  next_steps: string;
}

class EmailService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      this.initialized = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  private async sendEmail(templateId: string, templateData: EmailTemplate): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateId,
        templateData
      );

      if (result.status === 200) {
        console.log('✅ Email sent successfully:', result);
        return true;
      } else {
        console.error('❌ Email sending failed:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Email service error:', error);
      
      // Fallback: Store email in localStorage for development
      this.storeFallbackEmail(templateId, templateData);
      return false;
    }
  }

  private storeFallbackEmail(templateId: string, data: EmailTemplate): void {
    const fallbackEmails = JSON.parse(localStorage.getItem('fallback_emails') || '[]');
    fallbackEmails.push({
      id: Date.now().toString(),
      templateId,
      data,
      timestamp: new Date().toISOString(),
      status: 'fallback'
    });
    localStorage.setItem('fallback_emails', JSON.stringify(fallbackEmails));
    console.log('📧 Email stored in fallback system');
  }

  async sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean> {
    const verificationLink = `${window.location.origin}/verify-email?token=${verificationCode}`;
    
    const emailData: VerificationEmailData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      verification_link: verificationLink,
      verification_code: verificationCode
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.EMAIL_VERIFICATION, emailData);
  }

  async sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean> {
    const resetLink = `${window.location.origin}/reset-password?token=${resetCode}`;
    
    const emailData: PasswordResetData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      reset_link: resetLink,
      reset_code: resetCode,
      expires_in: '24 hours'
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.PASSWORD_RESET, emailData);
  }

  async sendBookingConfirmation(
    email: string, 
    name: string, 
    bookingDetails: {
      bookingId: string;
      propertyName: string;
      checkIn: string;
      checkOut: string;
      totalAmount: number;
      currency: string;
      guestCount: number;
      hostName: string;
      propertyAddress: string;
    }
  ): Promise<boolean> {
    const emailData: BookingConfirmationData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      booking_id: bookingDetails.bookingId,
      property_name: bookingDetails.propertyName,
      check_in_date: new Date(bookingDetails.checkIn).toLocaleDateString(),
      check_out_date: new Date(bookingDetails.checkOut).toLocaleDateString(),
      total_amount: `${bookingDetails.currency} ${bookingDetails.totalAmount.toLocaleString()}`,
      guest_count: bookingDetails.guestCount.toString(),
      host_name: bookingDetails.hostName,
      property_address: bookingDetails.propertyAddress
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.BOOKING_CONFIRMATION, emailData);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const emailData: WelcomeEmailData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      user_name: name,
      platform_benefits: 'Book authentic Ethiopian accommodations, Connect with local hosts, Experience Ethiopian culture'
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.WELCOME, emailData);
  }

  async sendHostApplicationUpdate(
    email: string, 
    name: string, 
    applicationDetails: {
      propertyTitle: string;
      status: 'approved' | 'rejected' | 'pending';
      nextSteps: string;
    }
  ): Promise<boolean> {
    const emailData: HostApplicationData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      applicant_name: name,
      property_title: applicationDetails.propertyTitle,
      application_status: applicationDetails.status,
      next_steps: applicationDetails.nextSteps
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.HOST_APPLICATION, emailData);
  }

  async sendBookingUpdateEmail(
    email: string,
    name: string,
    bookingId: string,
    updateType: 'confirmed' | 'cancelled' | 'modified',
    details: string
  ): Promise<boolean> {
    const emailData = {
      to_email: email,
      to_name: name,
      from_name: 'METAH Travel Team',
      booking_id: bookingId,
      update_type: updateType,
      update_details: details,
      action_required: updateType === 'modified' ? 'Please review your booking details' : 'No action required'
    };

    return this.sendEmail(EMAILJS_CONFIG.TEMPLATE_IDS.BOOKING_UPDATE, emailData);
  }

  // Utility methods
  generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  generateResetCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get fallback emails for development/testing
  getFallbackEmails(): Array<{
    id: string;
    templateId: string;
    data: EmailTemplate;
    timestamp: string;
    status: string;
  }> {
    return JSON.parse(localStorage.getItem('fallback_emails') || '[]');
  }

  clearFallbackEmails(): void {
    localStorage.removeItem('fallback_emails');
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Helper functions for common use cases
export async function sendVerificationEmail(email: string, name: string): Promise<boolean> {
  const code = emailService.generateVerificationCode();
  
  // Store verification code for later validation
  const verificationCodes = JSON.parse(localStorage.getItem('verification_codes') || '{}');
  verificationCodes[email] = {
    code,
    timestamp: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  localStorage.setItem('verification_codes', JSON.stringify(verificationCodes));
  
  return emailService.sendVerificationEmail(email, name, code);
}

export async function sendPasswordResetEmail(email: string, name: string): Promise<boolean> {
  const code = emailService.generateResetCode();
  
  // Store reset code for later validation
  const resetCodes = JSON.parse(localStorage.getItem('reset_codes') || '{}');
  resetCodes[email] = {
    code,
    timestamp: Date.now(),
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  };
  localStorage.setItem('reset_codes', JSON.stringify(resetCodes));
  
  return emailService.sendPasswordResetEmail(email, name, code);
}

export function verifyEmailToken(email: string, token: string): boolean {
  const verificationCodes = JSON.parse(localStorage.getItem('verification_codes') || '{}');
  const storedData = verificationCodes[email];
  
  if (!storedData) return false;
  if (Date.now() > storedData.expires) return false;
  if (storedData.code !== token) return false;
  
  // Mark as verified and remove code
  delete verificationCodes[email];
  localStorage.setItem('verification_codes', JSON.stringify(verificationCodes));
  
  return true;
}

export function verifyResetToken(email: string, token: string): boolean {
  const resetCodes = JSON.parse(localStorage.getItem('reset_codes') || '{}');
  const storedData = resetCodes[email];
  
  if (!storedData) return false;
  if (Date.now() > storedData.expires) return false;
  if (storedData.code !== token) return false;
  
  return true;
}

export function consumeResetToken(email: string, token: string): boolean {
  if (!verifyResetToken(email, token)) return false;
  
  // Remove the used token
  const resetCodes = JSON.parse(localStorage.getItem('reset_codes') || '{}');
  delete resetCodes[email];
  localStorage.setItem('reset_codes', JSON.stringify(resetCodes));
  
  return true;
}

// Development helper - simulate email sending delay
export async function simulateEmailDelay(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
}
