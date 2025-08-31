import { PaymentTransaction } from '@/types/payment';
import { supabaseHelpers } from '@/lib/supabase';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  conditions: RuleCondition[];
  actions: RuleAction[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    executionCount: number;
    successRate: number;
    falsePositiveRate: number;
  };
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'matches_regex' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'auto_approve' | 'auto_decline' | 'require_manual_review' | 'escalate' | 'flag' | 'set_priority' | 'assign_agent' | 'request_documents' | 'send_notification';
  parameters: Record<string, any>;
}

export interface PreScreeningResult {
  decision: 'auto_approve' | 'auto_decline' | 'manual_review' | 'escalate';
  confidence: number;
  appliedRules: {
    ruleId: string;
    ruleName: string;
    confidence: number;
    action: string;
  }[];
  riskScore: number;
  flags: {
    type: 'warning' | 'alert' | 'critical';
    message: string;
    ruleId: string;
  }[];
  recommendations: string[];
  assignedAgent?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredDocuments: string[];
  estimatedProcessingTime: number;
}

export interface FraudDetectionResult {
  isFraudulent: boolean;
  riskScore: number;
  confidence: number;
  indicators: {
    type: 'velocity' | 'amount' | 'geographic' | 'behavioral' | 'device' | 'network';
    severity: 'low' | 'medium' | 'high';
    description: string;
    confidence: number;
  }[];
  recommendations: string[];
}

class PaymentAutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private fraudModel: any = null; // Would be ML model in production

  constructor() {
    this.initializeDefaultRules();
    this.loadCustomRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'low_amount_auto_approve',
        name: 'Low Amount Auto Approval',
        description: 'Automatically approve low-risk, low-amount transactions',
        enabled: true,
        priority: 10,
        conditions: [
          { field: 'amount', operator: 'less_equal', value: 1000 },
          { field: 'paymentMethod', operator: 'in', value: ['credit_card', 'debit_card', 'paypal'], logicalOperator: 'AND' },
          { field: 'customerRiskScore', operator: 'less_than', value: 30, logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'auto_approve', parameters: { reason: 'Low amount, low risk transaction' } },
          { type: 'send_notification', parameters: { type: 'customer', message: 'Payment approved automatically' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 95.5,
          falsePositiveRate: 2.1
        }
      },
      {
        id: 'high_amount_manual_review',
        name: 'High Amount Manual Review',
        description: 'Require manual review for high-amount transactions',
        enabled: true,
        priority: 20,
        conditions: [
          { field: 'amount', operator: 'greater_than', value: 50000 }
        ],
        actions: [
          { type: 'require_manual_review', parameters: { reason: 'High amount transaction requires verification' } },
          { type: 'set_priority', parameters: { priority: 'high' } },
          { type: 'assign_agent', parameters: { role: 'senior_agent' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 98.2,
          falsePositiveRate: 1.8
        }
      },
      {
        id: 'suspicious_velocity_flag',
        name: 'Suspicious Transaction Velocity',
        description: 'Flag transactions with suspicious velocity patterns',
        enabled: true,
        priority: 30,
        conditions: [
          { field: 'transactionVelocity24h', operator: 'greater_than', value: 5 },
          { field: 'totalAmount24h', operator: 'greater_than', value: 10000, logicalOperator: 'OR' }
        ],
        actions: [
          { type: 'flag', parameters: { type: 'alert', message: 'High transaction velocity detected' } },
          { type: 'require_manual_review', parameters: { reason: 'Suspicious transaction pattern' } },
          { type: 'request_documents', parameters: { documents: ['identity_proof', 'address_proof'] } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 87.3,
          falsePositiveRate: 12.7
        }
      },
      {
        id: 'manual_payment_enhanced_review',
        name: 'Manual Payment Enhanced Review',
        description: 'Enhanced review for manual payment methods',
        enabled: true,
        priority: 15,
        conditions: [
          { field: 'paymentMethod', operator: 'in', value: ['bank_transfer', 'cash'] }
        ],
        actions: [
          { type: 'require_manual_review', parameters: { reason: 'Manual payment method requires verification' } },
          { type: 'request_documents', parameters: { documents: ['payment_proof', 'bank_statement'] } },
          { type: 'set_priority', parameters: { priority: 'medium' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 94.1,
          falsePositiveRate: 5.9
        }
      },
      {
        id: 'new_customer_verification',
        name: 'New Customer Enhanced Verification',
        description: 'Additional verification for new customers',
        enabled: true,
        priority: 12,
        conditions: [
          { field: 'customerAge', operator: 'less_than', value: 30 }, // Days since registration
          { field: 'amount', operator: 'greater_than', value: 5000, logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'require_manual_review', parameters: { reason: 'New customer with high-value transaction' } },
          { type: 'request_documents', parameters: { documents: ['identity_proof', 'payment_proof'] } },
          { type: 'flag', parameters: { type: 'warning', message: 'New customer - verify identity' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 91.8,
          falsePositiveRate: 8.2
        }
      },
      {
        id: 'geographic_risk_check',
        name: 'Geographic Risk Assessment',
        description: 'Flag transactions from high-risk geographic locations',
        enabled: true,
        priority: 18,
        conditions: [
          { field: 'customerCountry', operator: 'in', value: ['high_risk_country_list'] },
          { field: 'amount', operator: 'greater_than', value: 2000, logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'flag', parameters: { type: 'alert', message: 'Transaction from high-risk geographic location' } },
          { type: 'require_manual_review', parameters: { reason: 'Geographic risk assessment required' } },
          { type: 'assign_agent', parameters: { role: 'fraud_specialist' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 89.4,
          falsePositiveRate: 10.6
        }
      },
      {
        id: 'vip_customer_fast_track',
        name: 'VIP Customer Fast Track',
        description: 'Fast-track processing for VIP customers',
        enabled: true,
        priority: 25,
        conditions: [
          { field: 'customerVIPStatus', operator: 'equals', value: true },
          { field: 'customerRiskScore', operator: 'less_than', value: 40, logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'set_priority', parameters: { priority: 'high' } },
          { type: 'assign_agent', parameters: { role: 'senior_agent' } },
          { type: 'send_notification', parameters: { type: 'customer', message: 'VIP fast-track processing initiated' } }
        ],
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          executionCount: 0,
          successRate: 99.1,
          falsePositiveRate: 0.9
        }
      }
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));
  }

  private async loadCustomRules(): Promise<void> {
    try {
      // In production, load from database
      const stored = localStorage.getItem('custom-automation-rules');
      if (stored) {
        const customRules = JSON.parse(stored);
        customRules.forEach((rule: AutomationRule) => {
          this.rules.set(rule.id, {
            ...rule,
            metadata: {
              ...rule.metadata,
              createdAt: new Date(rule.metadata.createdAt),
              lastModified: new Date(rule.metadata.lastModified)
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to load custom automation rules:', error);
    }
  }

  async preScreenTransaction(transaction: PaymentTransaction): Promise<PreScreeningResult> {
    // Enrich transaction data for rule evaluation
    const enrichedData = await this.enrichTransactionData(transaction);
    
    // Apply rules in priority order
    const applicableRules = this.getApplicableRules(enrichedData);
    const sortedRules = applicableRules.sort((a, b) => b.priority - a.priority);

    const result: PreScreeningResult = {
      decision: 'manual_review',
      confidence: 0,
      appliedRules: [],
      riskScore: 0,
      flags: [],
      recommendations: [],
      priority: 'medium',
      requiredDocuments: [],
      estimatedProcessingTime: 15
    };

    let highestConfidenceDecision = 'manual_review';
    let maxConfidence = 0;

    for (const rule of sortedRules) {
      const ruleResult = await this.evaluateRule(rule, enrichedData);
      
      if (ruleResult.matches) {
        // Update rule execution count
        rule.metadata.executionCount++;
        
        result.appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          confidence: ruleResult.confidence,
          action: rule.actions[0].type
        });

        // Process rule actions
        for (const action of rule.actions) {
          await this.processRuleAction(action, result, enrichedData);
        }

        // Update decision based on highest confidence rule
        if (ruleResult.confidence > maxConfidence) {
          maxConfidence = ruleResult.confidence;
          const primaryAction = rule.actions.find(a => 
            ['auto_approve', 'auto_decline', 'require_manual_review', 'escalate'].includes(a.type)
          );
          
          if (primaryAction) {
            highestConfidenceDecision = this.mapActionToDecision(primaryAction.type);
          }
        }
      }
    }

    result.decision = highestConfidenceDecision as any;
    result.confidence = maxConfidence;
    result.riskScore = this.calculateOverallRiskScore(enrichedData, result.appliedRules);

    // Add general recommendations
    result.recommendations.push(...this.generateRecommendations(result));

    return result;
  }

  private async enrichTransactionData(transaction: PaymentTransaction): Promise<any> {
    // In production, this would fetch additional data from various sources
    return {
      ...transaction,
      customerRiskScore: Math.random() * 100,
      customerAge: Math.floor(Math.random() * 365), // Days since registration
      customerVIPStatus: Math.random() > 0.9,
      transactionVelocity24h: Math.floor(Math.random() * 10),
      totalAmount24h: Math.random() * 50000,
      customerCountry: 'ET',
      deviceFingerprint: `device_${Math.random().toString(36).substr(2, 9)}`,
      ipAddress: '192.168.1.1',
      previousTransactionCount: Math.floor(Math.random() * 50),
      averageTransactionAmount: Math.random() * 10000,
      lastTransactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      accountVerificationLevel: Math.random() > 0.5 ? 'verified' : 'unverified'
    };
  }

  private getApplicableRules(enrichedData: any): AutomationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  private async evaluateRule(rule: AutomationRule, data: any): Promise<{ matches: boolean; confidence: number }> {
    let matches = true;
    let confidence = 100;

    for (let i = 0; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const conditionResult = this.evaluateCondition(condition, data);
      
      if (i === 0) {
        matches = conditionResult;
      } else {
        const logicalOp = rule.conditions[i - 1].logicalOperator || 'AND';
        if (logicalOp === 'AND') {
          matches = matches && conditionResult;
        } else {
          matches = matches || conditionResult;
        }
      }

      // Reduce confidence for each condition that doesn't match perfectly
      if (!conditionResult) {
        confidence *= 0.8;
      }
    }

    // Apply rule-specific confidence adjustments based on historical performance
    confidence *= (rule.metadata.successRate / 100);

    return { matches, confidence };
  }

  private evaluateCondition(condition: RuleCondition, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'greater_equal':
        return Number(fieldValue) >= Number(conditionValue);
      case 'less_equal':
        return Number(fieldValue) <= Number(conditionValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      case 'matches_regex':
        return new RegExp(conditionValue).test(String(fieldValue));
      case 'between':
        return Array.isArray(conditionValue) && 
               Number(fieldValue) >= Number(conditionValue[0]) && 
               Number(fieldValue) <= Number(conditionValue[1]);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async processRuleAction(action: RuleAction, result: PreScreeningResult, data: any): Promise<void> {
    switch (action.type) {
      case 'flag':
        result.flags.push({
          type: action.parameters.type || 'warning',
          message: action.parameters.message,
          ruleId: 'current_rule'
        });
        break;

      case 'set_priority':
        result.priority = action.parameters.priority;
        break;

      case 'assign_agent':
        result.assignedAgent = action.parameters.agent || action.parameters.role;
        break;

      case 'request_documents':
        if (action.parameters.documents) {
          result.requiredDocuments.push(...action.parameters.documents);
        }
        break;

      case 'send_notification':
        // In production, this would trigger actual notifications
        console.log(`Notification: ${action.parameters.message}`);
        break;
    }
  }

  private mapActionToDecision(actionType: string): string {
    const mapping: Record<string, string> = {
      'auto_approve': 'auto_approve',
      'auto_decline': 'auto_decline',
      'require_manual_review': 'manual_review',
      'escalate': 'escalate'
    };
    return mapping[actionType] || 'manual_review';
  }

  private calculateOverallRiskScore(data: any, appliedRules: any[]): number {
    let baseScore = data.customerRiskScore || 50;

    // Adjust based on transaction characteristics
    if (data.amount > 50000) baseScore += 20;
    else if (data.amount > 10000) baseScore += 10;
    else if (data.amount < 1000) baseScore -= 10;

    // Adjust based on payment method
    if (['bank_transfer', 'cash'].includes(data.paymentMethod)) baseScore += 15;
    else if (['credit_card', 'debit_card'].includes(data.paymentMethod)) baseScore -= 5;

    // Adjust based on customer history
    if (data.customerVIPStatus) baseScore -= 20;
    if (data.accountVerificationLevel === 'verified') baseScore -= 10;
    if (data.previousTransactionCount > 10) baseScore -= 5;

    // Adjust based on applied rules
    appliedRules.forEach(rule => {
      if (rule.action === 'flag') baseScore += 10;
      else if (rule.action === 'auto_approve') baseScore -= 15;
    });

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  private generateRecommendations(result: PreScreeningResult): string[] {
    const recommendations = [];

    if (result.riskScore > 70) {
      recommendations.push('Consider requiring additional identity verification');
      recommendations.push('Review customer transaction history carefully');
    }

    if (result.flags.some(f => f.type === 'critical')) {
      recommendations.push('Escalate to fraud specialist immediately');
    }

    if (result.requiredDocuments.length > 0) {
      recommendations.push(`Request the following documents: ${result.requiredDocuments.join(', ')}`);
    }

    if (result.decision === 'manual_review') {
      recommendations.push('Conduct thorough manual verification');
      recommendations.push('Verify payment proof authenticity');
    }

    return recommendations;
  }

  async detectFraud(transaction: PaymentTransaction): Promise<FraudDetectionResult> {
    // Simulate ML-based fraud detection
    const enrichedData = await this.enrichTransactionData(transaction);
    
    const indicators = [];
    let riskScore = 0;

    // Velocity-based detection
    if (enrichedData.transactionVelocity24h > 10) {
      indicators.push({
        type: 'velocity' as const,
        severity: 'high' as const,
        description: 'Unusually high transaction velocity in 24 hours',
        confidence: 85
      });
      riskScore += 30;
    }

    // Amount-based detection
    if (enrichedData.amount > enrichedData.averageTransactionAmount * 5) {
      indicators.push({
        type: 'amount' as const,
        severity: 'medium' as const,
        description: 'Transaction amount significantly higher than customer average',
        confidence: 70
      });
      riskScore += 20;
    }

    // Geographic anomalies
    const hourOfDay = new Date().getHours();
    if (hourOfDay < 6 || hourOfDay > 22) {
      indicators.push({
        type: 'behavioral' as const,
        severity: 'low' as const,
        description: 'Transaction initiated during unusual hours',
        confidence: 60
      });
      riskScore += 10;
    }

    // Device/Network analysis
    if (Math.random() > 0.9) { // Simulate rare device fingerprint anomaly
      indicators.push({
        type: 'device' as const,
        severity: 'high' as const,
        description: 'Suspicious device fingerprint detected',
        confidence: 90
      });
      riskScore += 35;
    }

    const isFraudulent = riskScore > 60;
    const confidence = Math.min(95, riskScore + Math.random() * 20);

    const recommendations = [];
    if (isFraudulent) {
      recommendations.push('Decline transaction immediately');
      recommendations.push('Flag customer account for review');
      recommendations.push('Report to fraud prevention team');
    } else if (riskScore > 30) {
      recommendations.push('Require additional verification');
      recommendations.push('Monitor customer activity closely');
    }

    return {
      isFraudulent,
      riskScore,
      confidence,
      indicators,
      recommendations
    };
  }

  // Rule Management Methods
  async createRule(rule: Omit<AutomationRule, 'id' | 'metadata'>): Promise<AutomationRule> {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AutomationRule = {
      ...rule,
      id,
      metadata: {
        createdBy: 'admin',
        createdAt: new Date(),
        lastModified: new Date(),
        executionCount: 0,
        successRate: 100,
        falsePositiveRate: 0
      }
    };

    this.rules.set(id, newRule);
    await this.saveCustomRules();
    return newRule;
  }

  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const rule = this.rules.get(id);
    if (!rule) {
      throw new Error('Rule not found');
    }

    const updatedRule = {
      ...rule,
      ...updates,
      id, // Ensure ID doesn't change
      metadata: {
        ...rule.metadata,
        lastModified: new Date()
      }
    };

    this.rules.set(id, updatedRule);
    await this.saveCustomRules();
    return updatedRule;
  }

  async deleteRule(id: string): Promise<void> {
    this.rules.delete(id);
    await this.saveCustomRules();
  }

  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  getRuleById(id: string): AutomationRule | undefined {
    return this.rules.get(id);
  }

  async testRule(ruleId: string, testData: any): Promise<{ matches: boolean; confidence: number; actions: string[] }> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    const result = await this.evaluateRule(rule, testData);
    const actions = rule.actions.map(a => a.type);

    return {
      matches: result.matches,
      confidence: result.confidence,
      actions
    };
  }

  private async saveCustomRules(): Promise<void> {
    try {
      const customRules = Array.from(this.rules.values()).filter(
        rule => !rule.id.startsWith('low_amount_') && 
                !rule.id.startsWith('high_amount_') &&
                !rule.id.startsWith('suspicious_') &&
                !rule.id.startsWith('manual_payment_') &&
                !rule.id.startsWith('new_customer_') &&
                !rule.id.startsWith('geographic_') &&
                !rule.id.startsWith('vip_customer_')
      );
      
      localStorage.setItem('custom-automation-rules', JSON.stringify(customRules));
    } catch (error) {
      console.error('Failed to save custom rules:', error);
    }
  }

  // Analytics and Reporting
  getRulePerformanceAnalytics(): any {
    const rules = Array.from(this.rules.values());
    
    return {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      totalExecutions: rules.reduce((sum, r) => sum + r.metadata.executionCount, 0),
      averageSuccessRate: rules.reduce((sum, r) => sum + r.metadata.successRate, 0) / rules.length,
      averageFalsePositiveRate: rules.reduce((sum, r) => sum + r.metadata.falsePositiveRate, 0) / rules.length,
      topPerformingRules: rules
        .sort((a, b) => b.metadata.successRate - a.metadata.successRate)
        .slice(0, 5)
        .map(r => ({ id: r.id, name: r.name, successRate: r.metadata.successRate })),
      mostUsedRules: rules
        .sort((a, b) => b.metadata.executionCount - a.metadata.executionCount)
        .slice(0, 5)
        .map(r => ({ id: r.id, name: r.name, executionCount: r.metadata.executionCount }))
    };
  }
}

export const paymentAutomationEngine = new PaymentAutomationEngine();
