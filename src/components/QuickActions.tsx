import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock, 
  TrendingUp, 
  MapPin, 
  Star, 
  Zap, 
  Bell, 
  Share2, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  className?: string;
}

export default function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // Load recently viewed properties
    const recent = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
    setRecentlyViewed(recent.slice(0, 3));
  }, []);

  const quickSearchOptions = [
    { label: 'Hotels in Bole', location: 'Bole', icon: '🏨', count: 25 },
    { label: 'City Center', location: 'Piazza', icon: '🏙️', count: 18 },
    { label: 'Airport Area', location: 'Bole Airport', icon: '✈️', count: 12 },
    { label: 'Business District', location: 'Kazanchis', icon: '🏢', count: 15 },
  ];

  const trendingDestinations = [
    { name: 'Bole', trend: '+15%', price: 120 },
    { name: 'Piazza', trend: '+8%', price: 95 },
    { name: 'Kazanchis', trend: '+12%', price: 140 },
  ];

  const handleQuickSearch = (location: string) => {
    navigate(`/search?location=${encodeURIComponent(location)}`);
    toast({
      title: "Quick search",
      description: `Searching for properties in ${location}`,
    });
  };

  const handlePriceAlert = (destination: string) => {
    toast({
      title: "Price alert set! 🔔",
      description: `You'll be notified when prices drop in ${destination}`,
    });
    // In a real app, this would save to user preferences
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Quick Search Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickSearchOptions.map((option) => (
                <Button
                  key={option.location}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start gap-1 hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => handleQuickSearch(option.location)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {option.count} properties
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingDestinations.map((dest) => (
                <div
                  key={dest.name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleQuickSearch(dest.name)}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{dest.name}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {dest.trend} this week
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(dest.price)}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriceAlert(dest.name);
                          }}
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set price alert</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentlyViewed.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/hotel/${property.id}`)}
                  >
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{property.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{property.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium">{formatPrice(property.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-3 flex flex-col gap-2"
                onClick={() => navigate('/bookings')}
              >
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-sm">My Bookings</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-3 flex flex-col gap-2"
                onClick={() => navigate('/search')}
              >
                <Filter className="h-5 w-5 text-green-500" />
                <span className="text-sm">Advanced Search</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-3 flex flex-col gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Metah Travel',
                      text: 'Check out this amazing travel booking platform!',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    toast({
                      title: "Link copied!",
                      description: "Share Metah with your friends",
                    });
                  }
                }}
              >
                <Share2 className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Share App</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-3 flex flex-col gap-2"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(() => {
                      navigate('/search?location=nearby');
                    });
                  }
                }}
              >
                <Search className="h-5 w-5 text-red-500" />
                <span className="text-sm">Near Me</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
