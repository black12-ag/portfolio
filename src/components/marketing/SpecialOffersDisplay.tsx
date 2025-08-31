import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles,
  Clock,
  Users,
  Star,
  Gift,
  Zap,
  Tag,
  Calendar,
  MapPin,
  ArrowRight,
  Heart,
  Share2,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  Percent,
  DollarSign
} from 'lucide-react';
import { discountService, DiscountCode } from '@/lib/discountService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'flash_sale' | 'early_bird' | 'loyalty' | 'seasonal' | 'bundle';
  discountCode?: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  originalPrice?: number;
  discountedPrice?: number;
  validFrom: Date;
  validTo: Date;
  imageUrl?: string;
  featured: boolean;
  urgency?: {
    type: 'limited_time' | 'limited_quantity' | 'limited_users';
    value: number;
    remaining: number;
  };
  conditions?: string[];
  tags: string[];
  popularity: number;
  category: string;
  location?: string;
}

interface SpecialOffersDisplayProps {
  category?: string;
  location?: string;
  maxOffers?: number;
  showFeatured?: boolean;
  layout?: 'grid' | 'carousel' | 'list';
  className?: string;
  onOfferSelect?: (offer: SpecialOffer) => void;
}

const SpecialOffersDisplay: React.FC<SpecialOffersDisplayProps> = ({
  category,
  location,
  maxOffers = 6,
  showFeatured = true,
  layout = 'grid',
  className,
  onOfferSelect
}) => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favoriteOffers, setFavoriteOffers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadOffers();
    loadFavorites();
  }, [category, location]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      // Generate sample offers based on discount codes
      const discountCodes = discountService.getActiveDiscounts();
      const sampleOffers = generateSampleOffers(discountCodes);
      
      // Filter by category and location if specified
      let filteredOffers = sampleOffers;
      if (category) {
        filteredOffers = filteredOffers.filter(offer => offer.category === category);
      }
      if (location) {
        filteredOffers = filteredOffers.filter(offer => offer.location === location);
      }

      // Sort by featured, then by popularity
      filteredOffers.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.popularity - a.popularity;
      });

      // Limit number of offers
      if (maxOffers) {
        filteredOffers = filteredOffers.slice(0, maxOffers);
      }

      setOffers(filteredOffers);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem('favorite-offers');
    if (stored) {
      try {
        const favorites = JSON.parse(stored);
        setFavoriteOffers(new Set(favorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  };

  const generateSampleOffers = (discountCodes: DiscountCode[]): SpecialOffer[] => {
    const sampleOffers: SpecialOffer[] = [
      {
        id: 'offer_1',
        title: 'Summer Escape Special',
        description: 'Book your perfect summer getaway with exclusive savings on beach resorts and mountain retreats.',
        type: 'seasonal',
        discountCode: 'SUMMER25',
        discountValue: 25,
        discountType: 'percentage',
        originalPrice: 299,
        discountedPrice: 224,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/summer-resort.jpg',
        featured: true,
        urgency: {
          type: 'limited_time',
          value: 30,
          remaining: 12
        },
        conditions: ['Minimum 3 nights stay', 'Valid for new bookings only'],
        tags: ['Beach', 'Summer', 'Resort'],
        popularity: 9,
        category: 'vacation',
        location: 'Beach Destinations'
      },
      {
        id: 'offer_2',
        title: 'Early Bird Business Travel',
        description: 'Save big on business hotel bookings when you plan ahead. Perfect for corporate travelers.',
        type: 'early_bird',
        discountCode: 'EARLYBIRD',
        discountValue: 50,
        discountType: 'fixed',
        originalPrice: 189,
        discountedPrice: 139,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/business-hotel.jpg',
        featured: true,
        urgency: {
          type: 'limited_users',
          value: 100,
          remaining: 23
        },
        conditions: ['Book 30+ days in advance', 'Business hotels only'],
        tags: ['Business', 'City', 'Early Bird'],
        popularity: 8,
        category: 'business',
        location: 'City Centers'
      },
      {
        id: 'offer_3',
        title: 'Weekend Warriors Deal',
        description: 'Exclusive weekend rates for spontaneous getaways. Book Friday to Sunday stays.',
        type: 'flash_sale',
        discountCode: 'WEEKEND15',
        discountValue: 15,
        discountType: 'percentage',
        originalPrice: 159,
        discountedPrice: 135,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/weekend-getaway.jpg',
        featured: false,
        urgency: {
          type: 'limited_time',
          value: 7,
          remaining: 3
        },
        conditions: ['Weekend stays only', 'Friday-Sunday'],
        tags: ['Weekend', 'Getaway', 'Flash Sale'],
        popularity: 7,
        category: 'leisure',
        location: 'Various'
      },
      {
        id: 'offer_4',
        title: 'Loyalty Rewards Exclusive',
        description: 'Thank you for being a valued customer! Enjoy exclusive savings on your next stay.',
        type: 'loyalty',
        discountCode: 'LOYALTY25',
        discountValue: 25,
        discountType: 'percentage',
        originalPrice: 249,
        discountedPrice: 187,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/luxury-suite.jpg',
        featured: false,
        conditions: ['For returning customers only', 'Premium properties'],
        tags: ['Loyalty', 'Premium', 'Exclusive'],
        popularity: 6,
        category: 'luxury',
        location: 'Premium Hotels'
      },
      {
        id: 'offer_5',
        title: 'Family Fun Package',
        description: 'Create unforgettable memories with our family-friendly hotels and resorts.',
        type: 'bundle',
        discountValue: 20,
        discountType: 'percentage',
        originalPrice: 399,
        discountedPrice: 319,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/family-resort.jpg',
        featured: false,
        conditions: ['Family rooms only', 'Minimum 2 adults + 1 child'],
        tags: ['Family', 'Kids', 'Activities'],
        popularity: 8,
        category: 'family',
        location: 'Family Resorts'
      },
      {
        id: 'offer_6',
        title: 'Last Minute Deals',
        description: 'Spontaneous traveler? Grab amazing last-minute deals on available rooms.',
        type: 'flash_sale',
        discountValue: 30,
        discountType: 'percentage',
        originalPrice: 199,
        discountedPrice: 139,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/last-minute.jpg',
        featured: false,
        urgency: {
          type: 'limited_quantity',
          value: 50,
          remaining: 8
        },
        conditions: ['Check-in within 48 hours', 'Subject to availability'],
        tags: ['Last Minute', 'Flash Sale', 'Urgent'],
        popularity: 7,
        category: 'deals',
        location: 'Various'
      }
    ];

    return sampleOffers;
  };

  const handleOfferClick = (offer: SpecialOffer) => {
    onOfferSelect?.(offer);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code Copied!",
        description: `Discount code ${code} has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy code to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = (offerId: string) => {
    const newFavorites = new Set(favoriteOffers);
    if (newFavorites.has(offerId)) {
      newFavorites.delete(offerId);
    } else {
      newFavorites.add(offerId);
    }
    setFavoriteOffers(newFavorites);
    localStorage.setItem('favorite-offers', JSON.stringify(Array.from(newFavorites)));
  };

  const handleShare = async (offer: SpecialOffer) => {
    const shareData = {
      title: offer.title,
      text: offer.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Offer link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const getOfferTypeIcon = (type: SpecialOffer['type']) => {
    const iconMap = {
      discount: Tag,
      flash_sale: Zap,
      early_bird: Calendar,
      loyalty: Star,
      seasonal: Sparkles,
      bundle: Gift
    };
    return iconMap[type] || Tag;
  };

  const getOfferTypeBadge = (type: SpecialOffer['type']) => {
    const typeConfig = {
      discount: { color: 'bg-blue-100 text-blue-800', label: 'Discount' },
      flash_sale: { color: 'bg-red-100 text-red-800', label: 'Flash Sale' },
      early_bird: { color: 'bg-green-100 text-green-800', label: 'Early Bird' },
      loyalty: { color: 'bg-purple-100 text-purple-800', label: 'Loyalty' },
      seasonal: { color: 'bg-orange-100 text-orange-800', label: 'Seasonal' },
      bundle: { color: 'bg-pink-100 text-pink-800', label: 'Bundle' }
    };

    const config = typeConfig[type];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: SpecialOffer['urgency']) => {
    if (!urgency) return null;

    let text = '';
    let color = 'bg-yellow-100 text-yellow-800';

    switch (urgency.type) {
      case 'limited_time':
        text = `${urgency.remaining} days left`;
        color = urgency.remaining <= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
        break;
      case 'limited_quantity':
        text = `${urgency.remaining} left`;
        color = urgency.remaining <= 10 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
        break;
      case 'limited_users':
        text = `${urgency.remaining} spots left`;
        color = urgency.remaining <= 25 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
        break;
    }

    return (
      <Badge className={color}>
        <Clock className="h-3 w-3 mr-1" />
        {text}
      </Badge>
    );
  };

  const formatDiscount = (offer: SpecialOffer): string => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `$${offer.discountValue} OFF`;
    }
  };

  const renderOfferCard = (offer: SpecialOffer, index: number) => {
    const IconComponent = getOfferTypeIcon(offer.type);
    const isFavorite = favoriteOffers.has(offer.id);

    return (
      <Card 
        key={offer.id} 
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-lg",
          offer.featured && "ring-2 ring-primary/20",
          layout === 'carousel' && "flex-shrink-0 w-80"
        )}
        onClick={() => handleOfferClick(offer)}
      >
        {offer.featured && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        <CardHeader className="relative p-0">
          {offer.imageUrl && (
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4 space-y-2">
                {getOfferTypeBadge(offer.type)}
                {getUrgencyBadge(offer.urgency)}
              </div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(offer.id);
                  }}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(offer);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    {offer.discountType === 'percentage' ? (
                      <Percent className="h-5 w-5 text-green-600" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-green-600" />
                    )}
                    <span className="text-2xl font-bold text-green-600">
                      {formatDiscount(offer)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {offer.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {offer.description}
              </p>
            </div>

            {(offer.originalPrice && offer.discountedPrice) && (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  ${offer.discountedPrice}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${offer.originalPrice}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Save ${offer.originalPrice - offer.discountedPrice}
                </Badge>
              </div>
            )}

            {offer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {offer.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {offer.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{offer.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              {offer.discountCode ? (
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {offer.discountCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(offer.discountCode);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Auto-applied at checkout
                </span>
              )}
              
              <Button variant="ghost" size="sm" className="group-hover:text-primary">
                View Deal
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(offers.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(offers.length / 3)) % Math.ceil(offers.length / 3));
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No special offers available</h3>
        <p className="text-muted-foreground">
          Check back later for exciting deals and promotions!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <span>Special Offers</span>
          </h2>
          <p className="text-muted-foreground">
            Don't miss out on these exclusive deals and promotions
          </p>
        </div>
        {offers.length > maxOffers && (
          <Button variant="outline">
            View All Offers
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Offers Display */}
      {layout === 'carousel' ? (
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 space-x-6"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {offers.map((offer, index) => renderOfferCard(offer, index))}
            </div>
          </div>
          
          {offers.length > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ) : layout === 'list' ? (
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <div key={offer.id} className="w-full">
              {renderOfferCard(offer, index)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => renderOfferCard(offer, index))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffersDisplay;
