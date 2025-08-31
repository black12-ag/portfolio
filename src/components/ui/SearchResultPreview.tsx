import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Utensils,
  Heart,
  Share2,
  Calendar,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Camera,
  Award,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface SearchResultPreviewProps {
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
    amenities?: (string | { name: string; category?: string })[];
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
  };
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onBook?: (resultId: string) => void;
  onFavorite?: (resultId: string) => void;
  onShare?: (result: any) => void;
  onViewDetails?: (resultId: string) => void;
  className?: string;
  size?: 'compact' | 'standard' | 'expanded';
  showActions?: boolean;
  showGallery?: boolean;
  maxWidth?: number;
}

const SearchResultPreview: React.FC<SearchResultPreviewProps> = ({
  result,
  isVisible,
  position,
  onClose,
  onBook,
  onFavorite,
  onShare,
  onViewDetails,
  className,
  size = 'standard',
  showActions = true,
  showGallery = true,
  maxWidth = 400
}) => {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-advance gallery images
  useEffect(() => {
    if (!showGallery || result.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % result.images.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [result.images.length, showGallery]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

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
    toast({
      title: "Redirecting to booking",
      description: `Opening booking form for ${result.title}`,
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
      'Coffee': <Coffee className="h-4 w-4" />,
      'Gym': <Dumbbell className="h-4 w-4" />,
      'Restaurant': <Utensils className="h-4 w-4" />,
      'Pool': <span className="text-xs">🏊</span>,
      'Spa': <span className="text-xs">🧖</span>,
      'Bar': <span className="text-xs">🍹</span>,
      'Business Center': <span className="text-xs">💼</span>,
      'Room Service': <span className="text-xs">🛎️</span>,
      'Air Conditioning': <span className="text-xs">❄️</span>,
      'Pet Friendly': <span className="text-xs">🐕</span>,
    };
    return iconMap[amenity] || <CheckCircle className="h-4 w-4" />;
  };

  const sizeClasses = {
    compact: 'w-80',
    standard: 'w-96',
    expanded: 'w-[32rem]'
  };

  const calculatePosition = () => {
    if (typeof window === 'undefined') return { top: 0, left: 0 };
    
    const { x, y } = position;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = maxWidth;
    const previewHeight = 500; // Estimated height
    
    let left = x + 10;
    let top = y + 10;
    
    // Adjust if preview goes off-screen
    if (left + previewWidth > viewportWidth - 20) {
      left = x - previewWidth - 10;
    }
    if (top + previewHeight > viewportHeight - 20) {
      top = y - previewHeight - 10;
    }
    
    // Ensure preview stays within viewport
    left = Math.max(10, Math.min(left, viewportWidth - previewWidth - 10));
    top = Math.max(10, Math.min(top, viewportHeight - previewHeight - 10));
    
    return { top, left };
  };

  if (!isVisible) return null;

  const computedPosition = calculatePosition();

  return (
    <AnimatePresence>
      <motion.div
        ref={previewRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed z-50 shadow-2xl",
          sizeClasses[size],
          className
        )}
        style={{
          top: computedPosition.top,
          left: computedPosition.left,
          maxWidth
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden border-2 bg-white/95 backdrop-blur-sm">
          {/* Header with close button */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Gallery */}
          {showGallery && result.images.length > 0 && (
            <div className="relative h-48 overflow-hidden">
              <motion.img
                key={currentImageIndex}
                src={result.images[currentImageIndex]}
                alt={result.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              
              {/* Image loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Image navigation */}
              {result.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                    onClick={() => handleImageNavigation('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                    onClick={() => handleImageNavigation('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {result.images.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentImageIndex 
                            ? "bg-white" 
                            : "bg-white/50"
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {result.isVerified && (
                  <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {result.isSuperhost && (
                  <Badge variant="secondary" className="bg-purple-500 text-white text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Superhost
                  </Badge>
                )}
                {result.instantBook && (
                  <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Instant Book
                  </Badge>
                )}
              </div>
            </div>
          )}

          <CardContent className="p-4">
            {/* Title and rating */}
            <div className="mb-3">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-lg leading-tight pr-2 line-clamp-2">
                  {result.title}
                </h3>
                {result.rating && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
                    {result.reviewCount && (
                      <span className="text-xs text-gray-500">({result.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Location and category */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.category && (
                  <>
                    <span>•</span>
                    <span>{typeof result.category === 'string' ? result.category : (result.category as any)?.name || (result.category as any)?.category || 'Property'}</span>
                  </>
                )}
                {result.distance && (
                  <>
                    <span>•</span>
                    <span>{result.distance}</span>
                  </>
                )}
              </div>
            </div>

            {/* Property details for expanded size */}
            {size === 'expanded' && (
              <div className="mb-3 space-y-2">
                {/* Property specs */}
                {(result.bedrooms || result.bathrooms || result.maxGuests) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {result.bedrooms && (
                      <div className="flex items-center gap-1">
                        <span>🛏️</span>
                        <span>{result.bedrooms} bed{result.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {result.bathrooms && (
                      <div className="flex items-center gap-1">
                        <span>🚿</span>
                        <span>{result.bathrooms} bath{result.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {result.maxGuests && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{result.maxGuests} guest{result.maxGuests !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Host info */}
                {result.hostName && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Host:</span> {result.hostName}
                  </div>
                )}

                {/* Check-in/out times */}
                {(result.checkInTime || result.checkOutTime) && (
                  <div className="text-sm text-gray-600">
                    {result.checkInTime && (
                      <span>Check-in: {result.checkInTime}</span>
                    )}
                    {result.checkInTime && result.checkOutTime && <span> • </span>}
                    {result.checkOutTime && (
                      <span>Check-out: {result.checkOutTime}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {result.description && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {result.description}
              </p>
            )}

            {/* Amenities */}
            {result.amenities && result.amenities.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {result.amenities.slice(0, size === 'compact' ? 4 : 6).map((amenity, index) => {
                    const amenityName = typeof amenity === 'string' ? amenity : amenity?.name || String(amenity);
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              {getAmenityIcon(amenityName)}
                              <span className="hidden sm:inline">{amenityName}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{amenityName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                  {result.amenities.length > (size === 'compact' ? 4 : 6) && (
                    <div className="text-xs text-gray-500 px-2 py-1">
                      +{result.amenities.length - (size === 'compact' ? 4 : 6)} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact info for expanded size */}
            {size === 'expanded' && result.contact && (
              <div className="mb-3 space-y-1">
                <Separator />
                <div className="text-sm text-gray-600 space-y-1 pt-2">
                  {result.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{result.contact.phone}</span>
                    </div>
                  )}
                  {result.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{result.contact.email}</span>
                    </div>
                  )}
                  {result.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <a 
                        href={result.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price and actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {result.price && (
                  <div className="font-semibold text-lg text-green-600">
                    {formatPrice(result.price, result.currency)}
                    <span className="text-sm text-gray-500 ml-1">per night</span>
                  </div>
                )}
                {result.availability !== undefined && (
                  <div className={cn(
                    "text-xs",
                    result.availability ? "text-green-600" : "text-red-600"
                  )}>
                    {result.availability ? "Available" : "Not available"}
                  </div>
                )}
              </div>

              {showActions && (
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleFavorite}
                        >
                          <Heart className={cn(
                            "h-4 w-4",
                            isFavorited ? "text-red-500 fill-current" : "text-gray-400"
                          )} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFavorited ? "Remove from favorites" : "Add to favorites"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share property</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {onViewDetails && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onViewDetails(result.id)}
                          >
                            <Eye className="h-4 w-4 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {onBook && result.availability !== false && (
                    <Button
                      size="sm"
                      className="ml-2"
                      onClick={handleBook}
                    >
                      Book Now
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer with source and last updated */}
            {size === 'expanded' && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  {result.isLiteApiHotel && (
                    <Badge variant="outline" className="text-xs">LiteAPI</Badge>
                  )}
                  {result.propertyType && (
                    <span>{result.propertyType}</span>
                  )}
                </div>
                {result.lastUpdated && (
                  <span>Updated {result.lastUpdated}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchResultPreview;