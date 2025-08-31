// PCI DSS Compliance Service
// Handles payment card security, compliance monitoring, and audit requirements

export interface PCIRequirement {
  id: string;
  title: string;
  description: string;
  category: 'build' | 'maintain' | 'protect' | 'implement' | 'monitor' | 'test';
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence: string[];
  lastAudit: Date;
  nextReview: Date;
  responsible: string;
  notes?: string;
}

export interface SecurityMetrics {
  vulnerabilityScans: {
    last_scan: Date;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    status: 'pass' | 'fail';
  };
  penetrationTests: {
    last_test: Date;
    findings: number;
    status: 'pass' | 'fail';
  };
  networkMonitoring: {
    intrusion_attempts: number;
    blocked_ips: number;
    last_24h_alerts: number;
  };
  accessControls: {
    admin_accounts: number;
    privileged_access_reviews: Date;
    failed_logins_24h: number;
  };
}

export interface ComplianceReport {
  id: string;
  reportType: 'quarterly' | 'annual' | 'incident' | 'audit';
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  overallStatus: 'compliant' | 'non_compliant';
  requirements: PCIRequirement[];
  metrics: SecurityMetrics;
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  requirement: string;
  description: string;
  impact: string;
  remediation: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

class PCIComplianceService {
  private readonly PCI_REQUIREMENTS: PCIRequirement[] = [
    // Requirement 1: Install and maintain a firewall configuration
    {
      id: 'PCI-1',
      title: 'Install and maintain a firewall configuration to protect cardholder data',
      description: 'Firewalls are computer devices that control computer traffic allowed between an entity\'s networks and less-trusted networks.',
      category: 'build',
      status: 'compliant',
      evidence: [
        'Firewall configuration documentation',
        'Network diagram showing firewall placement',
        'Regular firewall rule reviews'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Infrastructure Team'
    },

    // Requirement 2: Do not use vendor-supplied defaults
    {
      id: 'PCI-2',
      title: 'Do not use vendor-supplied defaults for system passwords and other security parameters',
      description: 'Malicious individuals often use vendor default passwords and settings to compromise systems.',
      category: 'build',
      status: 'compliant',
      evidence: [
        'Password policy documentation',
        'System hardening checklists',
        'Default account audit reports'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Security Team'
    },

    // Requirement 3: Protect stored cardholder data
    {
      id: 'PCI-3',
      title: 'Protect stored cardholder data',
      description: 'Cardholder data must be protected with strong cryptography and proper key management.',
      category: 'protect',
      status: 'compliant',
      evidence: [
        'Data encryption standards',
        'Key management procedures',
        'Data retention policies'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Development Team',
      notes: 'Using Stripe for payment processing - no cardholder data stored locally'
    },

    // Requirement 4: Encrypt transmission of cardholder data
    {
      id: 'PCI-4',
      title: 'Encrypt transmission of cardholder data across open, public networks',
      description: 'Sensitive information must be encrypted during transmission over networks that are easily accessed by malicious individuals.',
      category: 'protect',
      status: 'compliant',
      evidence: [
        'TLS/SSL configuration',
        'Network encryption protocols',
        'Secure transmission verification'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Infrastructure Team'
    },

    // Requirement 5: Protect all systems against malware
    {
      id: 'PCI-5',
      title: 'Protect all systems against malware and regularly update anti-virus software or programs',
      description: 'Malicious software can be introduced through many business processes.',
      category: 'maintain',
      status: 'compliant',
      evidence: [
        'Anti-virus deployment records',
        'Malware scanning reports',
        'Update management logs'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'IT Operations'
    },

    // Requirement 6: Develop and maintain secure systems and applications
    {
      id: 'PCI-6',
      title: 'Develop and maintain secure systems and applications',
      description: 'Security vulnerabilities in systems and applications may allow criminals to access PCI DSS system components.',
      category: 'build',
      status: 'partial',
      evidence: [
        'Secure coding guidelines',
        'Code review processes',
        'Vulnerability assessment reports'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Development Team',
      notes: 'Additional penetration testing scheduled'
    },

    // Requirement 7: Restrict access to cardholder data by business need to know
    {
      id: 'PCI-7',
      title: 'Restrict access to cardholder data by business need to know',
      description: 'Access to systems and cardholder data should be limited to only those individuals whose job requires such access.',
      category: 'implement',
      status: 'compliant',
      evidence: [
        'Access control policies',
        'Role-based access documentation',
        'Regular access reviews'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Security Team'
    },

    // Requirement 8: Identify and authenticate access to system components
    {
      id: 'PCI-8',
      title: 'Identify and authenticate access to system components',
      description: 'Assigning a unique identification to each person with access ensures accountability for actions taken.',
      category: 'implement',
      status: 'compliant',
      evidence: [
        'User account management procedures',
        'Multi-factor authentication implementation',
        'Identity verification processes'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Identity Management Team'
    },

    // Requirement 9: Restrict physical access to cardholder data
    {
      id: 'PCI-9',
      title: 'Restrict physical access to cardholder data',
      description: 'Physical access to information or systems that house cardholder data provides the opportunity for individuals to access devices or data.',
      category: 'implement',
      status: 'not_applicable',
      evidence: [
        'Cloud-based infrastructure documentation',
        'AWS security certifications'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Infrastructure Team',
      notes: 'Using cloud infrastructure - physical access managed by cloud provider'
    },

    // Requirement 10: Track and monitor all access to network resources and cardholder data
    {
      id: 'PCI-10',
      title: 'Track and monitor all access to network resources and cardholder data',
      description: 'Logging mechanisms and the ability to track user activities are critical in preventing, detecting, or minimizing the impact of a data compromise.',
      category: 'monitor',
      status: 'partial',
      evidence: [
        'Audit log configuration',
        'Log monitoring procedures',
        'Security event correlation'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Security Operations',
      notes: 'Enhanced monitoring tools being implemented'
    },

    // Requirement 11: Regularly test security systems and processes
    {
      id: 'PCI-11',
      title: 'Regularly test security systems and processes',
      description: 'Vulnerabilities are being discovered continually by malicious individuals and researchers.',
      category: 'test',
      status: 'partial',
      evidence: [
        'Vulnerability scan schedules',
        'Penetration test reports',
        'Security testing procedures'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'Security Team',
      notes: 'Quarterly penetration testing in progress'
    },

    // Requirement 12: Maintain a policy that addresses information security
    {
      id: 'PCI-12',
      title: 'Maintain a policy that addresses information security for all personnel',
      description: 'A strong security policy sets the security tone for the whole entity and informs personnel what is expected of them.',
      category: 'maintain',
      status: 'compliant',
      evidence: [
        'Information security policy',
        'Employee security training records',
        'Security awareness programs'
      ],
      lastAudit: new Date('2024-01-15'),
      nextReview: new Date('2024-04-15'),
      responsible: 'CISO'
    }
  ];

  // Get all PCI requirements
  getRequirements(): PCIRequirement[] {
    return this.PCI_REQUIREMENTS;
  }

  // Get requirements by category
  getRequirementsByCategory(category: PCIRequirement['category']): PCIRequirement[] {
    return this.PCI_REQUIREMENTS.filter(req => req.category === category);
  }

  // Get compliance status overview
  getComplianceOverview(): {
    total: number;
    compliant: number;
    partial: number;
    non_compliant: number;
    not_applicable: number;
    percentage: number;
  } {
    const total = this.PCI_REQUIREMENTS.length;
    const compliant = this.PCI_REQUIREMENTS.filter(req => req.status === 'compliant').length;
    const partial = this.PCI_REQUIREMENTS.filter(req => req.status === 'partial').length;
    const non_compliant = this.PCI_REQUIREMENTS.filter(req => req.status === 'non_compliant').length;
    const not_applicable = this.PCI_REQUIREMENTS.filter(req => req.status === 'not_applicable').length;
    
    // Calculate percentage (excluding not_applicable)
    const applicable = total - not_applicable;
    const percentage = applicable > 0 ? Math.round((compliant / applicable) * 100) : 100;

    return {
      total,
      compliant,
      partial,
      non_compliant,
      not_applicable,
      percentage
    };
  }

  // Generate security metrics
  generateSecurityMetrics(): SecurityMetrics {
    return {
      vulnerabilityScans: {
        last_scan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        high_risks: 0,
        medium_risks: 2,
        low_risks: 5,
        status: 'pass'
      },
      penetrationTests: {
        last_test: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        findings: 3,
        status: 'pass'
      },
      networkMonitoring: {
        intrusion_attempts: 12,
        blocked_ips: 8,
        last_24h_alerts: 2
      },
      accessControls: {
        admin_accounts: 3,
        privileged_access_reviews: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        failed_logins_24h: 5
      }
    };
  }

  // Generate compliance report
  generateComplianceReport(reportType: ComplianceReport['reportType'] = 'quarterly'): ComplianceReport {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // Last quarter
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0); // End of last month

    const overview = this.getComplianceOverview();
    const overallStatus = overview.percentage >= 95 ? 'compliant' : 'non_compliant';

    return {
      id: this.generateReportId(),
      reportType,
      generatedAt: now,
      period: {
        start: startDate,
        end: endDate
      },
      overallStatus,
      requirements: this.PCI_REQUIREMENTS,
      metrics: this.generateSecurityMetrics(),
      findings: this.generateFindings(),
      recommendations: this.generateRecommendations()
    };
  }

  // Generate compliance findings
  private generateFindings(): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    // Check for partial or non-compliant requirements
    this.PCI_REQUIREMENTS.forEach(req => {
      if (req.status === 'partial' || req.status === 'non_compliant') {
        findings.push({
          id: `finding_${req.id}_${Date.now()}`,
          severity: req.status === 'non_compliant' ? 'high' : 'medium',
          requirement: req.id,
          description: `Requirement ${req.id} is ${req.status.replace('_', ' ')}`,
          impact: this.getImpactForRequirement(req.id),
          remediation: this.getRemediationForRequirement(req.id),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'open'
        });
      }
    });

    return findings;
  }

  // Generate recommendations
  private generateRecommendations(): string[] {
    const recommendations = [];
    const overview = this.getComplianceOverview();

    if (overview.partial > 0) {
      recommendations.push('Complete implementation of partially compliant requirements');
    }

    if (overview.non_compliant > 0) {
      recommendations.push('Address all non-compliant requirements immediately');
    }

    recommendations.push('Conduct regular penetration testing');
    recommendations.push('Implement continuous vulnerability monitoring');
    recommendations.push('Enhance security awareness training');
    recommendations.push('Review and update security policies annually');

    return recommendations;
  }

  // Get payment security checklist
  getPaymentSecurityChecklist(): Array<{
    item: string;
    status: 'complete' | 'incomplete' | 'not_applicable';
    description: string;
  }> {
    return [
      {
        item: 'Use secure payment processor (Stripe)',
        status: 'complete',
        description: 'All payments processed through PCI-compliant Stripe platform'
      },
      {
        item: 'Never store cardholder data',
        status: 'complete',
        description: 'No credit card data stored in application database'
      },
      {
        item: 'Use HTTPS for all payment pages',
        status: 'complete',
        description: 'SSL/TLS encryption enforced on all payment forms'
      },
      {
        item: 'Implement CSP headers',
        status: 'complete',
        description: 'Content Security Policy prevents XSS attacks'
      },
      {
        item: 'Validate all payment inputs',
        status: 'complete',
        description: 'Client and server-side validation on payment forms'
      },
      {
        item: 'Log payment transactions',
        status: 'complete',
        description: 'All payment attempts logged for audit purposes'
      },
      {
        item: 'Monitor for fraud',
        status: 'complete',
        description: 'Stripe Radar provides fraud detection'
      },
      {
        item: 'Regular security scans',
        status: 'incomplete',
        description: 'Quarterly vulnerability assessments required'
      },
      {
        item: 'PCI DSS certification',
        status: 'incomplete',
        description: 'Annual PCI DSS assessment and certification'
      }
    ];
  }

  // Get security controls status
  getSecurityControlsStatus(): Array<{
    control: string;
    implemented: boolean;
    description: string;
    evidence?: string;
  }> {
    return [
      {
        control: 'Network Segmentation',
        implemented: true,
        description: 'Payment processing isolated from other systems',
        evidence: 'Cloud infrastructure with VPC isolation'
      },
      {
        control: 'Access Controls',
        implemented: true,
        description: 'Role-based access to payment systems',
        evidence: 'RBAC implementation with 2FA'
      },
      {
        control: 'Encryption at Rest',
        implemented: true,
        description: 'All sensitive data encrypted in database',
        evidence: 'Database encryption configuration'
      },
      {
        control: 'Encryption in Transit',
        implemented: true,
        description: 'TLS 1.3 for all communications',
        evidence: 'SSL/TLS configuration'
      },
      {
        control: 'Vulnerability Management',
        implemented: true,
        description: 'Regular vulnerability scans and patching',
        evidence: 'Automated scanning reports'
      },
      {
        control: 'Incident Response',
        implemented: true,
        description: 'Security incident response procedures',
        evidence: 'Incident response playbook'
      },
      {
        control: 'Audit Logging',
        implemented: true,
        description: 'Comprehensive audit trail for all activities',
        evidence: 'Centralized logging system'
      },
      {
        control: 'Penetration Testing',
        implemented: false,
        description: 'Annual penetration testing required',
        evidence: 'Schedule quarterly penetration tests'
      }
    ];
  }

  // Update requirement status
  updateRequirementStatus(requirementId: string, status: PCIRequirement['status'], notes?: string): boolean {
    const requirement = this.PCI_REQUIREMENTS.find(req => req.id === requirementId);
    if (requirement) {
      requirement.status = status;
      requirement.lastAudit = new Date();
      requirement.nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      if (notes) {
        requirement.notes = notes;
      }
      return true;
    }
    return false;
  }

  // Get audit timeline
  getAuditTimeline(): Array<{
    date: Date;
    event: string;
    type: 'assessment' | 'certification' | 'scan' | 'test';
    status: 'completed' | 'scheduled' | 'overdue';
  }> {
    const now = new Date();
    return [
      {
        date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        event: 'Quarterly Vulnerability Scan',
        type: 'scan',
        status: 'completed'
      },
      {
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        event: 'Monthly Security Review',
        type: 'assessment',
        status: 'scheduled'
      },
      {
        date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        event: 'Penetration Testing',
        type: 'test',
        status: 'scheduled'
      },
      {
        date: new Date(now.getFullYear(), now.getMonth() + 2, 15),
        event: 'Annual PCI DSS Assessment',
        type: 'certification',
        status: 'scheduled'
      }
    ];
  }

  // Private helper methods
  private generateReportId(): string {
    return `PCI_${  Date.now().toString(36)  }${Math.random().toString(36).substr(2, 9)}`;
  }

  private getImpactForRequirement(requirementId: string): string {
    const impacts: Record<string, string> = {
      'PCI-6': 'Potential security vulnerabilities in application code',
      'PCI-10': 'Limited ability to detect and respond to security incidents',
      'PCI-11': 'Unknown security vulnerabilities may exist'
    };
    return impacts[requirementId] || 'Compliance requirement not fully met';
  }

  private getRemediationForRequirement(requirementId: string): string {
    const remediations: Record<string, string> = {
      'PCI-6': 'Complete security code review and implement additional testing',
      'PCI-10': 'Deploy enhanced monitoring and SIEM solution',
      'PCI-11': 'Schedule and complete penetration testing'
    };
    return remediations[requirementId] || 'Review and complete requirement implementation';
  }

  // Export compliance data
  exportComplianceData(): string {
    const data = {
      overview: this.getComplianceOverview(),
      requirements: this.getRequirements(),
      metrics: this.generateSecurityMetrics(),
      checklist: this.getPaymentSecurityChecklist(),
      controls: this.getSecurityControlsStatus(),
      audit_timeline: this.getAuditTimeline(),
      generated_at: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Generate SAQ (Self-Assessment Questionnaire) data
  generateSAQ(): {
    type: string;
    description: string;
    questions: Array<{
      id: string;
      question: string;
      answer: 'yes' | 'no' | 'not_applicable';
      evidence?: string;
      notes?: string;
    }>;
  } {
    return {
      type: 'SAQ A-EP',
      description: 'E-commerce merchants who outsource payment processing to PCI DSS validated third parties',
      questions: [
        {
          id: 'SAQ-1',
          question: 'Do you only use PCI DSS validated payment processors for cardholder data processing?',
          answer: 'yes',
          evidence: 'Stripe PCI DSS Level 1 certification',
          notes: 'All payments processed through Stripe'
        },
        {
          id: 'SAQ-2',
          question: 'Do you store, process, or transmit cardholder data on your systems?',
          answer: 'no',
          evidence: 'Application architecture review',
          notes: 'No cardholder data stored or processed locally'
        },
        {
          id: 'SAQ-3',
          question: 'Are all payment pages served over HTTPS with valid SSL certificates?',
          answer: 'yes',
          evidence: 'SSL certificate configuration',
          notes: 'TLS 1.3 enforced on all payment pages'
        },
        {
          id: 'SAQ-4',
          question: 'Do you have a documented incident response plan?',
          answer: 'yes',
          evidence: 'Security incident response procedures',
          notes: 'Plan reviewed and updated quarterly'
        }
      ]
    };
  }
}

// Export singleton instance
export const pciCompliance = new PCIComplianceService();

// Helper functions
export function getComplianceStatus(): {
  percentage: number;
  status: 'compliant' | 'non_compliant';
} {
  const overview = pciCompliance.getComplianceOverview();
  return {
    percentage: overview.percentage,
    status: overview.percentage >= 95 ? 'compliant' : 'non_compliant'
  };
}

export function generateComplianceReport(): ComplianceReport {
  return pciCompliance.generateComplianceReport();
}

export function exportComplianceData(): void {
  const data = pciCompliance.exportComplianceData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pci-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
