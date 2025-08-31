export interface PaymentMethod {
  id: string;
  type: PaymentType;
  name: string;
  icon: string;
  enabled: boolean;
  isDefault?: boolean;
  config: PaymentConfig;
}

export type PaymentType = 
  | 'credit_card'
  | 'debit_card'
  | 'mobile_money'
  | 'bank_transfer'
  | 'paypal'
  | 'stripe'
  | 'telebirr'
  | 'cbebe'
  | 'mpesa'
  | 'airtel_money'
  | 'ebirr'
  | 'cash'
  | 'crypto';

export interface PaymentConfig {
  // API Configuration
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  webhookUrl?: string;
  
  // Ethiopian Payment Gateways
  telebirrConfig?: {
    appId: string;
    publicKey: string;
    notificationUrl: string;
  };
  
  // Mobile Money Configuration
  mobileMoneyConfig?: {
    shortCode: string;
    consumerKey: string;
    consumerSecret: string;
  };
  
  // Bank Transfer Configuration
  bankConfig?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountName: string;
  };
  
  // Manual Processing
  requiresManualVerification: boolean;
  autoApprove: boolean;
  maxAmount?: number;
  minAmount?: number;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentType;
  status: PaymentStatus;
  gateway: string;
  gatewayTransactionId?: string;
  
  // Transaction Details
  description: string;
  metadata: Record<string, unknown>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  verifiedAt?: Date;
  
  // Verification
  verificationMethod: 'automatic' | 'manual' | 'hybrid';
  verifiedBy?: string; // Admin user ID
  verificationNotes?: string;
  
  // Error handling
  errorMessage?: string;
  retryCount: number;
  
  // Receipt & Documentation
  receiptUrl?: string;
  invoiceUrl?: string;
  proofOfPayment?: string[];
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refund'
  | 'disputed'
  | 'requires_verification'
  | 'verified'
  | 'declined';

export interface PaymentForm {
  paymentMethod: PaymentType;
  amount: number;
  currency: string;
  
  // Card Details
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardHolderName?: string;
  
  // Mobile Money
  phoneNumber?: string;
  operator?: string;
  
  // Bank Transfer
  bankAccount?: string;
  bankCode?: string;
  accountHolderName?: string;
  
  // PayPal
  paypalOrderId?: string;
  paypalPayerId?: string;
  paypalEmail?: string;
  
  // Additional Info
  savePaymentMethod?: boolean;
  isDefault?: boolean;
  notes?: string;
}

export interface PaymentSettings {
  // General Settings
  enabledMethods: PaymentType[];
  defaultMethod: PaymentType;
  currency: string;
  
  // Processing Mode
  processingMode: 'automatic' | 'manual' | 'hybrid';
  requireManualVerificationAbove: number;
  autoApproveBelow: number;
  
  // Security
  enableFraudDetection: boolean;
  maxDailyAmount: number;
  maxTransactionAmount: number;
  
  // Notifications
  notifyOnPayment: boolean;
  notifyOnFailure: boolean;
  adminNotificationEmails: string[];
  
  // Receipt Settings
  generateReceipts: boolean;
  receiptTemplate: string;
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId?: string;
  };
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  avgTransactionAmount: number;
  
  // By Method
  byMethod: Record<PaymentType, {
    count: number;
    amount: number;
    successRate: number;
  }>;
  
  // By Status
  byStatus: Record<PaymentStatus, number>;
  
  // Time-based
  daily: Array<{
    date: string;
    transactions: number;
    amount: number;
  }>;
  
  monthly: Array<{
    month: string;
    transactions: number;
    amount: number;
  }>;
}

export interface BookingPayment {
  bookingId: string;
  totalAmount: number;
  currency: string;
  breakdown: {
    roomCost: number;
    taxes: number;
    fees: number;
    discounts: number;
  };
  paymentPlan: 'full' | 'deposit' | 'installments';
  depositAmount?: number;
  installments?: Array<{
    amount: number;
    dueDate: Date;
    status: PaymentStatus;
    transactionId?: string;
  }>;
}
