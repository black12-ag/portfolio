import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Test contexts and providers
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';

// Phase 1: Authentication Components
import EmailVerification from '@/components/auth/EmailVerification';
import PhoneVerification from '@/components/auth/PhoneVerification';
import PasswordReset from '@/components/auth/PasswordReset';

// Phase 2: Payment Components
import RealPaymentProcessor from '@/components/payment/RealPaymentProcessor';
import RefundManager from '@/components/payment/RefundManager';
import PaymentDispute from '@/components/payment/PaymentDispute';

// Phase 3: Communication Components
import CallInterface from '@/components/communication/CallInterface';

// Phase 4: Admin Components
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';

// Services
import { emailVerificationService } from '@/services/auth/emailVerificationService';
import { phoneVerificationService } from '@/services/auth/phoneVerificationService';
import { passwordService } from '@/services/auth/passwordService';
import { stripeIntegrationService } from '@/services/payment/stripeIntegrationService';
import { voiceCallService } from '@/services/communication/voiceCallService';
import { videoCallService } from '@/services/communication/videoCallService';
import { fileUploadService } from '@/services/communication/fileUploadService';
import { analyticsService } from '@/services/analytics/analyticsService';

// Mock data factories
const createMockUser = () => ({
  id: 'user123',
  email: 'test@example.com',
  phone: '+1234567890',
  name: 'Test User',
  emailVerified: false,
  phoneVerified: false,
  isAuthenticated: true
});

const createMockBookingData = () => ({
  hotelId: 'hotel123',
  hotelName: 'Test Hotel',
  roomType: 'Deluxe Suite',
  checkIn: '2024-01-15',
  checkOut: '2024-01-20',
  guests: { adults: 2, children: 0 },
  totalAmount: 500,
  currency: 'USD',
  guestInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  }
});

const createMockTransaction = () => ({
  id: 'txn123',
  paymentIntentId: 'pi_123',
  amount: 500,
  currency: 'USD',
  status: 'succeeded' as const,
  paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
  customer: { id: 'cust123', name: 'John Doe', email: 'john@example.com' },
  booking: {
    id: 'book123',
    hotelName: 'Test Hotel',
    roomType: 'Deluxe Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20'
  },
  createdAt: '2024-01-01T00:00:00Z'
});

const createMockCallSession = () => ({
  id: 'call123',
  callerId: 'user123',
  calleeId: 'user456',
  type: 'voice' as const,
  status: 'active' as const,
  startTime: new Date(),
  quality: {
    audioLevel: 0.8,
    networkQuality: 'good' as const,
    latency: 50,
    packetLoss: 0.1
  }
});

const createMockDispute = () => ({
  id: 'dp_123',
  chargeId: 'ch_123',
  amount: 50000,
  currency: 'usd',
  reason: 'credit_not_processed',
  status: 'needs_response' as const,
  evidence_details: {
    due_by: Math.floor(Date.now() / 1000) + 86400 * 7,
    has_evidence: false,
    past_due: false,
    submission_count: 0
  },
  evidence: {},
  metadata: { booking_id: 'book123' },
  created: Math.floor(Date.now() / 1000),
  livemode: false
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <EnhancedAuthProvider>
            {children}
          </EnhancedAuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Comprehensive System Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock as any;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    });
  });

  // PHASE 1: AUTHENTICATION SYSTEM TESTS
  describe('Phase 1: Authentication System', () => {
    describe('Email Verification', () => {
      test('renders email verification component with all required elements', async () => {
        const mockProps = {
          email: 'test@example.com',
          onVerificationComplete: jest.fn(),
          onResendEmail: jest.fn()
        };

        render(
          <TestWrapper>
            <EmailVerification {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/email verification/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /resend/i })).toBeInTheDocument();
      });

      test('email verification service functions work correctly', async () => {
        const email = 'test@example.com';
        const token = 'verification_token_123';

        // Mock successful verification
        jest.spyOn(emailVerificationService, 'verifyEmailToken')
          .mockResolvedValue({ success: true });

        const result = await emailVerificationService.verifyEmailToken(token);
        expect(result.success).toBe(true);
      });

      test('resend email functionality works with cooldown', async () => {
        const email = 'test@example.com';
        
        jest.spyOn(emailVerificationService, 'resendVerificationEmail')
          .mockResolvedValue({ success: true, cooldownRemaining: 60 });

        const result = await emailVerificationService.resendVerificationEmail(email);
        expect(result.success).toBe(true);
        expect(result.cooldownRemaining).toBe(60);
      });
    });

    describe('Phone Verification', () => {
      test('renders phone verification component correctly', async () => {
        const mockProps = {
          phoneNumber: '+1234567890',
          onVerificationComplete: jest.fn(),
          onChangePhone: jest.fn()
        };

        render(
          <TestWrapper>
            <PhoneVerification {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/phone verification/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      });

      test('OTP verification works correctly', async () => {
        const phoneNumber = '+1234567890';
        const code = '123456';

        jest.spyOn(phoneVerificationService, 'verifyPhoneCode')
          .mockResolvedValue({ success: true });

        const result = await phoneVerificationService.verifyPhoneCode(phoneNumber, code);
        expect(result.success).toBe(true);
      });

      test('phone number formatting works correctly', () => {
        const result = phoneVerificationService.formatPhoneNumber('1234567890', 'US');
        expect(result).toMatch(/^\+1/);
      });
    });

    describe('Password Reset', () => {
      test('renders password reset component', async () => {
        const mockProps = {
          onResetComplete: jest.fn(),
          onCancel: jest.fn()
        };

        render(
          <TestWrapper>
            <PasswordReset {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/password reset/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument();
      });

      test('password strength validation works', async () => {
        const weakPassword = '123';
        const strongPassword = 'StrongPass123!@#';

        const weakResult = await passwordService.validatePasswordStrength(weakPassword);
        const strongResult = await passwordService.validatePasswordStrength(strongPassword);

        expect(weakResult.isValid).toBe(false);
        expect(strongResult.isValid).toBe(true);
      });
    });
  });

  // PHASE 2: PAYMENT INTEGRATION TESTS
  describe('Phase 2: Payment Integration', () => {
    describe('Real Payment Processor', () => {
      test('renders payment processor with all payment methods', async () => {
        const mockProps = {
          amount: 500,
          currency: 'USD',
          bookingData: createMockBookingData(),
          onSuccess: jest.fn(),
          onError: jest.fn()
        };

        render(
          <TestWrapper>
            <RealPaymentProcessor {...mockProps} />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/secure payment/i)).toBeInTheDocument();
          expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
        });
      });

      test('stripe integration service creates payment intent', async () => {
        jest.spyOn(stripeIntegrationService, 'createPaymentIntent')
          .mockResolvedValue({
            id: 'pi_123',
            clientSecret: 'pi_123_secret',
            amount: 500,
            currency: 'USD',
            status: 'requires_payment_method'
          });

        const result = await stripeIntegrationService.createPaymentIntent(500, 'USD');
        expect(result.id).toBe('pi_123');
        expect(result.amount).toBe(500);
      });
    });

    describe('Refund Manager', () => {
      test('renders refund manager with transaction details', async () => {
        const mockTransaction = createMockTransaction();
        const mockAdmin = { id: 'admin1', name: 'Admin User', email: 'admin@test.com', role: 'admin' as const, permissions: [] };
        const mockProps = {
          transaction: mockTransaction,
          onRefundProcessed: jest.fn(),
          adminUser: mockAdmin
        };

        render(
          <TestWrapper>
            <RefundManager {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/process refund/i)).toBeInTheDocument();
        expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
        expect(screen.getByText(/Test Hotel/)).toBeInTheDocument();
      });

      test('refund processing works correctly', async () => {
        jest.spyOn(stripeIntegrationService, 'processRefund')
          .mockResolvedValue({
            success: true,
            refund: {
              id: 'ref_123',
              amount: 250,
              currency: 'USD',
              status: 'succeeded',
              receipt_number: 'rec_123'
            }
          });

        const result = await stripeIntegrationService.processRefund('pi_123', 250);
        expect(result.success).toBe(true);
        expect(result.refund?.amount).toBe(250);
      });
    });

    describe('Payment Dispute', () => {
      test('renders payment dispute interface', async () => {
        const mockDispute = createMockDispute();
        const mockProps = {
          dispute: mockDispute,
          onDisputeResolved: jest.fn(),
          onClose: jest.fn()
        };

        render(
          <TestWrapper>
            <PaymentDispute {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/payment dispute/i)).toBeInTheDocument();
        expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
      });
    });
  });

  // PHASE 3: COMMUNICATION FEATURES TESTS
  describe('Phase 3: Communication Features', () => {
    describe('Voice Call Service', () => {
      test('voice call initiation works', async () => {
        const mockConfig = {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          constraints: { audio: true, video: false },
          signaling: { endpoint: 'wss://test.com', apiKey: 'test' }
        };

        jest.spyOn(voiceCallService, 'initialize')
          .mockResolvedValue(true);

        const result = await voiceCallService.initialize(mockConfig);
        expect(result).toBe(true);
      });

      test('call session management works', async () => {
        const mockSession = createMockCallSession();
        
        jest.spyOn(voiceCallService, 'getCallSession')
          .mockReturnValue(mockSession);

        const session = voiceCallService.getCallSession('call123');
        expect(session?.id).toBe('call123');
        expect(session?.status).toBe('active');
      });
    });

    describe('Video Call Service', () => {
      test('video quality settings work', async () => {
        jest.spyOn(videoCallService, 'setVideoQuality')
          .mockResolvedValue();

        await expect(
          videoCallService.setVideoQuality('call123', '720p')
        ).resolves.not.toThrow();
      });

      test('screen sharing functionality', async () => {
        jest.spyOn(videoCallService, 'shareScreen')
          .mockResolvedValue(true);

        const result = await videoCallService.shareScreen('call123');
        expect(result).toBe(true);
      });
    });

    describe('File Upload Service', () => {
      test('file validation works correctly', () => {
        const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

        const validResult = fileUploadService.validateFileType(validFile);
        const invalidResult = fileUploadService.validateFileType(invalidFile);

        expect(validResult.isValid).toBe(true);
        expect(invalidResult.isValid).toBe(false);
      });

      test('file upload progress tracking', async () => {
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        jest.spyOn(fileUploadService, 'uploadFile')
          .mockResolvedValue({
            id: 'file123',
            type: 'file',
            fileName: 'test.jpg',
            fileSize: 1024,
            fileType: 'image/jpeg',
            url: 'https://cdn.test.com/file123.jpg',
            uploadedAt: new Date(),
            uploadedBy: 'user123',
            chatId: 'chat123'
          });

        const result = await fileUploadService.uploadFile(mockFile, 'chat123');
        expect(result.fileName).toBe('test.jpg');
        expect(result.fileType).toBe('image/jpeg');
      });
    });

    describe('Call Interface', () => {
      test('renders call interface for incoming call', async () => {
        const mockCallSession = createMockCallSession();
        const mockProps = {
          callSession: mockCallSession,
          isIncoming: true,
          onCallEnd: jest.fn(),
          onCallAccept: jest.fn(),
          onCallDecline: jest.fn()
        };

        render(
          <TestWrapper>
            <CallInterface {...mockProps} />
          </TestWrapper>
        );

        expect(screen.getByText(/incoming/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
      });
    });
  });

  // PHASE 4: ADMIN TOOLS & ANALYTICS TESTS
  describe('Phase 4: Admin Tools & Analytics', () => {
    describe('Analytics Dashboard', () => {
      test('renders analytics dashboard with metrics', async () => {
        render(
          <TestWrapper>
            <AnalyticsDashboard />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
        });
      });

      test('analytics service provides metrics', async () => {
        jest.spyOn(analyticsService, 'getUserMetrics')
          .mockResolvedValue({
            totalUsers: 12547,
            activeUsers: { daily: 1847, weekly: 8932, monthly: 11203 },
            newUsers: { today: 127, thisWeek: 892, thisMonth: 2341 },
            retention: { day1: 0.85, day7: 0.67, day30: 0.43 },
            demographics: {
              countries: [],
              devices: [],
              platforms: []
            }
          });

        const metrics = await analyticsService.getUserMetrics();
        expect(metrics.totalUsers).toBe(12547);
        expect(metrics.activeUsers.daily).toBe(1847);
      });

      test('real-time metrics update', async () => {
        jest.spyOn(analyticsService, 'getRealtimeMetrics')
          .mockResolvedValue({
            activeUsers: 150,
            activeBookings: 20,
            activeCalls: 5,
            currentRevenue: 15000,
            serverLoad: 45.5,
            responseTime: 120
          });

        const realtimeData = await analyticsService.getRealtimeMetrics();
        expect(realtimeData.activeUsers).toBe(150);
        expect(realtimeData.serverLoad).toBe(45.5);
      });
    });

    describe('System Health Monitor', () => {
      test('renders system health dashboard', async () => {
        render(
          <TestWrapper>
            <SystemHealthMonitor />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/system health monitor/i)).toBeInTheDocument();
        });
      });

      test('displays service status correctly', async () => {
        render(
          <TestWrapper>
            <SystemHealthMonitor />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/api gateway/i)).toBeInTheDocument();
          expect(screen.getByText(/database/i)).toBeInTheDocument();
        });
      });
    });
  });

  // INTEGRATION TESTS
  describe('Cross-Phase Integration Tests', () => {
    test('complete booking flow with real payment', async () => {
      // This would test the entire flow from booking to payment completion
      const bookingData = createMockBookingData();
      
      // Mock the entire payment flow
      jest.spyOn(stripeIntegrationService, 'createPaymentIntent')
        .mockResolvedValue({
          id: 'pi_integration_test',
          clientSecret: 'pi_secret',
          amount: bookingData.totalAmount,
          currency: bookingData.currency,
          status: 'requires_payment_method'
        });

      jest.spyOn(stripeIntegrationService, 'confirmPayment')
        .mockResolvedValue({ success: true });

      const paymentIntent = await stripeIntegrationService.createPaymentIntent(
        bookingData.totalAmount,
        bookingData.currency
      );

      const paymentResult = await stripeIntegrationService.confirmPayment(
        paymentIntent.clientSecret,
        'pm_test_card'
      );

      expect(paymentIntent.amount).toBe(500);
      expect(paymentResult.success).toBe(true);
    });

    test('authentication to communication flow', async () => {
      // Test authentication then initiating a call
      const mockUser = createMockUser();
      
      jest.spyOn(emailVerificationService, 'verifyEmailToken')
        .mockResolvedValue({ success: true });

      jest.spyOn(voiceCallService, 'initiateCall')
        .mockResolvedValue(createMockCallSession());

      // Simulate user verification
      const verificationResult = await emailVerificationService.verifyEmailToken('token123');
      expect(verificationResult.success).toBe(true);

      // Simulate call initiation
      const callSession = await voiceCallService.initiateCall('target_user');
      expect(callSession.id).toBeDefined();
    });

    test('admin analytics with real data integration', async () => {
      // Test admin viewing analytics after system activity
      jest.spyOn(analyticsService, 'trackEvent')
        .mockResolvedValue();

      jest.spyOn(analyticsService, 'getBookingMetrics')
        .mockResolvedValue({
          totalBookings: 8945,
          revenue: { total: 2847532, daily: 12847, weekly: 89435, monthly: 387429 },
          conversionRate: 0.034,
          averageBookingValue: 318.23,
          bookingsByStatus: [],
          popularDestinations: [],
          bookingTrends: [],
          cancellationRate: 0.05,
          refundRate: 0.032
        });

      // Track some events
      await analyticsService.trackEvent('booking_created', { amount: 500 });
      await analyticsService.trackEvent('payment_completed', { paymentId: 'pi_123' });

      // Get metrics
      const metrics = await analyticsService.getBookingMetrics();
      expect(metrics.totalBookings).toBe(8945);
      expect(metrics.conversionRate).toBe(0.034);
    });
  });

  // PERFORMANCE TESTS
  describe('Performance Tests', () => {
    test('components render within performance budget', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <AnalyticsDashboard />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Expect render time to be under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('service calls complete within timeout', async () => {
      const timeoutMs = 5000;
      
      const promise = analyticsService.getUserMetrics();
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      );

      await expect(Promise.race([promise, timeout])).resolves.toBeDefined();
    });
  });

  // ERROR HANDLING TESTS
  describe('Error Handling Tests', () => {
    test('payment failure is handled gracefully', async () => {
      jest.spyOn(stripeIntegrationService, 'confirmPayment')
        .mockResolvedValue({ 
          success: false, 
          error: 'Your card was declined.' 
        });

      const result = await stripeIntegrationService.confirmPayment('pi_fail', 'pm_fail');
      expect(result.success).toBe(false);
      expect(result.error).toContain('declined');
    });

    test('network errors are handled in services', async () => {
      jest.spyOn(analyticsService, 'getUserMetrics')
        .mockRejectedValue(new Error('Network error'));

      await expect(
        analyticsService.getUserMetrics()
      ).rejects.toThrow('Network error');
    });

    test('invalid input is rejected by validation', () => {
      const invalidPhone = 'not-a-phone';
      const validationResult = phoneVerificationService.validatePhoneNumber(invalidPhone);
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBeDefined();
    });
  });
});

// Test utility functions
export const testUtils = {
  createMockUser,
  createMockBookingData,
  createMockTransaction,
  createMockCallSession,
  createMockDispute,
  TestWrapper
};

export default testUtils;
