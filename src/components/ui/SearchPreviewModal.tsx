import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  MapPin,
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Utensils,
  Heart,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Camera,
  Award,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Globe,
  Bed,
  Bath,
  Home,
  Shield,
  Map,
  CreditCard,
  MessageCircle,
  Info,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface SearchPreviewModalProps {
  result: {
    id: string;
    title: string;
    description?: string;
    images: string[];
    rating?: number;
    reviewCount?: number;
    price?: number;
    currency?: string;
    location?: string;
    amenities?: string[];
    isVerified?: boolean;
    isSuperhost?: boolean;
    isLiteApiHotel?: boolean;
    category?: string;
    distance?: string;
    availability?: boolean;
    lastUpdated?: string;
    hostName?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
    instantBook?: boolean;
    coordinates?: { lat: number; lng: number };
    features?: string[];
    policies?: string[];
    contact?: {
      phone?: string;
      email?: string;
      website?: string;
    };
    reviews?: Array<{
      id: string;
      author: string;
      rating: number;
      comment: string;
      date: string;
      avatar?: string;
    }>;
    nearbyAttractions?: Array<{
      name: string;
      distance: string;
      type: string;
    }>;
    area?: string;
    priceBreakdown?: {
      basePrice: number;
      cleaningFee?: number;
      serviceFee?: number;
      taxes?: number;
      total: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onBook?: (resultId: string) => void;
  onFavorite?: (resultId: string) => void;
  onShare?: (result: any) => void;
  onContact?: (resultId: string) => void;
}

const SearchPreviewModal: React.FC<SearchPreviewModalProps> = ({
  result,
  isOpen,
  onClose,
  onBook,
  onFavorite,
  onShare,
  onContact
}) => {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setActiveTab('overview');
      setShowFullDescription(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        checkIn: '',
        checkOut: '',
        guests: 2
      });
    }
  }, [isOpen]);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    setCurrentImageIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % result.images.length;
      } else {
        return prev === 0 ? result.images.length - 1 : prev - 1;
      }
    });
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(result.id);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited 
        ? `${result.title} removed from your favorites`
        : `${result.title} added to your favorites`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: result.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Property link copied to clipboard",
      });
    }
    onShare?.(result);
  };

  const handleBook = () => {
    onBook?.(result.id);
    onClose();
    toast({
      title: "Redirecting to booking",
      description: `Opening booking form for ${result.title}`,
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onContact?.(result.id);
    toast({
      title: "Message sent",
      description: "Your inquiry has been sent to the host",
    });
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      checkIn: '',
      checkOut: '',
      guests: 2
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
      'Coffee': <Coffee className="h-4 w-4" />,
      'Gym': <Dumbbell className="h-4 w-4" />,
      'Restaurant': <Utensils className="h-4 w-4" />,
      'Pool': <span className="text-base">🏊</span>,
      'Spa': <span className="text-base">🧖</span>,
      'Bar': <span className="text-base">🍹</span>,
      'Business Center': <span className="text-base">💼</span>,
      'Room Service': <span className="text-base">🛎️</span>,
      'Air Conditioning': <span className="text-base">❄️</span>,
      'Pet Friendly': <span className="text-base">🐕</span>,
    };
    return iconMap[amenity] || <CheckCircle className="h-4 w-4" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {result.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {result.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{result.location}</span>
                    </div>
                  )}
                  {result.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{result.rating.toFixed(1)}</span>
                      {result.reviewCount && (
                        <span>({result.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                  {result.category && (
                    <>
                      <span>•</span>
                      <span>{result.category}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  className="flex items-center gap-2"
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    isFavorited ? "text-red-500 fill-current" : "text-gray-400"
                  )} />
                  <span className="hidden sm:inline">
                    {isFavorited ? "Saved" : "Save"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pt-4">
              {/* Image Gallery */}
              {result.images.length > 0 && (
                <div className="relative h-80 mb-6 rounded-lg overflow-hidden">
                  <motion.img
                    key={currentImageIndex}
                    src={result.images[currentImageIndex]}
                    alt={`${result.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Image navigation */}
                  {result.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                        onClick={() => handleImageNavigation('prev')}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                        onClick={() => handleImageNavigation('next')}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {result.isVerified && (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {result.isSuperhost && (
                      <Badge variant="secondary" className="bg-purple-500 text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Superhost
                      </Badge>
                    )}
                    {result.instantBook && (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Instant Book
                      </Badge>
                    )}
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {result.images.length}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Property details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left column - Details */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Property stats */}
                      {(result.bedrooms || result.bathrooms || result.maxGuests) && (
                        <div className="flex items-center gap-6">
                          {result.bedrooms && (
                            <div className="flex items-center gap-2">
                              <Bed className="h-5 w-5 text-gray-400" />
                              <span>{result.bedrooms} bedroom{result.bedrooms !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {result.bathrooms && (
                            <div className="flex items-center gap-2">
                              <Bath className="h-5 w-5 text-gray-400" />
                              <span>{result.bathrooms} bathroom{result.bathrooms !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {result.maxGuests && (
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-gray-400" />
                              <span>{result.maxGuests} guest{result.maxGuests !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {result.description && (
                        <div>
                          <h3 className="font-semibold mb-2">About this place</h3>
                          <p className={cn(
                            "text-gray-700 leading-relaxed",
                            !showFullDescription && "line-clamp-3"
                          )}>
                            {result.description}
                          </p>
                          {result.description.length > 200 && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm"
                              onClick={() => setShowFullDescription(!showFullDescription)}
                            >
                              {showFullDescription ? "Show less" : "Show more"}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Host info */}
                      {result.hostName && (
                        <div>
                          <h3 className="font-semibold mb-2">Hosted by {result.hostName}</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {result.hostName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{result.hostName}</p>
                              {result.isSuperhost && (
                                <p className="text-sm text-gray-600">Superhost</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Check-in info */}
                      {(result.checkInTime || result.checkOutTime) && (
                        <div>
                          <h3 className="font-semibold mb-2">Check-in information</h3>
                          <div className="space-y-2 text-sm">
                            {result.checkInTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Check-in: {result.checkInTime}</span>
                              </div>
                            )}
                            {result.checkOutTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Check-out: {result.checkOutTime}</span>
                              </div>
                            )}
                            {result.instantBook && (
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-500" />
                                <span>Instant booking available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cancellation policy */}
                      {result.cancellationPolicy && (
                        <div>
                          <h3 className="font-semibold mb-2">Cancellation policy</h3>
                          <p className="text-sm text-gray-700">{result.cancellationPolicy}</p>
                        </div>
                      )}

                      {/* Nearby attractions */}
                      {result.nearbyAttractions && result.nearbyAttractions.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Nearby attractions</h3>
                          <div className="space-y-2">
                            {result.nearbyAttractions.map((attraction, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-medium">{attraction.name}</span>
                                  <span className="text-gray-500 ml-2">({attraction.type})</span>
                                </div>
                                <span className="text-gray-600">{attraction.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column - Booking card */}
                    <div className="md:col-span-1">
                      <Card className="sticky top-4">
                        <CardContent className="p-6">
                          {/* Price */}
                          {result.price && (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">
                                  {formatPrice(result.price, result.currency)}
                                </span>
                                <span className="text-gray-600">per night</span>
                              </div>
                              
                              {/* Price breakdown */}
                              {result.priceBreakdown && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Base price</span>
                                    <span>{formatPrice(result.priceBreakdown.basePrice, result.currency)}</span>
                                  </div>
                                  {result.priceBreakdown.cleaningFee && (
                                    <div className="flex justify-between">
                                      <span>Cleaning fee</span>
                                      <span>{formatPrice(result.priceBreakdown.cleaningFee, result.currency)}</span>
                                    </div>
                                  )}
                                  {result.priceBreakdown.serviceFee && (
                                    <div className="flex justify-between">
                                      <span>Service fee</span>
                                      <span>{formatPrice(result.priceBreakdown.serviceFee, result.currency)}</span>
                                    </div>
                                  )}
                                  {result.priceBreakdown.taxes && (
                                    <div className="flex justify-between">
                                      <span>Taxes</span>
                                      <span>{formatPrice(result.priceBreakdown.taxes, result.currency)}</span>
                                    </div>
                                  )}
                                  <Separator />
                                  <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{formatPrice(result.priceBreakdown.total, result.currency)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Availability status */}
                          {result.availability !== undefined && (
                            <div className={cn(
                              "flex items-center gap-2 mb-4 text-sm",
                              result.availability ? "text-green-600" : "text-red-600"
                            )}>
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                result.availability ? "bg-green-500" : "bg-red-500"
                              )} />
                              <span>{result.availability ? "Available" : "Not available"}</span>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="space-y-3">
                            {onBook && result.availability !== false && (
                              <Button onClick={handleBook} className="w-full">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Book Now
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab('contact')}
                              className="w-full"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact Host
                            </Button>
                          </div>

                          {/* Source info */}
                          {result.isLiteApiHotel && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Badge variant="outline" className="text-xs">LiteAPI</Badge>
                                <span>Verified listing</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Amenities Tab */}
                <TabsContent value="amenities" className="mt-6">
                  {result.amenities && result.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Info className="h-8 w-8 mx-auto mb-2" />
                      <p>No amenities listed for this property</p>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  {result.reviews && result.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {/* Overall rating */}
                      {result.rating && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-6 w-6 text-yellow-400 fill-current" />
                            <span className="text-2xl font-bold">{result.rating.toFixed(1)}</span>
                          </div>
                          <div className="text-gray-600">
                            Based on {result.reviewCount} review{result.reviewCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      {/* Individual reviews */}
                      <div className="space-y-4">
                        {result.reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                {review.avatar ? (
                                  <img src={review.avatar} alt={review.author} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {review.author.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{review.author}</span>
                                  <div className="flex">
                                    {renderStars(review.rating)}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No reviews yet for this property</p>
                    </div>
                  )}
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact form */}
                    <div>
                      <h3 className="font-semibold mb-4">Send a message</h3>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="Your name"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email *</label>
                            <Input
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="Your phone number"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Check-in</label>
                            <Input
                              type="date"
                              value={contactForm.checkIn}
                              onChange={(e) => setContactForm({ ...contactForm, checkIn: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Check-out</label>
                            <Input
                              type="date"
                              value={contactForm.checkOut}
                              onChange={(e) => setContactForm({ ...contactForm, checkOut: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Guests</label>
                            <Input
                              type="number"
                              min="1"
                              value={contactForm.guests}
                              onChange={(e) => setContactForm({ ...contactForm, guests: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Message *</label>
                          <Textarea
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Hi! I'm interested in your property..."
                            rows={4}
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          Send Message
                        </Button>
                      </form>
                    </div>

                    {/* Contact info */}
                    <div>
                      <h3 className="font-semibold mb-4">Contact information</h3>
                      <div className="space-y-4">
                        {result.contact?.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Phone</p>
                              <p className="text-sm text-gray-600">{result.contact.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {result.contact?.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-gray-600">{result.contact.email}</p>
                            </div>
                          </div>
                        )}
                        
                        {result.contact?.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Website</p>
                              <a 
                                href={result.contact.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                Visit website
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {result.hostName && (
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Host</p>
                              <p className="text-sm text-gray-600">{result.hostName}</p>
                            </div>
                          </div>
                        )}

                        {/* Response time info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-sm">Response time</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Usually responds within 24 hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchPreviewModal;
