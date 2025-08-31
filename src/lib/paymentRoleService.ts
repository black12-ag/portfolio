import { 
  PaymentPermission, 
  UserRole, 
  PaymentAgent, 
  PaymentMethodConfig, 
  PaymentWorkflow,
  PaymentAuditLog 
} from '@/types/paymentRoles';
import { PaymentTransaction, PaymentStatus, PaymentType } from '@/types/payment';

class PaymentRoleService {
  private agents: Map<string, PaymentAgent> = new Map();
  private roles: Map<string, UserRole> = new Map();
  private workflows: Map<string, PaymentWorkflow> = new Map();
  private auditLogs: PaymentAuditLog[] = [];
  private methodConfigs: Map<string, PaymentMethodConfig> = new Map();

  constructor() {
    this.initializeDefaultRoles();
    this.initializeDefaultWorkflows();
    this.initializeMethodConfigs();
    this.loadData();
  }

  // Initialize default roles
  private initializeDefaultRoles(): void {
    const adminRole: UserRole = {
      id: 'admin',
      name: 'Administrator',
      level: 'admin',
      permissions: [
        'verify_any_payment',
        'approve_any_amount',
        'refund_payments',
        'manage_agents',
        'configure_payment_methods',
        'view_all_transactions',
        'create_bookings',
        'modify_workflows',
        'access_audit_logs'
      ],
      paymentLimits: {
        maxVerificationAmount: 1000000,
        maxDailyAmount: 10000000,
        maxTransactionCount: 1000
      },
      allowedPaymentMethods: ['all'],
      canCreateBookings: true,
      canRefundPayments: true,
      canViewAllTransactions: true
    };

    const agentRole: UserRole = {
      id: 'payment_agent',
      name: 'Payment Agent',
      level: 'agent',
      permissions: [
        'verify_assigned_payments',
        'approve_below_limit',
        'view_assigned_transactions',
        'create_bookings_on_verification',
        'send_customer_notifications'
      ],
      paymentLimits: {
        maxVerificationAmount: 50000,
        maxDailyAmount: 500000,
        maxTransactionCount: 100
      },
      allowedPaymentMethods: ['credit_card', 'debit_card', 'mobile_money', 'bank_transfer'],
      canCreateBookings: true,
      canRefundPayments: false,
      canViewAllTransactions: false
    };

    const managerRole: UserRole = {
      id: 'payment_manager',
      name: 'Payment Manager',
      level: 'manager',
      permissions: [
        'verify_any_payment',
        'approve_high_amounts',
        'refund_payments',
        'manage_team_agents',
        'view_team_transactions',
        'create_bookings',
        'configure_team_settings'
      ],
      paymentLimits: {
        maxVerificationAmount: 200000,
        maxDailyAmount: 2000000,
        maxTransactionCount: 500
      },
      allowedPaymentMethods: ['all'],
      canCreateBookings: true,
      canRefundPayments: true,
      canViewAllTransactions: true
    };

    this.roles.set('admin', adminRole);
    this.roles.set('payment_agent', agentRole);
    this.roles.set('payment_manager', managerRole);
  }

  // Initialize default workflows
  private initializeDefaultWorkflows(): void {
    const standardWorkflow: PaymentWorkflow = {
      id: 'standard_verification',
      name: 'Standard Payment Verification',
      description: 'Standard workflow for payment verification and booking creation',
      steps: [
        {
          id: 'initial_review',
          name: 'Initial Review',
          type: 'verification',
          assignedRole: 'payment_agent',
          requiredPermissions: ['verify_assigned_payments']
        },
        {
          id: 'approval',
          name: 'Final Approval',
          type: 'approval',
          assignedRole: 'payment_manager',
          requiredPermissions: ['approve_high_amounts'],
          automationConditions: [
            { field: 'amount', operator: 'greater_than', value: 50000 }
          ]
        },
        {
          id: 'booking_creation',
          name: 'Create Booking',
          type: 'booking_creation',
          assignedRole: 'payment_agent',
          requiredPermissions: ['create_bookings_on_verification']
        },
        {
          id: 'notification',
          name: 'Customer Notification',
          type: 'notification',
          assignedRole: 'payment_agent',
          requiredPermissions: ['send_customer_notifications']
        }
      ],
      escalation: {
        timeoutMinutes: 60,
        escalateTo: 'payment_manager',
        notificationChannels: ['email', 'slack']
      },
      sla: {
        maxProcessingTime: 120,
        urgentThreshold: 30,
        criticalThreshold: 60
      }
    };

    this.workflows.set('standard_verification', standardWorkflow);
  }

  // Initialize payment method configurations
  private initializeMethodConfigs(): void {
    const creditCardConfig: PaymentMethodConfig = {
      id: 'credit_card',
      type: 'credit_card',
      name: 'Credit Card',
      enabled: true,
      processingMode: 'hybrid',
      adminSettings: {
        autoApproveBelow: 10000,
        requireApprovalAbove: 100000,
        allowAgentVerification: true
      },
      agentSettings: {
        canVerify: true,
        maxVerificationAmount: 50000,
        requiresSecondApproval: false,
        allowedAgentRoles: ['payment_agent', 'payment_manager']
      },
      automationRules: {
        autoApproveConditions: [
          { condition: 'amount', value: 5000, operator: 'less_than' },
          { condition: 'user_verification_level', value: 'verified', operator: 'equals' }
        ],
        manualReviewConditions: [
          { condition: 'amount', value: 50000, operator: 'greater_than' },
          { condition: 'user_risk_score', value: 70, operator: 'greater_than' }
        ]
      },
      security: {
        requireTwoFactorAuth: false,
        ipWhitelist: [],
        maxFailedAttempts: 3,
        lockoutDuration: 30
      }
    };

    const bankTransferConfig: PaymentMethodConfig = {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      enabled: true,
      processingMode: 'manual',
      adminSettings: {
        autoApproveBelow: 0,
        requireApprovalAbove: 1000,
        allowAgentVerification: true
      },
      agentSettings: {
        canVerify: true,
        maxVerificationAmount: 100000,
        requiresSecondApproval: true,
        allowedAgentRoles: ['payment_agent', 'payment_manager']
      },
      automationRules: {
        autoApproveConditions: [],
        manualReviewConditions: [
          { condition: 'amount', value: 1000, operator: 'greater_than' }
        ]
      },
      security: {
        requireTwoFactorAuth: true,
        ipWhitelist: [],
        maxFailedAttempts: 3,
        lockoutDuration: 60
      }
    };

    this.methodConfigs.set('credit_card', creditCardConfig);
    this.methodConfigs.set('bank_transfer', bankTransferConfig);
  }

  // Agent Management
  createAgent(agentData: Omit<PaymentAgent, 'id' | 'createdAt' | 'verificationsToday' | 'totalVerifications' | 'verificationAccuracy'>): PaymentAgent {
    const agent: PaymentAgent = {
      ...agentData,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      verificationsToday: 0,
      totalVerifications: 0,
      verificationAccuracy: 100
    };

    this.agents.set(agent.id, agent);
    this.saveData();

    this.logAction({
      id: `audit_${Date.now()}`,
      transactionId: '',
      action: 'create_agent',
      performedBy: agentData.createdBy,
      performedByRole: 'admin',
      timestamp: new Date(),
      details: {
        newState: agent,
        reason: 'New agent created'
      },
      category: 'settings'
    });

    return agent;
  }

  updateAgentPermissions(agentId: string, permissions: string[], updatedBy: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    const oldPermissions = [...agent.permissions];
    agent.permissions = permissions.map(permId => this.getPermissionById(permId)).filter(Boolean);

    this.agents.set(agentId, agent);
    this.saveData();

    this.logAction({
      id: `audit_${Date.now()}`,
      transactionId: '',
      action: 'update_agent_permissions',
      performedBy: updatedBy,
      performedByRole: 'admin',
      timestamp: new Date(),
      details: {
        previousState: oldPermissions,
        newState: agent.permissions,
        reason: 'Agent permissions updated'
      },
      category: 'settings'
    });

    return true;
  }

  // Permission Checking
  hasPermission(userId: string, permission: string): boolean {
    const agent = Array.from(this.agents.values()).find(a => a.userId === userId);
    if (!agent) return false;

    return agent.permissions.some(p => p.id === permission) || 
           agent.role.permissions.includes(permission);
  }

  canVerifyPayment(userId: string, transaction: PaymentTransaction): boolean {
    const agent = Array.from(this.agents.values()).find(a => a.userId === userId);
    if (!agent?.isActive) return false;

    // Check basic permission
    if (!this.hasPermission(userId, 'verify_assigned_payments') && 
        !this.hasPermission(userId, 'verify_any_payment')) {
      return false;
    }

    // Check amount limits
    if (transaction.amount > agent.role.paymentLimits.maxVerificationAmount) {
      return false;
    }

    // Check payment method permissions
    if (!agent.role.allowedPaymentMethods.includes('all') &&
        !agent.role.allowedPaymentMethods.includes(transaction.paymentMethod)) {
      return false;
    }

    // Check daily limits
    if (agent.verificationsToday >= agent.role.paymentLimits.maxTransactionCount) {
      return false;
    }

    return true;
  }

  // Payment Verification with Role Checking
  async verifyPaymentWithRole(
    transactionId: string, 
    userId: string, 
    approved: boolean, 
    notes?: string,
    createBooking = false
  ): Promise<{ success: boolean; error?: string; bookingId?: string }> {
    const agent = Array.from(this.agents.values()).find(a => a.userId === userId);
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    // Get transaction (this would normally come from the main payment service)
    const transaction = this.getTransactionById(transactionId);
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    // Check permissions
    if (!this.canVerifyPayment(userId, transaction)) {
      return { success: false, error: 'Insufficient permissions for this verification' };
    }

    // Update verification stats
    agent.verificationsToday += 1;
    agent.totalVerifications += 1;
    this.agents.set(agent.id, agent);

    // Log the verification action
    this.logAction({
      id: `audit_${Date.now()}`,
      transactionId,
      action: approved ? 'approve_payment' : 'decline_payment',
      performedBy: userId,
      performedByRole: agent.role.name,
      timestamp: new Date(),
      details: {
        previousState: transaction.status,
        newState: approved ? 'verified' : 'declined',
        reason: notes || 'Payment verification',
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod
      },
      category: 'verification'
    });

    // Create booking if requested and agent has permission
    let bookingId: string | undefined;
    if (createBooking && approved && agent.role.canCreateBookings) {
      bookingId = await this.createBookingFromPayment(transaction, userId);
      
      if (bookingId) {
        this.logAction({
          id: `audit_${Date.now()}`,
          transactionId,
          action: 'create_booking_from_payment',
          performedBy: userId,
          performedByRole: agent.role.name,
          timestamp: new Date(),
          details: {
            bookingId,
            reason: 'Booking created during payment verification'
          },
          category: 'booking'
        });
      }
    }

    this.saveData();

    return { 
      success: true, 
      bookingId 
    };
  }

  // Create booking from verified payment
  private async createBookingFromPayment(transaction: PaymentTransaction, userId: string): Promise<string> {
    // Generate booking ID
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, this would integrate with the booking service
    const booking = {
      id: bookingId,
      paymentTransactionId: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: 'confirmed',
      createdBy: userId,
      createdAt: new Date()
    };

    // Save booking (in real app, would use booking service)
    localStorage.setItem(`booking_${bookingId}`, JSON.stringify(booking));
    
    return bookingId;
  }

  // Method Configuration Management
  updateMethodConfig(methodType: PaymentType, config: Partial<PaymentMethodConfig>, updatedBy: string): boolean {
    const existingConfig = this.methodConfigs.get(methodType);
    if (!existingConfig) return false;

    const updatedConfig = { ...existingConfig, ...config };
    this.methodConfigs.set(methodType, updatedConfig);

    this.logAction({
      id: `audit_${Date.now()}`,
      transactionId: '',
      action: 'update_payment_method_config',
      performedBy: updatedBy,
      performedByRole: 'admin',
      timestamp: new Date(),
      details: {
        previousState: existingConfig,
        newState: updatedConfig,
        reason: 'Payment method configuration updated'
      },
      category: 'settings'
    });

    this.saveData();
    return true;
  }

  getMethodConfig(methodType: PaymentType): PaymentMethodConfig | undefined {
    return this.methodConfigs.get(methodType);
  }

  // Agent Analytics
  getAgentPerformance(agentId: string): any {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const recentActions = this.auditLogs
      .filter(log => log.performedBy === agent.userId)
      .slice(-100);

    const approvals = recentActions.filter(log => log.action === 'approve_payment').length;
    const declines = recentActions.filter(log => log.action === 'decline_payment').length;

    return {
      agent,
      stats: {
        verificationsToday: agent.verificationsToday,
        totalVerifications: agent.totalVerifications,
        verificationAccuracy: agent.verificationAccuracy,
        approvalRate: approvals / (approvals + declines) * 100,
        averageProcessingTime: 5.2, // Would calculate from real data
        customerSatisfactionScore: 4.7
      },
      recentActivity: recentActions.slice(-10)
    };
  }

  // Utility methods
  private getPermissionById(id: string): PaymentPermission | null {
    const permissions: PaymentPermission[] = [
      { id: 'verify_any_payment', name: 'Verify Any Payment', description: 'Can verify payments of any amount', category: 'verification' },
      { id: 'verify_assigned_payments', name: 'Verify Assigned Payments', description: 'Can verify assigned payments within limits', category: 'verification' },
      { id: 'approve_any_amount', name: 'Approve Any Amount', description: 'Can approve payments of any amount', category: 'verification' },
      { id: 'approve_below_limit', name: 'Approve Below Limit', description: 'Can approve payments below role limit', category: 'verification' },
      { id: 'create_bookings_on_verification', name: 'Create Bookings', description: 'Can create bookings when verifying payments', category: 'booking' },
      { id: 'refund_payments', name: 'Refund Payments', description: 'Can process payment refunds', category: 'verification' },
      { id: 'manage_agents', name: 'Manage Agents', description: 'Can create and manage payment agents', category: 'settings' },
      { id: 'view_all_transactions', name: 'View All Transactions', description: 'Can view all payment transactions', category: 'reporting' }
    ];

    return permissions.find(p => p.id === id) || null;
  }

  private getTransactionById(id: string): PaymentTransaction | null {
    // In real implementation, this would fetch from payment service
    return null;
  }

  private logAction(log: PaymentAuditLog): void {
    this.auditLogs.push(log);
    
    // Keep only last 10000 logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  // Data persistence
  private loadData(): void {
    try {
      const agentsData = localStorage.getItem('payment-agents');
      if (agentsData) {
        const agents = JSON.parse(agentsData);
        agents.forEach((agent: PaymentAgent) => {
          agent.createdAt = new Date(agent.createdAt);
          agent.lastLogin = new Date(agent.lastLogin);
          this.agents.set(agent.id, agent);
        });
      }

      const auditData = localStorage.getItem('payment-audit-logs');
      if (auditData) {
        this.auditLogs = JSON.parse(auditData).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load payment role data:', error);
    }
  }

  private saveData(): void {
    try {
      const agentsArray = Array.from(this.agents.values());
      localStorage.setItem('payment-agents', JSON.stringify(agentsArray));
      localStorage.setItem('payment-audit-logs', JSON.stringify(this.auditLogs));
    } catch (error) {
      console.error('Failed to save payment role data:', error);
    }
  }

  // Public getters
  getAllAgents(): PaymentAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): PaymentAgent | undefined {
    return this.agents.get(id);
  }

  getAllRoles(): UserRole[] {
    return Array.from(this.roles.values());
  }

  getAuditLogs(limit = 100): PaymentAuditLog[] {
    return this.auditLogs.slice(-limit).reverse();
  }

  getAllMethodConfigs(): PaymentMethodConfig[] {
    return Array.from(this.methodConfigs.values());
  }
}

export const paymentRoleService = new PaymentRoleService();
