import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Queue,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Target,
  Zap,
  Award,
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  ArrowRight,
  ArrowUp,
  Flag,
  Shield,
  Timer,
  User,
  Settings
} from 'lucide-react';
import { PaymentTransaction } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  transaction: PaymentTransaction;
  priority: 'low' | 'medium' | 'high' | 'critical';
  waitTime: number; // in minutes
  estimatedProcessingTime: number;
  riskScore: number;
  assignedAgent?: string;
  slaDeadline: Date;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    vipStatus: boolean;
    previousTransactions: number;
  };
  flags: {
    type: 'warning' | 'alert' | 'info';
    message: string;
  }[];
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentWorkload: number;
  maxCapacity: number;
  todayStats: {
    processed: number;
    approved: number;
    declined: number;
    escalated: number;
    avgProcessingTime: number;
    accuracy: number;
  };
  weekStats: {
    processed: number;
    avgProcessingTime: number;
    accuracy: number;
  };
  specializations: string[];
  certifications: string[];
  shiftEnd: Date;
}

interface PaymentAgentDashboardProps {
  agentId: string;
  agentRole: 'payment_agent' | 'senior_agent' | 'payment_manager';
  permissions: string[];
  className?: string;
}

const PaymentAgentDashboard: React.FC<PaymentAgentDashboardProps> = ({
  agentId,
  agentRole,
  permissions,
  className
}) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [myQueue, setMyQueue] = useState<QueueItem[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<AgentPerformance[]>([]);
  const [myPerformance, setMyPerformance] = useState<AgentPerformance | null>(null);
  const [activeTab, setActiveTab] = useState('my-queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load queue data
      const transactions = paymentService.getPendingTransactions();
      const queueItems = await Promise.all(transactions.map(generateQueueItem));
      
      // Separate my queue from team queue
      const myItems = queueItems.filter(item => item.assignedAgent === agentId);
      const teamItems = queueItems.filter(item => !item.assignedAgent || item.assignedAgent !== agentId);
      
      setMyQueue(myItems);
      setQueue(teamItems);
      
      // Load performance data
      const performance = generateAgentPerformance(agentId);
      const teamPerf = generateTeamPerformance();
      
      setMyPerformance(performance);
      setTeamPerformance(teamPerf);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQueueItem = async (transaction: PaymentTransaction): Promise<QueueItem> => {
    const riskScore = calculateRiskScore(transaction);
    const priority = riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'medium' : 'low';
    const waitTime = Math.floor((Date.now() - transaction.createdAt.getTime()) / 60000);
    
    return {
      id: transaction.id,
      transaction,
      priority,
      waitTime,
      estimatedProcessingTime: priority === 'critical' ? 45 : priority === 'high' ? 30 : priority === 'medium' ? 20 : 15,
      riskScore,
      assignedAgent: Math.random() > 0.6 ? agentId : undefined,
      slaDeadline: new Date(transaction.createdAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      customerInfo: {
        name: `Customer ${transaction.userId.slice(-4)}`,
        email: `customer${transaction.userId.slice(-4)}@example.com`,
        phone: `+251 9 ${Math.random().toString().slice(2, 10)}`,
        vipStatus: Math.random() > 0.8,
        previousTransactions: Math.floor(Math.random() * 20)
      },
      flags: generateFlags(transaction, riskScore)
    };
  };

  const calculateRiskScore = (transaction: PaymentTransaction): number => {
    let score = 0;
    if (transaction.amount > 50000) score += 30;
    else if (transaction.amount > 10000) score += 20;
    else if (transaction.amount > 5000) score += 10;
    
    if (transaction.paymentMethod === 'bank_transfer' || transaction.paymentMethod === 'cash') score += 25;
    score += Math.random() * 30;
    
    return Math.min(Math.round(score), 100);
  };

  const generateFlags = (transaction: PaymentTransaction, riskScore: number) => {
    const flags = [];
    
    if (transaction.amount > 10000) {
      flags.push({
        type: 'warning' as const,
        message: 'High amount transaction'
      });
    }
    
    if (riskScore > 60) {
      flags.push({
        type: 'alert' as const,
        message: 'High risk score'
      });
    }
    
    if (transaction.paymentMethod === 'bank_transfer') {
      flags.push({
        type: 'info' as const,
        message: 'Manual payment method'
      });
    }
    
    return flags;
  };

  const generateAgentPerformance = (agentId: string): AgentPerformance => {
    return {
      agentId,
      agentName: 'John Agent',
      status: 'online',
      currentWorkload: Math.floor(Math.random() * 8) + 2,
      maxCapacity: 10,
      todayStats: {
        processed: Math.floor(Math.random() * 20) + 15,
        approved: Math.floor(Math.random() * 15) + 12,
        declined: Math.floor(Math.random() * 3) + 1,
        escalated: Math.floor(Math.random() * 2),
        avgProcessingTime: Math.floor(Math.random() * 10) + 15,
        accuracy: 85 + Math.random() * 10
      },
      weekStats: {
        processed: Math.floor(Math.random() * 100) + 80,
        avgProcessingTime: Math.floor(Math.random() * 5) + 18,
        accuracy: 87 + Math.random() * 8
      },
      specializations: ['High-value transactions', 'Fraud investigation', 'Ethiopian payments'],
      certifications: ['Payment Security', 'Fraud Detection', 'Customer Service'],
      shiftEnd: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
    };
  };

  const generateTeamPerformance = (): AgentPerformance[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      agentId: `agent_${i + 1}`,
      agentName: `Agent ${i + 1}`,
      status: ['online', 'busy', 'away'][Math.floor(Math.random() * 3)] as any,
      currentWorkload: Math.floor(Math.random() * 10),
      maxCapacity: 10,
      todayStats: {
        processed: Math.floor(Math.random() * 25) + 10,
        approved: Math.floor(Math.random() * 20) + 8,
        declined: Math.floor(Math.random() * 3),
        escalated: Math.floor(Math.random() * 2),
        avgProcessingTime: Math.floor(Math.random() * 15) + 12,
        accuracy: 80 + Math.random() * 15
      },
      weekStats: {
        processed: Math.floor(Math.random() * 120) + 60,
        avgProcessingTime: Math.floor(Math.random() * 8) + 15,
        accuracy: 82 + Math.random() * 12
      },
      specializations: ['Payment verification', 'Document review'],
      certifications: ['Payment Processing'],
      shiftEnd: new Date(Date.now() + Math.random() * 8 * 60 * 60 * 1000)
    }));
  };

  const claimTransaction = (queueItemId: string) => {
    const item = queue.find(q => q.id === queueItemId);
    if (item) {
      const updatedItem = { ...item, assignedAgent: agentId };
      setQueue(prev => prev.filter(q => q.id !== queueItemId));
      setMyQueue(prev => [...prev, updatedItem]);
      
      toast({
        title: "Transaction Claimed",
        description: `You have claimed transaction ${queueItemId.slice(-8)}.`,
      });
    }
  };

  const releaseTransaction = (queueItemId: string) => {
    const item = myQueue.find(q => q.id === queueItemId);
    if (item) {
      const updatedItem = { ...item, assignedAgent: undefined };
      setMyQueue(prev => prev.filter(q => q.id !== queueItemId));
      setQueue(prev => [...prev, updatedItem]);
      
      toast({
        title: "Transaction Released",
        description: `Transaction ${queueItemId.slice(-8)} has been returned to the queue.`,
      });
    }
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

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const config = {
      online: { color: 'bg-green-100 text-green-800', icon: '🟢' },
      busy: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      away: { color: 'bg-gray-100 text-gray-800', icon: '⚪' },
      offline: { color: 'bg-red-100 text-red-800', icon: '🔴' }
    };

    const { color, icon } = config[status as keyof typeof config];

    return (
      <Badge className={color}>
        <span className="mr-1">{icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeUntilSLA = (deadline: Date) => {
    const remaining = deadline.getTime() - Date.now();
    if (remaining <= 0) return { text: 'Overdue', color: 'text-red-600' };
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    const text = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    const color = remaining < 30 * 60 * 1000 ? 'text-red-600' : remaining < 60 * 60 * 1000 ? 'text-orange-600' : 'text-green-600';
    
    return { text, color };
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    const matchesRisk = filterRisk === 'all' || 
      (filterRisk === 'high' && item.riskScore >= 50) ||
      (filterRisk === 'low' && item.riskScore < 50);
    
    return matchesSearch && matchesPriority && matchesRisk;
  });

  const sortedQueue = [...filteredQueue].sort((a, b) => {
    // Sort by priority first, then by wait time
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return b.waitTime - a.waitTime;
  });

  const renderQueueItem = (item: QueueItem, showClaimButton = false) => {
    const slaTime = getTimeUntilSLA(item.slaDeadline);
    
    return (
      <Card key={item.id} className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center space-y-1">
                <div className={cn("text-lg font-bold", getRiskColor(item.riskScore))}>
                  {item.riskScore}
                </div>
                <div className="text-xs text-muted-foreground">Risk</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium">#{item.transaction.id.slice(-8)}</h4>
                  {getPriorityBadge(item.priority)}
                  {item.customerInfo.vipStatus && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Award className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {item.customerInfo.name} • {item.transaction.currency} {item.transaction.amount.toLocaleString()}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.flags.map((flag, index) => (
                    <Badge key={index} variant="outline" className={cn(
                      "text-xs",
                      flag.type === 'alert' ? 'border-orange-300 text-orange-700' :
                      flag.type === 'warning' ? 'border-yellow-300 text-yellow-700' :
                      'border-blue-300 text-blue-700'
                    )}>
                      {flag.message}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center space-x-1 mb-1">
                <Clock className="h-3 w-3" />
                <span>Wait: {formatTime(item.waitTime)}</span>
              </div>
              <div className={cn("flex items-center space-x-1", slaTime.color)}>
                <Timer className="h-3 w-3" />
                <span>SLA: {slaTime.text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Est. {formatTime(item.estimatedProcessingTime)}</span>
              <span>{item.transaction.paymentMethod.replace('_', ' ')}</span>
              <span>{item.customerInfo.previousTransactions} prev. txns</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              {showClaimButton ? (
                <Button 
                  size="sm"
                  onClick={() => claimTransaction(item.id)}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Claim
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => releaseTransaction(item.id)}
                >
                  Release
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Queue className="h-6 w-6" />
            <span>Payment Agent Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your payment verification queue and monitor performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      {myPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today Processed</p>
                  <p className="text-2xl font-bold">{myPerformance.todayStats.processed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Queue</p>
                  <p className="text-2xl font-bold">{myQueue.length}</p>
                </div>
                <Queue className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">{formatTime(myPerformance.todayStats.avgProcessingTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{myPerformance.todayStats.accuracy.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-queue">
            My Queue ({myQueue.length})
          </TabsTrigger>
          <TabsTrigger value="team-queue">
            Team Queue ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="performance">
            Performance
          </TabsTrigger>
          <TabsTrigger value="team">
            Team Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-queue" className="space-y-4">
          {myQueue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Queue className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Your queue is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Claim transactions from the team queue to start processing
                </p>
                <Button onClick={() => setActiveTab('team-queue')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Browse Team Queue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myQueue.map(item => renderQueueItem(item, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team-queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search by transaction ID or customer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Queue Items */}
          <div className="space-y-4">
            {sortedQueue.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions in queue</h3>
                  <p className="text-muted-foreground">
                    All transactions have been assigned or there are no pending verifications
                  </p>
                </CardContent>
              </Card>
            ) : (
              sortedQueue.map(item => renderQueueItem(item, true))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {myPerformance && (
            <>
              {/* Today's Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {myPerformance.todayStats.approved}
                      </div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {myPerformance.todayStats.declined}
                      </div>
                      <p className="text-sm text-muted-foreground">Declined</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {myPerformance.todayStats.escalated}
                      </div>
                      <p className="text-sm text-muted-foreground">Escalated</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {myPerformance.todayStats.accuracy.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {myPerformance.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {myPerformance.certifications.map((cert, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamPerformance.map((agent) => (
              <Card key={agent.agentId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{agent.agentName}</h4>
                      <p className="text-sm text-muted-foreground">Agent ID: {agent.agentId}</p>
                    </div>
                    {getStatusBadge(agent.status)}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Workload</span>
                        <span>{agent.currentWorkload}/{agent.maxCapacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(agent.currentWorkload / agent.maxCapacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Today:</span>
                        <span className="ml-2 font-medium">{agent.todayStats.processed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="ml-2 font-medium">{agent.todayStats.accuracy.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Shift ends: {agent.shiftEnd.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentAgentDashboard;
