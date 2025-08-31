import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star,
  Gift,
  Crown,
  Award,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Zap,
  Target,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  History,
  Trophy,
  Coins,
  Percent,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LoyaltyUser {
  id: string;
  name: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  lifetimePoints: number;
  nextTierPoints: number;
  tierProgress: number;
  memberSince: Date;
  lastActivity: Date;
  totalBookings: number;
  totalSpent: number;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_night' | 'upgrade' | 'experience' | 'gift_card';
  pointsCost: number;
  value: number;
  category: string;
  availability: 'available' | 'limited' | 'out_of_stock';
  expiryDate?: Date;
  imageUrl?: string;
  conditions?: string[];
  popularity: number;
  featured: boolean;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  date: Date;
  bookingId?: string;
  rewardId?: string;
}

interface LoyaltyPointsDisplayProps {
  userId: string;
  compact?: boolean;
  showRewards?: boolean;
  showHistory?: boolean;
  className?: string;
}

const LoyaltyPointsDisplay: React.FC<LoyaltyPointsDisplayProps> = ({
  userId,
  compact = false,
  showRewards = true,
  showHistory = true,
  className
}) => {
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadLoyaltyData();
  }, [userId]);

  const loadLoyaltyData = async () => {
    setLoading(true);
    try {
      // Load or create user loyalty data
      const loyaltyData = loadUserLoyaltyData(userId);
      setUser(loyaltyData.user);
      setRewards(loyaltyData.rewards);
      setTransactions(loyaltyData.transactions);
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLoyaltyData = (userId: string) => {
    // Load from localStorage or create sample data
    const stored = localStorage.getItem(`loyalty-${userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        user: {
          ...data.user,
          memberSince: new Date(data.user.memberSince),
          lastActivity: new Date(data.user.lastActivity),
        },
        rewards: data.rewards.map((r: any) => ({
          ...r,
          expiryDate: r.expiryDate ? new Date(r.expiryDate) : undefined,
        })),
        transactions: data.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        })),
      };
    }

    // Create sample data
    const sampleUser: LoyaltyUser = {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      tier: 'gold',
      points: 2450,
      lifetimePoints: 8920,
      nextTierPoints: 5000,
      tierProgress: 49,
      memberSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalBookings: 23,
      totalSpent: 8920,
    };

    const sampleRewards: LoyaltyReward[] = [
      {
        id: 'reward_1',
        name: '10% Off Next Booking',
        description: 'Get 10% discount on your next hotel booking',
        type: 'discount',
        pointsCost: 500,
        value: 10,
        category: 'Discounts',
        availability: 'available',
        popularity: 9,
        featured: true,
        conditions: ['Valid for 90 days', 'Minimum booking $100']
      },
      {
        id: 'reward_2',
        name: 'Free Night Stay',
        description: 'Complimentary night at participating hotels',
        type: 'free_night',
        pointsCost: 2000,
        value: 150,
        category: 'Free Stays',
        availability: 'available',
        popularity: 10,
        featured: true,
        conditions: ['Subject to availability', 'Blackout dates apply']
      },
      {
        id: 'reward_3',
        name: 'Room Upgrade',
        description: 'Complimentary upgrade to next room category',
        type: 'upgrade',
        pointsCost: 800,
        value: 75,
        category: 'Upgrades',
        availability: 'limited',
        popularity: 8,
        featured: false,
        conditions: ['Subject to availability', 'Check-in required']
      },
      {
        id: 'reward_4',
        name: '$25 Gift Card',
        description: 'Digital gift card for future bookings',
        type: 'gift_card',
        pointsCost: 1000,
        value: 25,
        category: 'Gift Cards',
        availability: 'available',
        popularity: 7,
        featured: false,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'reward_5',
        name: 'Spa Experience',
        description: 'Relaxing spa treatment at luxury properties',
        type: 'experience',
        pointsCost: 1500,
        value: 120,
        category: 'Experiences',
        availability: 'limited',
        popularity: 6,
        featured: false,
        conditions: ['Luxury properties only', 'Advance booking required']
      },
    ];

    const sampleTransactions: PointsTransaction[] = [
      {
        id: 'tx_1',
        type: 'earned',
        points: 150,
        description: 'Booking at Grand Hotel',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        bookingId: 'booking_123'
      },
      {
        id: 'tx_2',
        type: 'bonus',
        points: 500,
        description: 'Gold tier welcome bonus',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'tx_3',
        type: 'redeemed',
        points: -500,
        description: 'Redeemed 10% discount',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        rewardId: 'reward_1'
      },
      {
        id: 'tx_4',
        type: 'earned',
        points: 200,
        description: 'Booking at Beach Resort',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        bookingId: 'booking_124'
      },
    ];

    const data = {
      user: sampleUser,
      rewards: sampleRewards,
      transactions: sampleTransactions,
    };

    localStorage.setItem(`loyalty-${userId}`, JSON.stringify(data));
    return data;
  };

  const handleRedeemReward = async (reward: LoyaltyReward) => {
    if (!user) return;

    if (user.points < reward.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsCost - user.points} more points to redeem this reward.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Update user points
      const updatedUser = {
        ...user,
        points: user.points - reward.pointsCost,
        lastActivity: new Date(),
      };

      // Add transaction
      const newTransaction: PointsTransaction = {
        id: `tx_${Date.now()}`,
        type: 'redeemed',
        points: -reward.pointsCost,
        description: `Redeemed ${reward.name}`,
        date: new Date(),
        rewardId: reward.id,
      };

      const updatedTransactions = [newTransaction, ...transactions];

      setUser(updatedUser);
      setTransactions(updatedTransactions);

      // Save to localStorage
      const data = {
        user: updatedUser,
        rewards,
        transactions: updatedTransactions,
      };
      localStorage.setItem(`loyalty-${userId}`, JSON.stringify(data));

      toast({
        title: "Reward Redeemed!",
        description: `Successfully redeemed ${reward.name}. Check your email for details.`,
      });
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Unable to redeem reward. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTierInfo = (tier: LoyaltyUser['tier']) => {
    const tierConfig = {
      bronze: {
        name: 'Bronze',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: Award,
        benefits: ['1x points on bookings', 'Standard support'],
        nextTier: 'silver',
        pointsRequired: 1000,
      },
      silver: {
        name: 'Silver',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: Star,
        benefits: ['1.5x points on bookings', 'Priority support', 'Late checkout'],
        nextTier: 'gold',
        pointsRequired: 2500,
      },
      gold: {
        name: 'Gold',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: Crown,
        benefits: ['2x points on bookings', 'Room upgrades', 'Welcome gifts'],
        nextTier: 'platinum',
        pointsRequired: 5000,
      },
      platinum: {
        name: 'Platinum',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: Trophy,
        benefits: ['3x points on bookings', 'Guaranteed upgrades', 'VIP support'],
        nextTier: 'diamond',
        pointsRequired: 10000,
      },
      diamond: {
        name: 'Diamond',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: Sparkles,
        benefits: ['4x points on bookings', 'Exclusive perks', 'Concierge service'],
        nextTier: null,
        pointsRequired: null,
      },
    };

    return tierConfig[tier];
  };

  const getRewardTypeIcon = (type: LoyaltyReward['type']) => {
    const iconMap = {
      discount: Percent,
      free_night: Gift,
      upgrade: TrendingUp,
      experience: Sparkles,
      gift_card: DollarSign,
    };
    return iconMap[type] || Gift;
  };

  const getAvailabilityBadge = (availability: LoyaltyReward['availability']) => {
    const config = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available' },
      limited: { color: 'bg-yellow-100 text-yellow-800', label: 'Limited' },
      out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' },
    };

    const { color, label } = config[availability];
    return <Badge className={color}>{label}</Badge>;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert className={className}>
        <AlertDescription>
          Unable to load loyalty information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const tierInfo = getTierInfo(user.tier);
  const TierIcon = tierInfo.icon;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-full", tierInfo.bgColor)}>
                <TierIcon className={cn("h-5 w-5", tierInfo.color)} />
              </div>
              <div>
                <p className="font-medium">{user.points.toLocaleString()} Points</p>
                <p className="text-sm text-muted-foreground">{tierInfo.name} Member</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Gift className="h-4 w-4 mr-1" />
              Rewards
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span>Loyalty Program</span>
          </h2>
          <p className="text-muted-foreground">
            Earn points, unlock rewards, and enjoy exclusive benefits
          </p>
        </div>
        <Button onClick={loadLoyaltyData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tier Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={cn("p-4 rounded-full", tierInfo.bgColor)}>
                <TierIcon className={cn("h-8 w-8", tierInfo.color)} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{user.points.toLocaleString()}</h3>
                <p className="text-muted-foreground">Available Points</p>
              </div>
            </div>
            <Badge className={cn(tierInfo.bgColor, tierInfo.color, "text-lg px-4 py-2")}>
              {tierInfo.name} Member
            </Badge>
          </div>

          {tierInfo.nextTier && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress to {getTierInfo(tierInfo.nextTier as LoyaltyUser['tier']).name}</span>
                <span>{user.points} / {user.nextTierPoints} points</span>
              </div>
              <Progress value={user.tierProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {user.nextTierPoints - user.points} more points to reach {getTierInfo(tierInfo.nextTier as LoyaltyUser['tier']).name}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{user.totalBookings}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${user.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{user.lifetimePoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Lifetime Points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showRewards && <TabsTrigger value="rewards">Rewards</TabsTrigger>}
          {showHistory && <TabsTrigger value="history">History</TabsTrigger>}
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{user.points}</p>
                <p className="text-sm text-muted-foreground">Available Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{rewards.filter(r => user.points >= r.pointsCost).length}</p>
                <p className="text-sm text-muted-foreground">Available Rewards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{Math.floor((Date.now() - user.memberSince.getTime()) / (365 * 24 * 60 * 60 * 1000))}</p>
                <p className="text-sm text-muted-foreground">Years Member</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{Math.round(user.totalSpent / user.totalBookings)}</p>
                <p className="text-sm text-muted-foreground">Avg Booking Value</p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Rewards */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.filter(r => r.featured).slice(0, 2).map((reward) => {
                  const IconComponent = getRewardTypeIcon(reward.type);
                  const canRedeem = user.points >= reward.pointsCost;

                  return (
                    <div key={reward.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-medium">{reward.name}</h4>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                        {getAvailabilityBadge(reward.availability)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {reward.pointsCost} points
                          </Badge>
                          <Badge variant="secondary">
                            ${reward.value} value
                          </Badge>
                        </div>
                        <Button 
                          size="sm"
                          disabled={!canRedeem || reward.availability === 'out_of_stock'}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {canRedeem ? 'Redeem' : 'Need more points'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showRewards && (
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const IconComponent = getRewardTypeIcon(reward.type);
                const canRedeem = user.points >= reward.pointsCost;

                return (
                  <Card key={reward.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        {getAvailabilityBadge(reward.availability)}
                      </div>
                      
                      <h4 className="font-medium mb-2">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{reward.pointsCost} points</Badge>
                          <Badge variant="secondary">${reward.value} value</Badge>
                        </div>
                        
                        {reward.conditions && (
                          <div className="text-xs text-muted-foreground">
                            {reward.conditions.slice(0, 2).map((condition, i) => (
                              <div key={i}>• {condition}</div>
                            ))}
                          </div>
                        )}
                        
                        <Button 
                          className="w-full"
                          disabled={!canRedeem || reward.availability === 'out_of_stock'}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {canRedeem ? 'Redeem Now' : `Need ${reward.pointsCost - user.points} more points`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        )}

        {showHistory && (
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const isEarned = transaction.type === 'earned' || transaction.type === 'bonus';
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            isEarned ? "bg-green-100" : "bg-red-100"
                          )}>
                            {transaction.type === 'earned' && <Coins className="h-4 w-4 text-green-600" />}
                            {transaction.type === 'bonus' && <Gift className="h-4 w-4 text-green-600" />}
                            {transaction.type === 'redeemed' && <ShoppingBag className="h-4 w-4 text-red-600" />}
                            {transaction.type === 'expired' && <Clock className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-medium",
                            isEarned ? "text-green-600" : "text-red-600"
                          )}>
                            {isEarned ? '+' : ''}{transaction.points}
                          </p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tierInfo.name} Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tierInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Tier Preview */}
          {tierInfo.nextTier && (
            <Card>
              <CardHeader>
                <CardTitle>Unlock More Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Reach {getTierInfo(tierInfo.nextTier as LoyaltyUser['tier']).name} tier to unlock:
                  </p>
                  <div className="space-y-2">
                    {getTierInfo(tierInfo.nextTier as LoyaltyUser['tier']).benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-purple-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Learn How to Earn More Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyPointsDisplay;
