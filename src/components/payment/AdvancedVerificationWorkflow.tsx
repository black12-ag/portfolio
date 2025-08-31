import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  User,
  Users,
  TrendingUp,
  Eye,
  MessageSquare,
  FileText,
  Camera,
  Phone,
  Mail,
  Zap,
  Target,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Flag,
  Calendar,
  DollarSign
} from 'lucide-react';
import { PaymentTransaction } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VerificationStep {
  id: string;
  name: string;
  description: string;
  type: 'initial_review' | 'risk_assessment' | 'document_verification' | 'amount_verification' | 'fraud_check' | 'final_approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assignedTo?: string;
  assignedRole: 'payment_agent' | 'senior_agent' | 'payment_manager' | 'fraud_specialist';
  requiredPermissions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number; // in minutes
  actualTime?: number;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  evidence?: string[];
  decision?: 'approve' | 'decline' | 'escalate' | 'request_info';
  confidence?: number; // 0-100
}

interface RiskAssessment {
  overallScore: number;
  factors: {
    amountRisk: number;
    customerRisk: number;
    paymentMethodRisk: number;
    geographicRisk: number;
    behaviorRisk: number;
    documentRisk: number;
  };
  flags: {
    id: string;
    type: 'warning' | 'alert' | 'critical';
    message: string;
    confidence: number;
  }[];
  recommendations: string[];
}

interface VerificationWorkflow {
  id: string;
  transactionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: VerificationStep[];
  currentStepIndex: number;
  riskAssessment: RiskAssessment;
  assignedAgents: string[];
  slaDeadline: Date;
  escalationHistory: {
    timestamp: Date;
    from: string;
    to: string;
    reason: string;
  }[];
  customerCommunication: {
    timestamp: Date;
    type: 'email' | 'sms' | 'push' | 'call';
    message: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface AdvancedVerificationWorkflowProps {
  transaction: PaymentTransaction;
  onWorkflowComplete: (decision: 'approved' | 'declined', notes?: string) => void;
  onEscalate: (reason: string, toRole: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  className?: string;
}

const AdvancedVerificationWorkflow: React.FC<AdvancedVerificationWorkflowProps> = ({
  transaction,
  onWorkflowComplete,
  onEscalate,
  currentUser,
  className
}) => {
  const [workflow, setWorkflow] = useState<VerificationWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStepNotes, setCurrentStepNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeWorkflow();
  }, [transaction]);

  const initializeWorkflow = () => {
    const riskScore = calculateRiskScore(transaction);
    const steps = generateWorkflowSteps(transaction, riskScore);
    
    const newWorkflow: VerificationWorkflow = {
      id: `workflow_${Date.now()}`,
      transactionId: transaction.id,
      status: 'pending',
      priority: riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      steps,
      currentStepIndex: 0,
      riskAssessment: {
        overallScore: riskScore,
        factors: {
          amountRisk: transaction.amount > 10000 ? 80 : transaction.amount > 5000 ? 50 : 20,
          customerRisk: 30, // Would be calculated based on customer history
          paymentMethodRisk: transaction.paymentMethod === 'bank_transfer' ? 60 : 30,
          geographicRisk: 25,
          behaviorRisk: 20,
          documentRisk: 40
        },
        flags: generateRiskFlags(transaction, riskScore),
        recommendations: generateRecommendations(transaction, riskScore)
      },
      assignedAgents: [currentUser.id],
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      escalationHistory: [],
      customerCommunication: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setWorkflow(newWorkflow);
  };

  const calculateRiskScore = (tx: PaymentTransaction): number => {
    let score = 0;
    
    // Amount-based risk
    if (tx.amount > 50000) score += 30;
    else if (tx.amount > 10000) score += 20;
    else if (tx.amount > 5000) score += 10;
    
    // Payment method risk
    if (tx.paymentMethod === 'bank_transfer' || tx.paymentMethod === 'cash') score += 25;
    else if (tx.paymentMethod === 'telebirr' || tx.paymentMethod === 'cbebe') score += 15;
    
    // Time-based risk (late night transactions)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 15;
    
    // Randomize other factors for demo
    score += Math.random() * 20;
    
    return Math.min(Math.round(score), 100);
  };

  const generateWorkflowSteps = (tx: PaymentTransaction, riskScore: number): VerificationStep[] => {
    const baseSteps: VerificationStep[] = [
      {
        id: 'initial_review',
        name: 'Initial Review',
        description: 'Basic transaction validation and document check',
        type: 'initial_review',
        status: 'pending',
        assignedRole: 'payment_agent',
        requiredPermissions: ['verify_payments'],
        priority: 'medium',
        estimatedTime: 5
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        description: 'Automated and manual risk evaluation',
        type: 'risk_assessment',
        status: 'pending',
        assignedRole: 'payment_agent',
        requiredPermissions: ['assess_risk'],
        priority: riskScore > 50 ? 'high' : 'medium',
        estimatedTime: 10
      }
    ];

    // Add document verification for high-risk transactions
    if (riskScore > 40 || tx.amount > 5000) {
      baseSteps.push({
        id: 'document_verification',
        name: 'Document Verification',
        description: 'Verify uploaded payment proofs and documents',
        type: 'document_verification',
        status: 'pending',
        assignedRole: 'payment_agent',
        requiredPermissions: ['verify_documents'],
        priority: 'high',
        estimatedTime: 15
      });
    }

    // Add fraud check for very high-risk transactions
    if (riskScore > 60) {
      baseSteps.push({
        id: 'fraud_check',
        name: 'Fraud Investigation',
        description: 'Detailed fraud analysis and investigation',
        type: 'fraud_check',
        status: 'pending',
        assignedRole: 'fraud_specialist',
        requiredPermissions: ['investigate_fraud'],
        priority: 'critical',
        estimatedTime: 30
      });
    }

    // Add final approval step
    baseSteps.push({
      id: 'final_approval',
      name: 'Final Approval',
      description: 'Final decision on transaction approval',
      type: 'final_approval',
      status: 'pending',
      assignedRole: riskScore > 70 || tx.amount > 10000 ? 'payment_manager' : 'senior_agent',
      requiredPermissions: ['approve_payments'],
      priority: 'high',
      estimatedTime: 5
    });

    return baseSteps;
  };

  const generateRiskFlags = (tx: PaymentTransaction, riskScore: number) => {
    const flags = [];

    if (tx.amount > 10000) {
      flags.push({
        id: 'high_amount',
        type: 'warning' as const,
        message: 'High transaction amount requires additional verification',
        confidence: 90
      });
    }

    if (tx.paymentMethod === 'bank_transfer') {
      flags.push({
        id: 'manual_payment',
        type: 'alert' as const,
        message: 'Manual payment method - verify bank details carefully',
        confidence: 85
      });
    }

    if (riskScore > 70) {
      flags.push({
        id: 'high_risk',
        type: 'critical' as const,
        message: 'High-risk transaction - requires manager approval',
        confidence: riskScore
      });
    }

    return flags;
  };

  const generateRecommendations = (tx: PaymentTransaction, riskScore: number) => {
    const recommendations = [];

    if (riskScore > 50) {
      recommendations.push('Request additional documentation from customer');
      recommendations.push('Verify customer identity through secondary channels');
    }

    if (tx.amount > 5000) {
      recommendations.push('Contact customer to confirm transaction details');
    }

    if (tx.paymentMethod === 'bank_transfer') {
      recommendations.push('Verify bank account ownership');
      recommendations.push('Check transaction reference against bank statement');
    }

    recommendations.push('Review customer transaction history');
    recommendations.push('Check for any previous fraud indicators');

    return recommendations;
  };

  const processCurrentStep = async (decision: 'approve' | 'decline' | 'escalate' | 'request_info') => {
    if (!workflow) return;

    setIsProcessing(true);
    const currentStep = workflow.steps[workflow.currentStepIndex];

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedStep: VerificationStep = {
        ...currentStep,
        status: decision === 'approve' ? 'completed' : decision === 'decline' ? 'failed' : 'completed',
        decision,
        notes: currentStepNotes,
        completedAt: new Date(),
        actualTime: currentStep.startedAt 
          ? Math.round((Date.now() - currentStep.startedAt.getTime()) / 60000)
          : currentStep.estimatedTime,
        confidence: decision === 'approve' ? 85 + Math.random() * 15 : 60 + Math.random() * 20
      };

      const updatedSteps = [...workflow.steps];
      updatedSteps[workflow.currentStepIndex] = updatedStep;

      if (decision === 'escalate') {
        // Handle escalation
        onEscalate(currentStepNotes, 'payment_manager');
        return;
      }

      if (decision === 'decline') {
        // Complete workflow with decline
        setWorkflow({
          ...workflow,
          status: 'completed',
          steps: updatedSteps,
          updatedAt: new Date()
        });
        onWorkflowComplete('declined', currentStepNotes);
        return;
      }

      if (workflow.currentStepIndex === workflow.steps.length - 1) {
        // Last step completed
        setWorkflow({
          ...workflow,
          status: 'completed',
          steps: updatedSteps,
          updatedAt: new Date()
        });
        onWorkflowComplete('approved', currentStepNotes);
      } else {
        // Move to next step
        const nextStepIndex = workflow.currentStepIndex + 1;
        const nextStep = updatedSteps[nextStepIndex];
        nextStep.status = 'in_progress';
        nextStep.startedAt = new Date();

        setWorkflow({
          ...workflow,
          currentStepIndex: nextStepIndex,
          steps: updatedSteps,
          status: 'in_progress',
          updatedAt: new Date()
        });
      }

      setCurrentStepNotes('');
      
      toast({
        title: "Step Completed",
        description: `${currentStep.name} has been ${decision === 'approve' ? 'approved' : 'processed'}.`,
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process verification step. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { color: 'bg-gray-100 text-gray-800', icon: null },
      medium: { color: 'bg-blue-100 text-blue-800', icon: null },
      high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: Flag }
    };

    const { color, icon: Icon } = config[priority as keyof typeof config];

    return (
      <Badge className={color}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeRemaining = (deadline: Date) => {
    const remaining = deadline.getTime() - Date.now();
    if (remaining <= 0) return 'Overdue';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (!workflow) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing verification workflow...</p>
        </CardContent>
      </Card>
    );
  }

  const currentStep = workflow.steps[workflow.currentStepIndex];
  const canProcessStep = currentUser.permissions.some(p => 
    currentStep?.requiredPermissions.includes(p)
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Verification Workflow</span>
              {getPriorityBadge(workflow.priority)}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{getTimeRemaining(workflow.slaDeadline)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Step {workflow.currentStepIndex + 1} of {workflow.steps.length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Workflow Progress</span>
              <span>{Math.round((workflow.currentStepIndex / workflow.steps.length) * 100)}%</span>
            </div>
            <Progress 
              value={(workflow.currentStepIndex / workflow.steps.length) * 100} 
              className="h-2"
            />
          </div>

          {/* Risk Assessment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn("text-2xl font-bold p-3 rounded-lg", getRiskColor(workflow.riskAssessment.overallScore))}>
                {workflow.riskAssessment.overallScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Risk Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workflow.riskAssessment.flags.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Risk Flags</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {workflow.steps.filter(s => s.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Steps Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Step */}
          {currentStep && workflow.status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {workflow.currentStepIndex + 1}
                  </div>
                  <span>{currentStep.name}</span>
                  {getPriorityBadge(currentStep.priority)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Assigned Role:</span>
                    <span className="ml-2 font-medium capitalize">{currentStep.assignedRole.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="ml-2 font-medium">{formatTime(currentStep.estimatedTime)}</span>
                  </div>
                </div>

                {canProcessStep ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Verification Notes</label>
                      <Textarea
                        placeholder="Add your notes about this verification step..."
                        value={currentStepNotes}
                        onChange={(e) => setCurrentStepNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => processCurrentStep('approve')}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Step
                      </Button>
                      <Button
                        onClick={() => processCurrentStep('decline')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        onClick={() => processCurrentStep('escalate')}
                        disabled={isProcessing}
                        variant="outline"
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Escalate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      You don't have permission to process this step. It requires: {currentStep.requiredPermissions.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Workflow Completed */}
          {workflow.status === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Workflow Completed!</strong> All verification steps have been processed successfully.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          {workflow.steps.map((step, index) => (
            <Card key={step.id} className={cn(
              "transition-all",
              index === workflow.currentStepIndex && "ring-2 ring-primary/20",
              step.status === 'completed' && "bg-green-50 border-green-200",
              step.status === 'failed' && "bg-red-50 border-red-200"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      step.status === 'completed' ? "bg-green-100 text-green-600" :
                      step.status === 'failed' ? "bg-red-100 text-red-600" :
                      step.status === 'in_progress' ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                       step.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                       index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.notes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">{step.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {step.assignedRole.replace('_', ' ')}
                    </Badge>
                    {step.actualTime && (
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(step.actualTime)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(workflow.riskAssessment.factors).map(([factor, score]) => (
                  <div key={factor} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{factor.replace('Risk', ' Risk')}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Flags ({workflow.riskAssessment.flags.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.riskAssessment.flags.map((flag) => (
                  <Alert key={flag.id} variant={flag.type === 'critical' ? 'destructive' : 'default'}>
                    <Flag className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <span>{flag.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {flag.confidence}% confidence
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {workflow.riskAssessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {workflow.createdAt.toLocaleString()}
                  </span>
                  <span>Workflow created</span>
                </div>
                
                {workflow.steps.filter(s => s.completedAt).map((step) => (
                  <div key={step.id} className="flex items-center space-x-3 text-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      step.status === 'completed' ? "bg-green-600" : "bg-red-600"
                    )}></div>
                    <span className="text-muted-foreground">
                      {step.completedAt?.toLocaleString()}
                    </span>
                    <span>{step.name} {step.status === 'completed' ? 'completed' : 'failed'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedVerificationWorkflow;
