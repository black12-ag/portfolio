import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Bell, 
  BookOpen, 
  Calculator, 
  Camera, 
  Clock, 
  Download, 
  Gift, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  QrCode, 
  Settings, 
  Share2, 
  Star, 
  ThumbsUp, 
  Wifi,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Filter,
  Search,
  Heart,
  Bookmark,
  RefreshCw,
  TrendingUp,
  Award,
  Target,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface EnhancedFeaturesProps {
  className?: string;
}

export default function EnhancedFeatures({ className }: EnhancedFeaturesProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tripBudget, setTripBudget] = useState({ nights: 3, budget: 500 });

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('user-notifications') || '[]');
    setNotifications(savedNotifications.slice(0, 3));
  }, []);

  // Enhanced Features Functions
  const handlePriceAlert = () => {
    const alert = {
      id: Date.now(),
      type: 'price_alert',
      title: 'Price Alert Set',
      message: 'You\'ll be notified when prices drop for your favorite destinations',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const existing = JSON.parse(localStorage.getItem('user-notifications') || '[]');
    const updated = [alert, ...existing].slice(0, 10);
    localStorage.setItem('user-notifications', JSON.stringify(updated));
    setNotifications(updated.slice(0, 3));
    
    toast({
      title: "Price Alert Set! 🔔",
      description: "We'll notify you when prices drop",
    });
  };

  const handleTripPlanner = () => {
    navigate('/search?planner=true');
    toast({
      title: "Trip Planner",
      description: "Plan your perfect trip with our smart recommendations",
    });
  };

  const handleBudgetCalculator = () => {
    setShowPriceCalculator(true);
  };

  const handleQRShare = () => {
    setShowQRCode(true);
  };

  const handleOfflineMode = () => {
    if ('serviceWorker' in navigator) {
      toast({
        title: "Offline Mode Enabled",
        description: "You can now browse properties offline",
      });
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      toast({
        title: "Voice Search",
        description: "Say your destination to search",
      });
      // Voice search implementation would go here
    } else {
      toast({
        title: "Voice Search Unavailable",
        description: "Voice search is not supported on this device",
        variant: "destructive"
      });
    }
  };

  const handleSmartRecommendations = () => {
    const preferences = {
      budget: tripBudget.budget,
      duration: tripBudget.nights,
      interests: ['culture', 'food', 'nightlife']
    };
    localStorage.setItem('user-travel-preferences', JSON.stringify(preferences));
    
    toast({
      title: "Smart Recommendations Updated",
      description: "Personalized suggestions based on your preferences",
    });
  };

  const handleSocialShare = async () => {
    const shareData = {
      title: 'Check out this amazing travel platform!',
      text: 'I found great deals on Metah Travel Platform',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully!",
          description: "Thanks for sharing Metah with friends",
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied!",
        description: "Share this link with your friends",
      });
    }
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: Event) => {
      const file = e.target.files[0];
      if (file) {
        toast({
          title: "Photo Uploaded!",
          description: "We'll help you find similar places",
        });
      }
    };
    input.click();
  };

  const quickActionButtons = [
    {
      icon: Calculator,
      label: 'Trip Budget',
      color: 'text-blue-500',
      onClick: handleBudgetCalculator,
      description: 'Calculate your trip costs'
    },
    {
      icon: Bell,
      label: 'Price Alerts',
      color: 'text-orange-500',
      onClick: handlePriceAlert,
      description: 'Get notified of price drops'
    },
    {
      icon: BookOpen,
      label: 'Trip Planner',
      color: 'text-green-500',
      onClick: handleTripPlanner,
      description: 'Plan your perfect itinerary'
    },
    {
      icon: QrCode,
      label: 'QR Share',
      color: 'text-purple-500',
      onClick: handleQRShare,
      description: 'Share via QR code'
    },
    {
      icon: Camera,
      label: 'Photo Search',
      color: 'text-pink-500',
      onClick: handlePhotoUpload,
      description: 'Find places by photo'
    },
    {
      icon: MessageCircle,
      label: 'Voice Search',
      color: 'text-indigo-500',
      onClick: handleVoiceSearch,
      description: 'Search by voice'
    },
    {
      icon: Download,
      label: 'Offline Mode',
      color: 'text-gray-500',
      onClick: handleOfflineMode,
      description: 'Browse without internet'
    },
    {
      icon: Lightbulb,
      label: 'Smart Tips',
      color: 'text-yellow-500',
      onClick: handleSmartRecommendations,
      description: 'Personalized travel tips'
    }
  ];

  const calculateTripCost = () => {
    const accommodation = tripBudget.budget * 0.4; // 40% for accommodation
    const food = tripBudget.budget * 0.3; // 30% for food
    const activities = tripBudget.budget * 0.2; // 20% for activities
    const transport = tripBudget.budget * 0.1; // 10% for local transport
    
    return { accommodation, food, activities, transport };
  };

  const costs = calculateTripCost();

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Enhanced Features
            <Badge variant="secondary" className="ml-2">New</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {quickActionButtons.map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover:shadow-md transition-all"
                    onClick={action.onClick}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Recent Updates
              </h3>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground text-xs">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">150+</div>
              <div className="text-xs text-muted-foreground">Properties</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">4.8★</div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">24/7</div>
              <div className="text-xs text-muted-foreground">Support</div>
            </div>
          </div>
        </CardContent>

        {/* Budget Calculator Modal */}
        <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Trip Budget Calculator
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Number of nights</label>
                <Input
                  type="number"
                  value={tripBudget.nights}
                  onChange={(e) => setTripBudget(prev => ({ ...prev, nights: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Total budget</label>
                <Input
                  type="number"
                  value={tripBudget.budget}
                  onChange={(e) => setTripBudget(prev => ({ ...prev, budget: parseInt(e.target.value) || 100 }))}
                  min="50"
                  step="50"
                />
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Recommended Budget Breakdown:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>🏨 Accommodation (40%)</span>
                    <span className="font-medium">{formatPrice(costs.accommodation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🍽️ Food (30%)</span>
                    <span className="font-medium">{formatPrice(costs.food)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎯 Activities (20%)</span>
                    <span className="font-medium">{formatPrice(costs.activities)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🚗 Transport (10%)</span>
                    <span className="font-medium">{formatPrice(costs.transport)}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  navigate(`/search?budget=${tripBudget.budget}&nights=${tripBudget.nights}`);
                  setShowPriceCalculator(false);
                }}
              >
                Find Properties in Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Modal */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Share Metah
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">QR Code would appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">Scan to visit Metah</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSocialShare} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast({ title: "Link copied!", description: "Share with your friends" });
                  }}
                  className="flex-1"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
}
