import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link,
  Unlink,
  Search,
  Filter,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  Building,
  CreditCard,
  Target,
  Zap,
  Eye,
  Settings,
  Save,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { PaymentTransaction } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BankStatement {
  id: string;
  bankName: string;
  accountNumber: string;
  statementDate: Date;
  uploadedAt: Date;
  transactions: BankTransaction[];
  reconciliationStatus: 'pending' | 'partial' | 'complete';
  matchedCount: number;
  unmatchedCount: number;
  discrepancies: number;
}

interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  reference: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  matched: boolean;
  matchedTransactionId?: string;
  matchConfidence?: number;
  flags: string[];
}

interface ReconciliationMatch {
  bankTransactionId: string;
  paymentTransactionId: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
  matchCriteria: string[];
  discrepancies: {
    field: string;
    bankValue: any;
    systemValue: any;
    severity: 'low' | 'medium' | 'high';
  }[];
}

interface ReconciliationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'amount_range';
    value: any;
    tolerance?: number;
  }[];
  actions: {
    type: 'auto_match' | 'flag' | 'ignore' | 'manual_review';
    parameters: Record<string, any>;
  }[];
}

const BankReconciliationTools: React.FC<{ className?: string }> = ({ className }) => {
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [reconciliationRules, setReconciliationRules] = useState<ReconciliationRule[]>([]);
  const [activeTab, setActiveTab] = useState('statements');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load existing statements (from localStorage for demo)
      const storedStatements = localStorage.getItem('bank-statements');
      if (storedStatements) {
        const statements = JSON.parse(storedStatements).map((s: any) => ({
          ...s,
          statementDate: new Date(s.statementDate),
          uploadedAt: new Date(s.uploadedAt),
          transactions: s.transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }))
        }));
        setStatements(statements);
      } else {
        // Generate sample data
        const sampleStatements = generateSampleStatements();
        setStatements(sampleStatements);
        localStorage.setItem('bank-statements', JSON.stringify(sampleStatements));
      }

      // Load payment transactions
      const transactions = paymentService.getAllTransactions();
      setPaymentTransactions(transactions);

      // Load reconciliation rules
      loadReconciliationRules();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const generateSampleStatements = (): BankStatement[] => {
    const sampleTransactions: BankTransaction[] = [];
    let balance = 150000;

    // Generate 20 sample bank transactions
    for (let i = 0; i < 20; i++) {
      const amount = Math.floor(Math.random() * 10000) + 1000;
      const isCredit = Math.random() > 0.3; // 70% credits, 30% debits
      
      if (isCredit) {
        balance += amount;
      } else {
        balance -= amount;
      }

      sampleTransactions.push({
        id: `bank_tx_${i + 1}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        description: isCredit 
          ? `Payment received from Customer ${Math.floor(Math.random() * 1000)}`
          : `Bank charges and fees`,
        reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: isCredit ? amount : -amount,
        type: isCredit ? 'credit' : 'debit',
        balance,
        matched: Math.random() > 0.4, // 60% matched
        matchConfidence: Math.random() > 0.4 ? 85 + Math.random() * 15 : undefined,
        flags: Math.random() > 0.8 ? ['duplicate_check'] : []
      });
    }

    return [{
      id: 'stmt_1',
      bankName: 'Commercial Bank of Ethiopia',
      accountNumber: '****7890',
      statementDate: new Date(),
      uploadedAt: new Date(),
      transactions: sampleTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
      reconciliationStatus: 'partial',
      matchedCount: sampleTransactions.filter(t => t.matched).length,
      unmatchedCount: sampleTransactions.filter(t => !t.matched).length,
      discrepancies: Math.floor(Math.random() * 3)
    }];
  };

  const loadReconciliationRules = () => {
    const defaultRules: ReconciliationRule[] = [
      {
        id: 'exact_amount_reference',
        name: 'Exact Amount and Reference Match',
        description: 'Match transactions with exact amount and reference number',
        enabled: true,
        priority: 100,
        conditions: [
          { field: 'amount', operator: 'equals', value: 'payment.amount', tolerance: 0 },
          { field: 'reference', operator: 'contains', value: 'payment.id' }
        ],
        actions: [
          { type: 'auto_match', parameters: { confidence: 95 } }
        ]
      },
      {
        id: 'amount_tolerance_match',
        name: 'Amount with Tolerance Match',
        description: 'Match transactions with amount within 1% tolerance',
        enabled: true,
        priority: 80,
        conditions: [
          { field: 'amount', operator: 'amount_range', value: 'payment.amount', tolerance: 0.01 },
          { field: 'date', operator: 'amount_range', value: 'payment.createdAt', tolerance: 3 } // 3 days
        ],
        actions: [
          { type: 'auto_match', parameters: { confidence: 75 } }
        ]
      },
      {
        id: 'suspicious_duplicate',
        name: 'Suspicious Duplicate Detection',
        description: 'Flag potential duplicate transactions',
        enabled: true,
        priority: 90,
        conditions: [
          { field: 'amount', operator: 'equals', value: 'previous.amount' },
          { field: 'description', operator: 'contains', value: 'previous.description' }
        ],
        actions: [
          { type: 'flag', parameters: { flag: 'potential_duplicate' } },
          { type: 'manual_review', parameters: {} }
        ]
      }
    ];

    setReconciliationRules(defaultRules);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newStatement: BankStatement = {
        id: `stmt_${Date.now()}`,
        bankName: 'Commercial Bank of Ethiopia',
        accountNumber: `****${  Math.random().toString().substr(2, 4)}`,
        statementDate: new Date(),
        uploadedAt: new Date(),
        transactions: generateSampleStatements()[0].transactions,
        reconciliationStatus: 'pending',
        matchedCount: 0,
        unmatchedCount: 0,
        discrepancies: 0
      };

      const updatedStatements = [...statements, newStatement];
      setStatements(updatedStatements);
      localStorage.setItem('bank-statements', JSON.stringify(updatedStatements));

      toast({
        title: "Statement Uploaded",
        description: `Successfully processed ${file.name} with ${newStatement.transactions.length} transactions.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process bank statement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runAutoReconciliation = async (statementId: string) => {
    setIsProcessing(true);
    try {
      const statement = statements.find(s => s.id === statementId);
      if (!statement) return;

      // Simulate auto-reconciliation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newMatches: ReconciliationMatch[] = [];
      let matchedCount = 0;

      statement.transactions.forEach(bankTx => {
        if (bankTx.matched) return;

        // Find potential matches
        const potentialMatches = paymentTransactions.filter(payTx => {
          const amountMatch = Math.abs(payTx.amount - Math.abs(bankTx.amount)) < 1;
          const dateMatch = Math.abs(payTx.createdAt.getTime() - bankTx.date.getTime()) < 3 * 24 * 60 * 60 * 1000;
          return amountMatch && dateMatch;
        });

        if (potentialMatches.length > 0) {
          const bestMatch = potentialMatches[0];
          const confidence = calculateMatchConfidence(bankTx, bestMatch);

          if (confidence > 70) {
            bankTx.matched = true;
            bankTx.matchedTransactionId = bestMatch.id;
            bankTx.matchConfidence = confidence;
            matchedCount++;

            newMatches.push({
              bankTransactionId: bankTx.id,
              paymentTransactionId: bestMatch.id,
              confidence,
              matchType: confidence > 90 ? 'exact' : 'fuzzy',
              matchCriteria: ['amount', 'date'],
              discrepancies: []
            });
          }
        }
      });

      // Update statement
      const updatedStatement = {
        ...statement,
        matchedCount: statement.transactions.filter(t => t.matched).length,
        unmatchedCount: statement.transactions.filter(t => !t.matched).length,
        reconciliationStatus: statement.transactions.every(t => t.matched) ? 'complete' as const : 'partial' as const
      };

      const updatedStatements = statements.map(s => s.id === statementId ? updatedStatement : s);
      setStatements(updatedStatements);
      setMatches(prev => [...prev, ...newMatches]);

      toast({
        title: "Auto-Reconciliation Complete",
        description: `Matched ${matchedCount} transactions automatically.`,
      });
    } catch (error) {
      toast({
        title: "Reconciliation Failed",
        description: "Auto-reconciliation process failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMatchConfidence = (bankTx: BankTransaction, paymentTx: PaymentTransaction): number => {
    let confidence = 0;

    // Amount match (40% weight)
    const amountDiff = Math.abs(Math.abs(bankTx.amount) - paymentTx.amount) / paymentTx.amount;
    if (amountDiff === 0) confidence += 40;
    else if (amountDiff < 0.01) confidence += 35;
    else if (amountDiff < 0.05) confidence += 25;
    else confidence += Math.max(0, 20 - amountDiff * 100);

    // Date match (30% weight)
    const dateDiff = Math.abs(bankTx.date.getTime() - paymentTx.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    if (dateDiff === 0) confidence += 30;
    else if (dateDiff <= 1) confidence += 25;
    else if (dateDiff <= 3) confidence += 15;
    else confidence += Math.max(0, 10 - dateDiff);

    // Reference match (20% weight)
    if (bankTx.reference && bankTx.reference.includes(paymentTx.id.slice(-8))) {
      confidence += 20;
    } else if (bankTx.description.toLowerCase().includes('payment')) {
      confidence += 10;
    }

    // Description match (10% weight)
    if (bankTx.description.toLowerCase().includes('booking') || 
        bankTx.description.toLowerCase().includes('reservation')) {
      confidence += 10;
    }

    return Math.min(100, Math.round(confidence));
  };

  const manualMatch = (bankTxId: string, paymentTxId: string) => {
    const statement = statements.find(s => 
      s.transactions.some(t => t.id === bankTxId)
    );
    
    if (!statement) return;

    const bankTx = statement.transactions.find(t => t.id === bankTxId);
    const paymentTx = paymentTransactions.find(t => t.id === paymentTxId);

    if (!bankTx || !paymentTx) return;

    // Update bank transaction
    bankTx.matched = true;
    bankTx.matchedTransactionId = paymentTxId;
    bankTx.matchConfidence = 100; // Manual matches get 100% confidence

    // Update statement counts
    statement.matchedCount = statement.transactions.filter(t => t.matched).length;
    statement.unmatchedCount = statement.transactions.filter(t => !t.matched).length;

    // Add to matches
    const newMatch: ReconciliationMatch = {
      bankTransactionId: bankTxId,
      paymentTransactionId: paymentTxId,
      confidence: 100,
      matchType: 'manual',
      matchCriteria: ['manual_selection'],
      discrepancies: []
    };

    setMatches(prev => [...prev, newMatch]);
    setStatements([...statements]);

    toast({
      title: "Manual Match Created",
      description: "Transactions have been manually matched successfully.",
    });
  };

  const unmatchTransaction = (bankTxId: string) => {
    const statement = statements.find(s => 
      s.transactions.some(t => t.id === bankTxId)
    );
    
    if (!statement) return;

    const bankTx = statement.transactions.find(t => t.id === bankTxId);
    if (!bankTx) return;

    // Update bank transaction
    bankTx.matched = false;
    bankTx.matchedTransactionId = undefined;
    bankTx.matchConfidence = undefined;

    // Update statement counts
    statement.matchedCount = statement.transactions.filter(t => t.matched).length;
    statement.unmatchedCount = statement.transactions.filter(t => !t.matched).length;

    // Remove from matches
    setMatches(prev => prev.filter(m => m.bankTransactionId !== bankTxId));
    setStatements([...statements]);

    toast({
      title: "Transaction Unmatched",
      description: "Transaction has been unmatched successfully.",
    });
  };

  const exportReconciliationReport = () => {
    if (!selectedStatement) return;

    const report = {
      statement: selectedStatement,
      matches: matches.filter(m => 
        selectedStatement.transactions.some(t => t.id === m.bankTransactionId)
      ),
      summary: {
        totalTransactions: selectedStatement.transactions.length,
        matchedTransactions: selectedStatement.matchedCount,
        unmatchedTransactions: selectedStatement.unmatchedCount,
        reconciliationRate: (selectedStatement.matchedCount / selectedStatement.transactions.length * 100).toFixed(2)
      }
    };

    const dataStr = `data:text/json;charset=utf-8,${  encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `reconciliation_report_${selectedStatement.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getStatusBadge = (status: BankStatement['reconciliationStatus']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      partial: { color: 'bg-blue-100 text-blue-800', label: 'Partial' },
      complete: { color: 'bg-green-100 text-green-800', label: 'Complete' }
    };

    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getMatchBadge = (confidence?: number) => {
    if (!confidence) return <Badge variant="outline">Unmatched</Badge>;
    
    if (confidence >= 90) return <Badge className="bg-green-100 text-green-800">High ({confidence}%)</Badge>;
    if (confidence >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Medium ({confidence}%)</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low ({confidence}%)</Badge>;
  };

  const filteredTransactions = selectedStatement?.transactions.filter(tx => {
    const matchesSearch = searchQuery === '' || 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'matched' && tx.matched) ||
      (filterStatus === 'unmatched' && !tx.matched);
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Building className="h-6 w-6" />
            <span>Bank Reconciliation</span>
          </h2>
          <p className="text-muted-foreground">
            Upload bank statements and automatically match transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Statement
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Statements</p>
                <p className="text-2xl font-bold">{statements.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">
                  {statements.reduce((sum, s) => sum + s.transactions.length, 0)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matched</p>
                <p className="text-2xl font-bold">
                  {statements.reduce((sum, s) => sum + s.matchedCount, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reconciliation Rate</p>
                <p className="text-2xl font-bold">
                  {statements.length > 0 
                    ? ((statements.reduce((sum, s) => sum + s.matchedCount, 0) / 
                        statements.reduce((sum, s) => sum + s.transactions.length, 0)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="statements">Bank Statements</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="rules">Matching Rules</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="statements" className="space-y-4">
          {/* Statements List */}
          <div className="space-y-4">
            {statements.map((statement) => (
              <Card key={statement.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{statement.bankName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Account: {statement.accountNumber} • {statement.transactions.length} transactions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {statement.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(statement.reconciliationStatus)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {statement.matchedCount} matched • {statement.unmatchedCount} unmatched
                        </div>
                        <div className="w-32 mt-1">
                          <Progress 
                            value={(statement.matchedCount / statement.transactions.length) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStatement(statement)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runAutoReconciliation(statement.id)}
                          disabled={isProcessing}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Auto Match
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {statements.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Bank Statements</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first bank statement to start reconciliation
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Statement
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          {selectedStatement ? (
            <>
              {/* Statement Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>{selectedStatement.bankName} - {selectedStatement.accountNumber}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={exportReconciliationReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                      <Button onClick={() => runAutoReconciliation(selectedStatement.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Run Auto Match
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedStatement.matchedCount}</div>
                      <p className="text-sm text-muted-foreground">Matched</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedStatement.unmatchedCount}</div>
                      <p className="text-sm text-muted-foreground">Unmatched</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((selectedStatement.matchedCount / selectedStatement.transactions.length) * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Match Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="matched">Matched Only</SelectItem>
                        <SelectItem value="unmatched">Unmatched Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            transaction.matched ? "bg-green-500" : "bg-red-500"
                          )} />
                          <div>
                            <h4 className="font-medium">{transaction.description}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{transaction.date.toLocaleDateString()}</span>
                              <span>Ref: {transaction.reference}</span>
                              <span className={cn(
                                "font-medium",
                                transaction.amount > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} ETB
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {getMatchBadge(transaction.matchConfidence)}
                          
                          {transaction.matched ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {transaction.matchedTransactionId?.slice(-8)}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unmatchTransaction(transaction.id)}
                              >
                                <Unlink className="h-3 w-3 mr-1" />
                                Unmatch
                              </Button>
                            </div>
                          ) : (
                            <Select onValueChange={(value) => manualMatch(transaction.id, value)}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select payment" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentTransactions
                                  .filter(pt => !matches.some(m => m.paymentTransactionId === pt.id))
                                  .slice(0, 10)
                                  .map((pt) => (
                                  <SelectItem key={pt.id} value={pt.id}>
                                    {pt.amount.toLocaleString()} ETB - {pt.id.slice(-8)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Statement</h3>
                <p className="text-muted-foreground">
                  Choose a bank statement from the statements tab to start reconciliation
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reconciliationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                        <Badge className={rule.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Conditions:</strong> {rule.conditions.length} conditions defined
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Actions:</strong> {rule.actions.map(a => a.type).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statements.map((statement) => (
                    <div key={statement.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{statement.bankName}</p>
                        <p className="text-sm text-muted-foreground">{statement.accountNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {((statement.matchedCount / statement.transactions.length) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {statement.matchedCount}/{statement.transactions.length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Confidence (90%+)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Confidence (70-89%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Confidence (&lt;70%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-80">
            <CardContent className="p-6 text-center">
              <RotateCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="font-medium mb-2">Processing...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your request
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BankReconciliationTools;
