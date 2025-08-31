export interface PaymentPermission {
  id: string;
  name: string;
  description: string;
  category: 'verification' | 'settings' | 'reporting' | 'booking';
}

export interface UserRole {
  id: string;
  name: string;
  level: 'admin' | 'agent' | 'manager' | 'viewer';
  permissions: string[];
  paymentLimits: {
    maxVerificationAmount: number;
    maxDailyAmount: number;
    maxTransactionCount: number;
  };
  allowedPaymentMethods: string[];
  canCreateBookings: boolean;
  canRefundPayments: boolean;
  canViewAllTransactions: boolean;
}

export interface PaymentAgent {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: PaymentPermission[];
  
  // Verification stats
  verificationsToday: number;
  totalVerifications: number;
  verificationAccuracy: number;
  
  // Department & Specialization
  department: string;
  specializations: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  
  // Audit trail
  createdAt: Date;
  lastLogin: Date;
  createdBy: string;
}

export interface PaymentMethodConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  
  // Processing modes
  processingMode: 'auto' | 'manual' | 'hybrid' | 'agent_only';
  
  // Role-specific settings
  adminSettings: {
    autoApproveBelow: number;
    requireApprovalAbove: number;
    allowAgentVerification: boolean;
  };
  
  agentSettings: {
    canVerify: boolean;
    maxVerificationAmount: number;
    requiresSecondApproval: boolean;
    allowedAgentRoles: string[];
  };
  
  // Automation rules
  automationRules: {
    autoApproveConditions: Array<{
      condition: string;
      value: string | number | boolean;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    }>;
    manualReviewConditions: Array<{
      condition: string;
      value: string | number | boolean;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    }>;
  };
  
  // Security settings
  security: {
    requireTwoFactorAuth: boolean;
    ipWhitelist: string[];
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
}

export interface PaymentWorkflow {
  id: string;
  name: string;
  description: string;
  
  // Workflow steps
  steps: Array<{
    id: string;
    name: string;
    type: 'verification' | 'approval' | 'notification' | 'booking_creation';
    assignedRole: string;
    requiredPermissions: string[];
    automationConditions?: Array<{
      condition: string;
      value: string | number | boolean;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    }>;
  }>;
  
  // Escalation rules
  escalation: {
    timeoutMinutes: number;
    escalateTo: string; // role or specific user
    notificationChannels: string[];
  };
  
  // SLA settings
  sla: {
    maxProcessingTime: number;
    urgentThreshold: number;
    criticalThreshold: number;
  };
}

export interface PaymentAuditLog {
  id: string;
  transactionId: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  timestamp: Date;
  details: {
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  category: 'verification' | 'approval' | 'refund' | 'booking' | 'settings';
}
