import { 
  PaymentMethod, 
  PaymentTransaction, 
  PaymentForm, 
  PaymentStatus, 
  PaymentType,
  PaymentSettings 
} from '@/types/payment';

class PaymentService {
  private settings: PaymentSettings;
  private transactions: Map<string, PaymentTransaction> = new Map();

  constructor() {
    this.settings = this.loadSettings();
    this.loadTransactions();
  }

  // Settings Management
  private loadSettings(): PaymentSettings {
    const stored = localStorage.getItem('payment-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load payment settings:', error);
      }
    }
    
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): PaymentSettings {
    return {
      enabledMethods: ['credit_card', 'mobile_money', 'bank_transfer', 'telebirr'],
      defaultMethod: 'credit_card',
      currency: 'ETB',
      processingMode: 'hybrid',
      requireManualVerificationAbove: 10000,
      autoApproveBelow: 1000,
      enableFraudDetection: true,
      maxDailyAmount: 100000,
      maxTransactionAmount: 50000,
      notifyOnPayment: true,
      notifyOnFailure: true,
      adminNotificationEmails: ['admin@metah.travel'],
      generateReceipts: true,
      receiptTemplate: 'standard',
      companyDetails: {
        name: 'Metah Travel',
        address: 'Addis Ababa, Ethiopia',
        phone: '+251-11-123-4567',
        email: 'payments@metah.travel'
      } as const
    };
  }

  updateSettings(newSettings: Partial<PaymentSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('payment-settings', JSON.stringify(this.settings));
  }

  getSettings(): PaymentSettings {
    return this.settings;
  }

  // Payment Methods Management
  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'credit_card',
        type: 'credit_card',
        name: 'Credit Card',
        icon: '💳',
        enabled: this.settings.enabledMethods.includes('credit_card'),
        config: {
          requiresManualVerification: false,
          autoApprove: true,
          maxAmount: 50000
        }
      },
      {
        id: 'debit_card',
        type: 'debit_card',
        name: 'Debit Card',
        icon: '💴',
        enabled: this.settings.enabledMethods.includes('debit_card'),
        config: {
          requiresManualVerification: false,
          autoApprove: true,
          maxAmount: 30000
        }
      },
      {
        id: 'telebirr',
        type: 'telebirr',
        name: 'TeleBirr',
        icon: '📱',
        enabled: this.settings.enabledMethods.includes('telebirr'),
        config: {
          requiresManualVerification: this.settings.processingMode === 'manual',
          autoApprove: this.settings.processingMode === 'automatic',
          maxAmount: 20000
        }
      },
      {
        id: 'cbebe',
        type: 'cbebe',
        name: 'CBE Birr',
        icon: '🏦',
        enabled: this.settings.enabledMethods.includes('cbebe'),
        config: {
          requiresManualVerification: true,
          autoApprove: false,
          maxAmount: 100000
        }
      },
      {
        id: 'mpesa',
        type: 'mpesa',
        name: 'M-Pesa',
        icon: '📲',
        enabled: this.settings.enabledMethods.includes('mpesa'),
        config: {
          requiresManualVerification: false,
          autoApprove: true,
          maxAmount: 25000
        }
      },
      {
        id: 'airtel_money',
        type: 'airtel_money',
        name: 'Airtel Money',
        icon: '📞',
        enabled: this.settings.enabledMethods.includes('airtel_money'),
        config: {
          requiresManualVerification: false,
          autoApprove: true,
          maxAmount: 25000
        }
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Bank Transfer',
        icon: '🏛️',
        enabled: this.settings.enabledMethods.includes('bank_transfer'),
        config: {
          requiresManualVerification: true,
          autoApprove: false,
          maxAmount: 1000000,
          bankConfig: {
            accountNumber: '1234567890',
            routingNumber: '001',
            bankName: 'Commercial Bank of Ethiopia',
            accountName: 'Metah Travel PLC'
          }
        }
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        icon: '🌐',
        enabled: this.settings.enabledMethods.includes('paypal'),
        config: {
          requiresManualVerification: false,
          autoApprove: true,
          maxAmount: 10000
        }
      },
      {
        id: 'cash',
        type: 'cash',
        name: 'Cash Payment',
        icon: '💵',
        enabled: this.settings.enabledMethods.includes('cash'),
        config: {
          requiresManualVerification: true,
          autoApprove: false,
          maxAmount: 50000
        }
      }
    ];
  }

  getEnabledPaymentMethods(): PaymentMethod[] {
    return this.getAvailablePaymentMethods().filter(method => method.enabled);
  }

  // Transaction Management
  private loadTransactions(): void {
    const stored = localStorage.getItem('payment-transactions');
    if (stored) {
      try {
        const transactions = JSON.parse(stored);
        transactions.forEach((tx: PaymentTransaction) => {
          this.transactions.set(tx.id, {
            ...tx,
            createdAt: new Date(tx.createdAt),
            updatedAt: new Date(tx.updatedAt),
            processedAt: tx.processedAt ? new Date(tx.processedAt) : undefined,
            verifiedAt: tx.verifiedAt ? new Date(tx.verifiedAt) : undefined,
          });
        });
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    }
  }

  private saveTransactions(): void {
    const transactions = Array.from(this.transactions.values());
    localStorage.setItem('payment-transactions', JSON.stringify(transactions));
  }

  async processPayment(paymentForm: PaymentForm, bookingId: string, userId: string): Promise<PaymentTransaction> {
    // Generate transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine processing method based on amount and settings
    const verificationMethod = this.determineVerificationMethod(paymentForm.amount);
    
    // Create transaction
    const transaction: PaymentTransaction = {
      id: transactionId,
      bookingId,
      userId,
      amount: paymentForm.amount,
      currency: paymentForm.currency,
      paymentMethod: paymentForm.paymentMethod,
      status: 'pending',
      gateway: this.getGatewayForMethod(paymentForm.paymentMethod),
      description: `Payment for booking ${bookingId}`,
      metadata: {
        cardLast4: paymentForm.cardNumber?.slice(-4),
        phoneNumber: paymentForm.phoneNumber,
        notes: paymentForm.notes
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      verificationMethod,
      retryCount: 0
    };

    // Save transaction
    this.transactions.set(transactionId, transaction);
    this.saveTransactions();

    // Process based on verification method
    if (verificationMethod === 'automatic') {
      return this.processAutomaticPayment(transaction);
    } else {
      return this.processManuallPayment(transaction);
    }
  }

  private determineVerificationMethod(amount: number): 'automatic' | 'manual' | 'hybrid' {
    if (this.settings.processingMode === 'automatic') return 'automatic';
    if (this.settings.processingMode === 'manual') return 'manual';
    
    // Hybrid mode logic
    if (amount <= this.settings.autoApproveBelow) return 'automatic';
    if (amount >= this.settings.requireManualVerificationAbove) return 'manual';
    return 'hybrid';
  }

  private async processAutomaticPayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, simulate successful payment
    const updatedTransaction = {
      ...transaction,
      status: 'completed' as PaymentStatus,
      processedAt: new Date(),
      verifiedAt: new Date(),
      gatewayTransactionId: `gw_${Date.now()}`,
      updatedAt: new Date()
    };

    this.transactions.set(transaction.id, updatedTransaction);
    this.saveTransactions();
    
    return updatedTransaction;
  }

  private async processManuallPayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Set status to require verification
    const updatedTransaction = {
      ...transaction,
      status: 'requires_verification' as PaymentStatus,
      updatedAt: new Date()
    };

    this.transactions.set(transaction.id, updatedTransaction);
    this.saveTransactions();
    
    return updatedTransaction;
  }

  private getGatewayForMethod(method: PaymentType): string {
    const gateways = {
      credit_card: 'stripe',
      debit_card: 'stripe',
      telebirr: 'telebirr',
      cbebe: 'cbe',
      mpesa: 'safaricom',
      airtel_money: 'airtel',
      bank_transfer: 'manual',
      paypal: 'paypal',
      cash: 'manual'
    };
    
    return gateways[method] || 'unknown';
  }

  // Admin Functions
  async verifyPayment(transactionId: string, adminId: string, approved: boolean, notes?: string): Promise<PaymentTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = {
      ...transaction,
      status: approved ? 'verified' as PaymentStatus : 'declined' as PaymentStatus,
      verifiedAt: new Date(),
      verifiedBy: adminId,
      verificationNotes: notes,
      updatedAt: new Date()
    };

    this.transactions.set(transactionId, updatedTransaction);
    this.saveTransactions();
    
    return updatedTransaction;
  }

  getPendingTransactions(): PaymentTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.status === 'requires_verification' || tx.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllTransactions(): PaymentTransaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getTransactionById(id: string): PaymentTransaction | undefined {
    return this.transactions.get(id);
  }

  getTransactionsByBooking(bookingId: string): PaymentTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.bookingId === bookingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Receipt Generation
  generateReceipt(transactionId: string): string {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Generate receipt URL (in real app, this would be a PDF service)
    const receiptUrl = `data:text/html,${encodeURIComponent(this.generateReceiptHTML(transaction))}`;
    
    // Update transaction with receipt URL
    const updatedTransaction = {
      ...transaction,
      receiptUrl,
      updatedAt: new Date()
    };
    
    this.transactions.set(transactionId, updatedTransaction);
    this.saveTransactions();
    
    return receiptUrl;
  }

  private generateReceiptHTML(transaction: PaymentTransaction): string {
    const { companyDetails } = this.settings;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${companyDetails.name}</h1>
          <p>${companyDetails.address}</p>
          <p>${companyDetails.phone} | ${companyDetails.email}</p>
        </div>
        
        <div class="details">
          <h2>Payment Receipt</h2>
          <div class="row"><span>Receipt #:</span><span>${transaction.id}</span></div>
          <div class="row"><span>Date:</span><span>${transaction.createdAt.toLocaleDateString()}</span></div>
          <div class="row"><span>Booking ID:</span><span>${transaction.bookingId}</span></div>
          <div class="row"><span>Payment Method:</span><span>${transaction.paymentMethod}</span></div>
          <div class="row"><span>Status:</span><span>${transaction.status}</span></div>
          <div class="row total"><span>Amount:</span><span>${transaction.amount} ${transaction.currency}</span></div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const paymentService = new PaymentService();
