import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Award,
  Shield,
  Flag
} from 'lucide-react';
import { paymentService } from '@/lib/paymentService';
import { paymentAutomationEngine } from '@/lib/paymentAutomationEngine';
import { paymentNotificationSystem } from '@/lib/paymentNotificationSystem';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalTransactions: number;
    totalValue: number;
    avgProcessingTime: number;
    successRate: number;
    automationRate: number;
    fraudDetectionRate: number;
  };
  trends: {
    daily: { date: string; transactions: number; value: number; avgTime: number }[];
    weekly: { week: string; transactions: number; value: number; avgTime: number }[];
    monthly: { month: string; transactions: number; value: number; avgTime: number }[];
  };
  performance: {
    byAgent: {
      agentId: string;
      agentName: string;
      processed: number;
      avgTime: number;
      accuracy: number;
      efficiency: number;
    }[];
    byPaymentMethod: {
      method: string;
      count: number;
      value: number;
      avgTime: number;
      successRate: number;
    }[];
    byRiskLevel: {
      level: string;
      count: number;
      autoApproved: number;
      manualReview: number;
      declined: number;
    }[];
  };
  automation: {
    rulePerformance: {
      ruleId: string;
      ruleName: string;
      executions: number;
      successRate: number;
      falsePositives: number;
      timeSaved: number;
    }[];
    fraudDetection: {
      totalChecks: number;
      fraudDetected: number;
      falsePositives: number;
      accuracy: number;
      avgConfidence: number;
    };
  };
  sla: {
    onTime: number;
    late: number;
    overdue: number;
    avgResponseTime: number;
    breachReasons: { reason: string; count: number }[];
  };
  customer: {
    satisfaction: number;
    complaints: number;
    escalations: number;
    repeatCustomers: number;
  };
}

interface ManualPaymentAnalyticsProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

const ManualPaymentAnalytics: React.FC<ManualPaymentAnalyticsProps> = ({
  className,
  timeRange = '30d',
  refreshInterval = 300000 // 5 minutes
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadAnalyticsData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, refreshInterval]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate loading analytics data
      const data = await generateAnalyticsData(selectedTimeRange);
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = async (timeRange: string): Promise<AnalyticsData> => {
    // Get real data from services
    const transactions = paymentService.getAllTransactions();
    const rulePerformance = paymentAutomationEngine.getRulePerformanceAnalytics();
    const notificationStats = paymentNotificationSystem.getNotificationStats();

    // Generate mock data for demonstration
    return {
      overview: {
        totalTransactions: transactions.length,
        totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
        avgProcessingTime: 25.3,
        successRate: 94.7,
        automationRate: 67.2,
        fraudDetectionRate: 2.1
      },
      trends: {
        daily: generateTrendData('daily', 30),
        weekly: generateTrendData('weekly', 12),
        monthly: generateTrendData('monthly', 6)
      },
      performance: {
        byAgent: generateAgentPerformance(),
        byPaymentMethod: generatePaymentMethodPerformance(),
        byRiskLevel: generateRiskLevelPerformance()
      },
      automation: {
        rulePerformance: generateRulePerformanceData(),
        fraudDetection: {
          totalChecks: 1247,
          fraudDetected: 26,
          falsePositives: 8,
          accuracy: 89.3,
          avgConfidence: 78.5
        }
      },
      sla: {
        onTime: 847,
        late: 123,
        overdue: 34,
        avgResponseTime: 18.7,
        breachReasons: [
          { reason: 'High transaction volume', count: 45 },
          { reason: 'Document verification delays', count: 38 },
          { reason: 'Agent unavailability', count: 29 },
          { reason: 'System maintenance', count: 15 },
          { reason: 'Complex fraud investigation', count: 12 }
        ]
      },
      customer: {
        satisfaction: 4.2,
        complaints: 23,
        escalations: 15,
        repeatCustomers: 78.4
      }
    };
  };

  const generateTrendData = (type: 'daily' | 'weekly' | 'monthly', count: number) => {
    const data = [];
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      if (type === 'daily') date.setDate(date.getDate() - i);
      else if (type === 'weekly') date.setDate(date.getDate() - i * 7);
      else date.setMonth(date.getMonth() - i);

      data.push({
        [type === 'daily' ? 'date' : type === 'weekly' ? 'week' : 'month']: 
          type === 'daily' ? date.toISOString().split('T')[0] :
          type === 'weekly' ? `Week ${52 - i}` :
          date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        transactions: Math.floor(Math.random() * 50) + 20,
        value: Math.floor(Math.random() * 100000) + 50000,
        avgTime: Math.floor(Math.random() * 20) + 15
      });
    }
    return data;
  };

  const generateAgentPerformance = () => [
    { agentId: 'agent1', agentName: 'Alice Johnson', processed: 156, avgTime: 18.2, accuracy: 96.8, efficiency: 92.1 },
    { agentId: 'agent2', agentName: 'Bob Smith', processed: 142, avgTime: 22.1, accuracy: 94.3, efficiency: 88.7 },
    { agentId: 'agent3', agentName: 'Carol Davis', processed: 178, avgTime: 16.9, accuracy: 97.2, efficiency: 94.8 },
    { agentId: 'agent4', agentName: 'David Wilson', processed: 134, avgTime: 24.3, accuracy: 92.1, efficiency: 85.4 },
    { agentId: 'agent5', agentName: 'Eva Brown', processed: 165, avgTime: 19.8, accuracy: 95.7, efficiency: 91.3 }
  ];

  const generatePaymentMethodPerformance = () => [
    { method: 'Bank Transfer', count: 234, value: 1247500, avgTime: 28.5, successRate: 92.3 },
    { method: 'Cash Payment', count: 189, value: 456200, avgTime: 15.2, successRate: 97.8 },
    { method: 'TeleBirr', count: 156, value: 234100, avgTime: 22.1, successRate: 94.7 },
    { method: 'CBE Birr', count: 98, value: 567800, avgTime: 31.4, successRate: 89.8 },
    { method: 'Mobile Money', count: 67, value: 123400, avgTime: 18.9, successRate: 95.5 }
  ];

  const generateRiskLevelPerformance = () => [
    { level: 'Low (0-30)', count: 345, autoApproved: 298, manualReview: 42, declined: 5 },
    { level: 'Medium (31-60)', count: 267, autoApproved: 89, manualReview: 156, declined: 22 },
    { level: 'High (61-80)', count: 134, autoApproved: 12, manualReview: 98, declined: 24 },
    { level: 'Critical (81-100)', count: 45, autoApproved: 0, manualReview: 32, declined: 13 }
  ];

  const generateRulePerformanceData = () => [
    { ruleId: 'low_amount', ruleName: 'Low Amount Auto Approval', executions: 298, successRate: 97.3, falsePositives: 8, timeSaved: 1490 },
    { ruleId: 'high_amount', ruleName: 'High Amount Review', executions: 156, successRate: 94.2, falsePositives: 9, timeSaved: 780 },
    { ruleId: 'velocity_check', ruleName: 'Velocity Check', executions: 89, successRate: 87.6, falsePositives: 11, timeSaved: 445 },
    { ruleId: 'manual_payment', ruleName: 'Manual Payment Review', executions: 234, successRate: 91.9, falsePositives: 19, timeSaved: 1170 },
    { ruleId: 'new_customer', ruleName: 'New Customer Verification', executions: 67, successRate: 89.6, falsePositives: 7, timeSaved: 335 }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  if (loading && !analyticsData) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Manual Payment Analytics</span>
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance metrics for manual payment processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalTransactions.toLocaleString()}</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.3% vs last period</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalValue)}</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.7% vs last period</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold">{formatTime(analyticsData.overview.avgProcessingTime)}</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-5.2% vs last period</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.successRate.toFixed(1)}%</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+2.1% vs last period</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="sla">SLA & Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Transaction Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="transactions" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#ff7300" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Automation Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Automated</span>
                    <span className="font-medium">{analyticsData.overview.automationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData.overview.automationRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(analyticsData.overview.totalTransactions * analyticsData.overview.automationRate / 100)} transactions automated
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Fraud Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Detection Rate</span>
                    <span className="font-medium">{analyticsData.overview.fraudDetectionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData.overview.fraudDetectionRate * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(analyticsData.overview.totalTransactions * analyticsData.overview.fraudDetectionRate / 100)} potentially fraudulent transactions detected
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Customer Satisfaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rating</span>
                    <span className="font-medium">{analyticsData.customer.satisfaction.toFixed(1)}/5.0</span>
                  </div>
                  <Progress value={analyticsData.customer.satisfaction * 20} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Based on {analyticsData.overview.totalTransactions} customer feedback responses
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.performance.byAgent.map((agent) => (
                  <div key={agent.agentId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{agent.agentName}</h4>
                        <p className="text-sm text-muted-foreground">{agent.processed} transactions processed</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{formatTime(agent.avgTime)} avg</Badge>
                        <Badge className={getPerformanceColor(agent.accuracy, { good: 95, warning: 90 })}>
                          {agent.accuracy.toFixed(1)}% accuracy
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                        <Progress value={agent.efficiency} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{agent.efficiency.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <Progress value={agent.accuracy} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{agent.accuracy.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Speed Score</p>
                        <Progress value={100 - (agent.avgTime / 30) * 100} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{(100 - (agent.avgTime / 30) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.performance.byPaymentMethod}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.performance.byRiskLevel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ level, count }) => `${level}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.performance.byRiskLevel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Rule Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Rule Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.automation.rulePerformance.map((rule) => (
                  <div key={rule.ruleId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{rule.ruleName}</h4>
                        <p className="text-sm text-muted-foreground">{rule.executions} executions</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          {formatTime(rule.timeSaved)} saved
                        </Badge>
                        <Badge variant="outline">
                          {rule.successRate.toFixed(1)}% success
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                        <Progress value={rule.successRate} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{rule.successRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">False Positives</p>
                        <Progress value={(rule.falsePositives / rule.executions) * 100} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{rule.falsePositives}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time Saved</p>
                        <div className="text-xs font-medium mt-1">{formatTime(rule.timeSaved)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fraud Detection Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.automation.fraudDetection.totalChecks.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Checks</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData.automation.fraudDetection.fraudDetected}
                  </div>
                  <p className="text-sm text-muted-foreground">Fraud Detected</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.automation.fraudDetection.falsePositives}
                  </div>
                  <p className="text-sm text-muted-foreground">False Positives</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.automation.fraudDetection.accuracy.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          {/* SLA Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.sla.onTime}</div>
                  <p className="text-sm text-muted-foreground">On Time</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analyticsData.sla.late}</div>
                  <p className="text-sm text-muted-foreground">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analyticsData.sla.overdue}</div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(analyticsData.sla.avgResponseTime)}</div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Breach Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>SLA Breach Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.sla.breachReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{reason.reason}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32">
                        <Progress value={(reason.count / analyticsData.sla.breachReasons[0].count) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8">{reason.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Experience Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{analyticsData.customer.satisfaction}</span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analyticsData.customer.complaints}</div>
                  <p className="text-sm text-muted-foreground">Complaints</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analyticsData.customer.escalations}</div>
                  <p className="text-sm text-muted-foreground">Escalations</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.customer.repeatCustomers.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Repeat Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {lastUpdated.toLocaleString()}
        {refreshInterval > 0 && (
          <span className="ml-2">• Auto-refresh every {Math.round(refreshInterval / 60000)} minutes</span>
        )}
      </div>
    </div>
  );
};

export default ManualPaymentAnalytics;
