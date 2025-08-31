import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Calendar,
  User,
  Building,
  ShoppingCart,
  Wrench,
  Zap,
  Coffee,
  Car,
  Phone,
  Wifi,
  Utensils,
  Bed,
  Trash2,
  Edit,
  Eye,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  staffId: string;
  staffName: string;
  receiptUrl?: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  vendor?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  recurring?: boolean;
  dueDate?: string;
}

interface ExpenseManagerProps {
  userId: string;
  userRole: 'manager' | 'reception' | 'staff';
  userName: string;
  permissions: string[];
}

const EXPENSE_CATEGORIES = [
  {
    id: 'utilities',
    name: 'Utilities',
    icon: Zap,
    color: '#3B82F6',
    subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone']
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    icon: Wrench,
    color: '#EF4444',
    subcategories: ['Room Repairs', 'HVAC', 'Plumbing', 'Electrical', 'General Maintenance']
  },
  {
    id: 'supplies',
    name: 'Supplies & Inventory',
    icon: ShoppingCart,
    color: '#10B981',
    subcategories: ['Housekeeping', 'Front Desk', 'Kitchen', 'Bathroom', 'Laundry']
  },
  {
    id: 'food_beverage',
    name: 'Food & Beverage',
    icon: Utensils,
    color: '#F59E0B',
    subcategories: ['Breakfast Supplies', 'Mini Bar', 'Staff Meals', 'Guest Amenities']
  },
  {
    id: 'staff',
    name: 'Staff & Payroll',
    icon: User,
    color: '#8B5CF6',
    subcategories: ['Salaries', 'Benefits', 'Training', 'Uniforms', 'Bonuses']
  },
  {
    id: 'marketing',
    name: 'Marketing & Advertising',
    icon: Building,
    color: '#EC4899',
    subcategories: ['Online Ads', 'Print Materials', 'Events', 'Website', 'Social Media']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    color: '#06B6D4',
    subcategories: ['Fuel', 'Vehicle Maintenance', 'Parking', 'Public Transport']
  },
  {
    id: 'other',
    name: 'Other Expenses',
    icon: Receipt,
    color: '#6B7280',
    subcategories: ['Insurance', 'Legal', 'Banking Fees', 'Miscellaneous']
  }
];

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: DollarSign },
  { id: 'card', name: 'Credit/Debit Card', icon: DollarSign },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: DollarSign },
  { id: 'mobile_money', name: 'Mobile Money (Ethiopian)', icon: Phone }
];

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280'];

export default function ExpenseManager({ userId, userRole, userName, permissions }: ExpenseManagerProps) {
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const [newExpense, setNewExpense] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    vendor: '',
    paymentMethod: 'cash' as const,
    notes: '',
    receiptFile: null as File | null
  });

  const [analytics, setAnalytics] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    pendingApprovals: 0,
    categoryBreakdown: [] as unknown[],
    monthlyTrend: [] as unknown[]
  });

  useEffect(() => {
    // In production, start empty; data should come from backend
    setExpenses([]);
    generateAnalytics();
  }, [generateAnalytics]);

  const loadExpenses = () => {
    setExpenses([]);
  };

  const generateAnalytics = () => {
    // Calculate analytics from expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyExpenses = expenses
      .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingApprovals = expenses.filter(exp => exp.status === 'pending').length;

    // Category breakdown
    const categoryBreakdown = EXPENSE_CATEGORIES.map(category => {
      const categoryExpenses = expenses.filter(exp => exp.category === category.id);
      const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        name: category.name,
        value: total,
        color: category.color,
        count: categoryExpenses.length
      };
    }).filter(item => item.value > 0);

    // Monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });
      
      return {
        month: date.toLocaleDateString('en', { month: 'short' }),
        amount: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        count: monthExpenses.length
      };
    }).reverse();

    setAnalytics({
      totalExpenses,
      monthlyExpenses,
      pendingApprovals,
      categoryBreakdown,
      monthlyTrend
    });
  };

  const handleAddExpense = async () => {
    try {
      if (!newExpense.category || !newExpense.description || !newExpense.amount) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const expense: Expense = {
        id: `EXP${  Date.now()}`,
        category: newExpense.category,
        subcategory: newExpense.subcategory,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        currency: 'ETB',
        date: new Date().toISOString().split('T')[0],
        staffId: userId,
        staffName: userName,
        paymentMethod: newExpense.paymentMethod,
        vendor: newExpense.vendor,
        status: userRole === 'manager' ? 'approved' : 'pending',
        notes: newExpense.notes,
        ...(userRole === 'manager' && { approvedBy: userId })
      };

      setExpenses(prev => [expense, ...prev]);
      
      // Reset form
      setNewExpense({
        category: '',
        subcategory: '',
        description: '',
        amount: '',
        vendor: '',
        paymentMethod: 'cash',
        notes: '',
        receiptFile: null
      });
      
      setIsAddExpenseOpen(false);
      generateAnalytics();

      toast({
        title: "Expense Added",
        description: userRole === 'manager' 
          ? "Expense has been added and approved" 
          : "Expense has been submitted for approval",
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const handleApproveExpense = (expenseId: string, approved: boolean, notes?: string) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expenseId 
        ? { 
            ...exp, 
            status: approved ? 'approved' : 'rejected',
            approvedBy: userId,
            notes: notes || exp.notes
          }
        : exp
    ));
    
    generateAnalytics();
    
    toast({
      title: approved ? "Expense Approved" : "Expense Rejected",
      description: approved ? "Expense has been approved for payment" : "Expense has been rejected",
      variant: approved ? "default" : "destructive"
    });
  };

  const formatCurrency = (amount: number, currency = 'ETB') => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.icon || Receipt;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
    const matchesSearch = !searchQuery || 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-gray-600">Track and manage hotel expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <Select value={newExpense.category} onValueChange={(value) => 
                      setNewExpense(prev => ({ ...prev, category: value, subcategory: '' }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Subcategory</label>
                    <Select 
                      value={newExpense.subcategory} 
                      onValueChange={(value) => setNewExpense(prev => ({ ...prev, subcategory: value }))}
                      disabled={!newExpense.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES
                          .find(cat => cat.id === newExpense.category)
                          ?.subcategories?.map(sub => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the expense..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Amount (ETB) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select value={newExpense.paymentMethod} onValueChange={(value: string | number | boolean | string[]) => 
                      setNewExpense(prev => ({ ...prev, paymentMethod: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              {method.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Vendor/Supplier</label>
                  <Input
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Company or person paid"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense}>
                    Add Expense
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.monthlyExpenses)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.pendingApprovals}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.categoryBreakdown.length}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => {
          const CategoryIcon = getCategoryIcon(expense.category);
          
          return (
            <Card key={expense.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
                      >
                        <CategoryIcon 
                          className="h-5 w-5" 
                          style={{ color: getCategoryColor(expense.category) }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{expense.description}</h3>
                        <p className="text-sm text-gray-600">
                          {expense.subcategory || EXPENSE_CATEGORIES.find(c => c.id === expense.category)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span> {formatCurrency(expense.amount)}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(expense.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Staff:</span> {expense.staffName}
                      </div>
                      <div>
                        <span className="font-medium">Payment:</span> {
                          PAYMENT_METHODS.find(p => p.id === expense.paymentMethod)?.name
                        }
                      </div>
                    </div>

                    {expense.vendor && (
                      <div className="text-sm">
                        <span className="font-medium">Vendor:</span> {expense.vendor}
                      </div>
                    )}

                    {expense.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {expense.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setIsViewExpenseOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {userRole === 'manager' && expense.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleApproveExpense(expense.id, true)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproveExpense(expense.id, false)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No expenses found matching your criteria</p>
          </div>
        )}
      </div>

      {/* View Expense Dialog */}
      <Dialog open={isViewExpenseOpen} onOpenChange={setIsViewExpenseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {React.createElement(getCategoryIcon(selectedExpense.category), {
                    className: "h-6 w-6",
                    style: { color: getCategoryColor(selectedExpense.category) }
                  })}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedExpense.description}</h3>
                    <p className="text-gray-600">{selectedExpense.subcategory}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedExpense.status)}>
                  {selectedExpense.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-lg">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Staff Member</p>
                  <p className="text-lg">{selectedExpense.staffName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="text-lg">
                    {PAYMENT_METHODS.find(p => p.id === selectedExpense.paymentMethod)?.name}
                  </p>
                </div>
              </div>

              {selectedExpense.vendor && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendor/Supplier</p>
                  <p className="text-lg">{selectedExpense.vendor}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-gray-700">{selectedExpense.notes}</p>
                </div>
              )}

              {selectedExpense.approvedBy && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This expense was {selectedExpense.status} by manager on{' '}
                    {new Date(selectedExpense.date).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
