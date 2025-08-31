import { Card, CardContent } from '@/components/ui/card';
import React, { useState, useEffect, useRef, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseHelpers } from '@/lib/supabase';
import { useWishlist } from '@/hooks/useWishlist';
import type { PropertyDetailExtras } from '@/types/property';
import { useTranslation } from "react-i18next";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Wifi, Car, Coffee, Waves, LucideIcon, Heart, ChevronLeft, ChevronRight, Bath, Bed, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { createHotelImageFromUrl } from '@/utils/imageTransformers';
import SearchResultPreview from '@/components/ui/SearchResultPreview';
import SearchPreviewModal from '@/components/ui/SearchPreviewModal';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  rating: number;
  reviews: number;
  images: string[];
  type: 'property' | 'hotel';
  amenities: string[];
  isVerified?: boolean;
  isSuperhost?: boolean;
  distance?: string;
  area?: string;
  description?: string;
  isLiteApiHotel?: boolean;
  liteApiId?: string;
  reviews_data?: Array<{
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  // Optional extended detail data used on the property detail page
  extras?: PropertyDetailExtras;
}

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  className?: string;
  onEditClick?: (property: Property) => void;
  layout?: 'grid' | 'list';
  showPreview?: boolean;
  onViewDetails?: (property: Property) => void;
  onBook?: (property: Property) => void;
  showBookButton?: boolean;
}

const amenityIcons: { [key: string]: LucideIcon } = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  pool: Waves,
  bathroom: Bath,
  bed: Bed,
  gym: Waves,
  spa: Waves,
  restaurant: Coffee,
};

const amenityLabels: { [key: string]: string } = {
  wifi: 'Free Wi‑Fi',
  parking: 'Free Parking',
  breakfast: 'Breakfast Included',
  pool: 'Swimming Pool',
  bathroom: 'Private Bathroom',
  bed: 'Comfortable Beds',
  gym: 'Gym / Fitness',
  spa: 'Spa Services',
  restaurant: 'On‑site Restaurant',
};

function PropertyCard({ 
  property, 
  onClick, 
  className, 
  onEditClick, 
  layout = 'grid',
  showPreview = true,
  onViewDetails,
  onBook,
  showBookButton = false
}: PropertyCardProps) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [imageIndex, setImageIndex] = useState(0);
  const autoplayTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const totalImages = property.images?.length || 0;
  const { inWishlist, toggle: toggleWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Preview state
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const [showModalPreview, setShowModalPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNav = totalImages > 1;

  useEffect(() => {
    setIsWishlisted(inWishlist(property.id));
  }, [property.id, inWishlist, setIsWishlisted]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const nextImage = () => {
    if (!showNav) return;
    setImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!showNav) return;
    setImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Preview handling functions
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!showPreview) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });

    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverPreview(true);
    }, 500); // Show preview after 500ms hover
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowHoverPreview(false);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModalPreview(true);
  };

  const convertPropertyToResult = () => ({
    id: property.id,
    title: property.title,
    description: property.description || '',
    images: property.images || [],
    rating: property.rating,
    reviewCount: property.reviews,
    price: property.price,
    currency: property.currency,
    location: property.location,
    amenities: property.amenities || [],
    isVerified: property.isVerified,
    isSuperhost: property.isSuperhost,
    isLiteApiHotel: property.isLiteApiHotel,
    category: property.type,
    distance: property.distance,
    availability: true,
    area: property.area,
    propertyType: property.type,
    reviews: property.reviews_data?.map(review => ({
      id: review.id.toString(),
      author: review.user,
      rating: review.rating,
      comment: review.comment,
      date: review.date
    }))
  });

  const startAutoplay = () => {
    if (!showNav || autoplayTimerRef.current) return;
    autoplayTimerRef.current = window.setInterval(() => {
      setImageIndex((prev) => (prev + 1) % totalImages);
    }, 1600);
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };
  
  const media = (
      <div
        className={cn(
          "relative overflow-hidden group/media rounded-t-lg cursor-pointer",
          layout === 'list' 
            ? 'w-full xs:w-36 sm:w-48 md:w-56 lg:w-64 xl:w-72 flex-shrink-0' 
            : ''
        )}
        onClick={() => onClick(property)}
        onMouseEnter={startAutoplay}
        onMouseLeave={stopAutoplay}
        onFocus={startAutoplay}
        onBlur={stopAutoplay}
        onTouchStart={(e) => { touchStartXRef.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const startX = touchStartXRef.current;
          if (startX == null) return;
          const delta = e.changedTouches[0].clientX - startX;
          if (Math.abs(delta) > 30) {
            if (delta < 0) nextImage(); else prevImage();
          }
          touchStartXRef.current = null;
        }}
        tabIndex={0}
        aria-label={`${property.title} gallery`}
      >
        <div className="relative overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <OptimizedImage
              image={createHotelImageFromUrl(
                property.images[imageIndex] || property.images[0],
                property.id,
                property.title,
                'exterior'
              )}
              alt={property.title}
              className={cn(
                "w-full transition-all duration-700 group-hover/media:scale-110 group-hover/media:brightness-110",
                layout === 'list' 
                  ? 'h-24 xs:h-28 sm:h-36 md:h-40 lg:h-44 xl:h-48' 
                  : 'h-48 sm:h-52 md:h-56 lg:h-60'
              )}
              fit="cover"
              priority={false}
              placeholder="blur"
              onLoad={() => {
                // Image loaded successfully - could add analytics here
              }}
            />
          ) : (
            <div
              className={cn(
                "w-full flex items-center justify-center bg-muted text-muted-foreground",
                layout === 'list' 
                  ? 'h-24 xs:h-28 sm:h-36 md:h-40 lg:h-44 xl:h-48' 
                  : 'h-48 sm:h-52 md:h-56 lg:h-60'
              )}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📷</div>
                <div className="text-xs">No image available</div>
              </div>
            </div>
          )}
          
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />
          
          {/* Photo count indicator */}
          {totalImages > 1 && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{totalImages}</span>
            </div>
          )}
        </div>
        
        {/* Overlay Badges - compact on small screens with tooltips */}
        <div className="absolute top-2 left-2 hidden sm:flex gap-1 flex-wrap">
          {property.isVerified && (
            <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs" title="Verified listing">
              {t("Verified")}
            </Badge>
          )}
          {property.isSuperhost && (
            <Badge className="bg-warning text-warning-foreground text-[10px] sm:text-xs" title="Superhost">
              {t("Superhost")}
            </Badge>
          )}
        </div>

        {/* Mobile badges below image */}
        {(property.isVerified || property.isSuperhost) && (
          <div className="sm:hidden absolute left-2 right-2 -bottom-6 flex gap-2">
            {property.isVerified && (
              <Badge className="bg-success text-success-foreground text-[10px]" title="Verified listing">
                {t("Verified")}
              </Badge>
            )}
            {property.isSuperhost && (
              <Badge className="bg-warning text-warning-foreground text-[10px]" title="Superhost">
                {t("Superhost")}
              </Badge>
            )}
          </div>
        )}

        {/* Type Badge (shifted to leave room for wishlist icon) */}
        <div className="absolute top-2 right-10 flex flex-col gap-1">
          <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] sm:text-xs" title={property.type === 'hotel' ? 'Hotel' : 'Property'}>
            {property.type === 'hotel' ? t('Hotel') : t('Property')}
          </Badge>
          {property.isLiteApiHotel && (
            <Badge className="bg-green-600 text-white text-[9px] sm:text-[10px] px-1" title="Real hotel data from LiteAPI">
              🌐 LIVE
            </Badge>
          )}
        </div>

        {/* Wishlist small toggle (position fixed relative to card, not image zoom) */}
        <button
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          onClick={(e) => {
            e.stopPropagation();
            const next = toggleWishlist(property.id);
            setIsWishlisted(next);
          }}
          className={cn(
            'absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-md will-change-transform z-20',
            isWishlisted 
              ? 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-600' 
              : 'bg-background dark:bg-card text-foreground hover:bg-muted border border-border'
          )}
        >
          <Heart 
            className={cn(
              'h-4 w-4 transition-all duration-300',
              isWishlisted 
                ? 'fill-current scale-110' 
                : 'hover:scale-125 hover:text-rose-500 dark:hover:text-rose-400'
            )} 
          />
        </button>

        {/* Enhanced navigation for grid hover */}
        {showNav && (
          <>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute inset-y-0 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-black/40 to-transparent text-white opacity-0 group-hover/media:opacity-100 transition-all duration-300 z-20 pointer-events-none group-hover/media:pointer-events-auto hover:from-black/60"
            >
              <ChevronLeft className="h-6 w-6 drop-shadow-lg" />
            </button>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute inset-y-0 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-black/40 to-transparent text-white opacity-0 group-hover/media:opacity-100 transition-all duration-300 z-20 pointer-events-none group-hover/media:pointer-events-auto hover:from-black/60"
            >
              <ChevronRight className="h-6 w-6 drop-shadow-lg" />
            </button>
            
            {/* Enhanced dot indicators */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300">
              {property.images.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-200 hover:scale-125",
                    i === imageIndex 
                      ? "bg-white dark:bg-gray-200 shadow-lg scale-110" 
                      : "bg-white/60 dark:bg-gray-300/60 hover:bg-white/80 dark:hover:bg-gray-300/80"
                  )}
                />
              ))}
              {property.images.length > 8 && (
                <span className="text-white dark:text-gray-100 text-xs bg-black/40 dark:bg-gray-800/60 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  +{property.images.length - 8}
                </span>
              )}
            </div>
          </>
        )}

        {/* Quick View Button - Show on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover/media:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/media:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg border-0"
            onClick={(e) => {
              e.stopPropagation();
              // Quick view functionality can be added here
              if (onEditClick) onEditClick(property);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Quick View
          </Button>
        </div>
      </div>
  );

  const content = (
      <CardContent className={cn(
        layout === 'list' 
          ? 'flex-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2' 
          : 'p-3 sm:p-4 space-y-2 sm:space-y-3'
      )}>
        {/* Rating and Location */}
        <div className={cn(
          "flex items-start justify-between gap-2",
          layout === 'list' ? 'flex-col xs:flex-row xs:items-center' : ''
        )}>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground min-w-0">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium flex-shrink-0">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-warning text-warning" />
            {property.rating}
            <span className="text-muted-foreground ml-1">({property.reviews})</span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className={cn(
            "font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer",
            layout === 'list' 
              ? 'text-sm sm:text-base line-clamp-1' 
              : 'text-base sm:text-lg line-clamp-2'
          )}
          onClick={() => onClick(property)}
        >
          {property.title}
        </h3>

        {/* Always show description in grid view (truncated) */}
        {property.description && (
          <p className={cn(
            "text-muted-foreground",
            layout === 'list' 
              ? 'text-xs sm:text-sm line-clamp-1 sm:line-clamp-2'
              : 'text-xs line-clamp-2'
          )}>
            {property.description}
          </p>
        )}

        {/* Distance and Area info - Show in both layouts */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {property.distance && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">
              <MapPin className="h-3 w-3 mr-1" />
              <span className={cn(
                layout === 'list' ? 'hidden xs:inline' : 'inline'
              )}>
                {property.distance} to centre
              </span>
              <span className={cn(
                layout === 'list' ? 'xs:hidden' : 'hidden'
              )}>
                {property.distance}
              </span>
            </span>
          )}
          {property.area && (
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
              {property.area}
            </span>
          )}
          {/* Add guest capacity info */}
          {property.type === 'property' && (
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-xs font-medium">
              <Users className="h-3 w-3 mr-1" />
              Up to 6 guests
            </span>
          )}
        </div>

        {/* Amenities with tooltips */}
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {property.amenities?.slice(0, layout === 'list' ? 6 : 4).map((amenity) => {
              // Ensure amenity is a string before processing
              if (typeof amenity !== 'string') return null;
              const key = amenity.toLowerCase();
              const Icon = amenityIcons[key];
              const label = amenityLabels[key] || amenity.charAt(0).toUpperCase() + amenity.slice(1);
              return Icon ? (
                <Tooltip key={amenity}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-muted-foreground" aria-label={label}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      {layout === 'list' && (
                        <span className="ml-1 text-xs capitalize hidden sm:inline">{amenity}</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="capitalize">{t(label)}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                layout === 'list' && (
                  <span key={amenity} className="text-xs text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded hidden sm:inline-block">
                    {amenity}
                  </span>
                )
              );
            })}
            {(property.amenities?.length || 0) > (layout === 'list' ? 6 : 4) && (
              <span className="text-xs text-muted-foreground">
                +{(property.amenities?.length || 0) - (layout === 'list' ? 6 : 4)} {t("more")}
              </span>
            )}
          </div>
        </TooltipProvider>

        {/* Price & CTA */}
        <div className={cn(
          "flex pt-1 sm:pt-2",
          layout === 'list' 
            ? 'flex-col xs:flex-row xs:items-end xs:justify-between gap-1 xs:gap-2' 
            : 'items-end justify-between'
        )}>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "font-bold text-foreground",
                layout === 'list' ? 'text-lg sm:text-xl' : 'text-xl'
              )}>
                {formatPrice(property.price, property.currency || 'USD')}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">/ night</span>
            </div>
            {layout === 'list' && (
              <div className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">Includes taxes and fees</span>
                <span className="sm:hidden">Inc. taxes</span>
              </div>
            )}
          </div>
          <Button 
            size={layout === 'list' ? 'sm' : 'sm'} 
            className={cn(
              "bg-primary hover:bg-primary/90 flex-shrink-0",
              layout === 'list' ? 'text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2' : ''
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick(property);
            }}
          >
            {layout === 'list' ? (
              <>
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </>
            ) : (
              'Book Now'
            )}
          </Button>
        </div>
      </CardContent>
  );

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          "group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card",
          layout === 'list' 
            ? 'flex flex-col xs:flex-row' 
            : '',
          className
        )}
        onClick={() => onClick(property)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {media}
        {content}
        
        {/* Preview button overlay */}
        {showPreview && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={handlePreviewClick}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick preview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Book button for search results */}
        {showBookButton && onBook && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBook(property);
              }}
            >
              Book Now
            </Button>
          </div>
        )}
      </Card>

      {/* Hover Preview */}
      {showPreview && (
        <SearchResultPreview
          result={convertPropertyToResult()}
          isVisible={showHoverPreview}
          position={previewPosition}
          onClose={() => setShowHoverPreview(false)}
          onBook={onBook ? () => onBook(property) : undefined}
          onViewDetails={onViewDetails ? () => onViewDetails(property) : undefined}
          size="standard"
          showActions={true}
          showGallery={true}
        />
      )}

      {/* Modal Preview */}
      {showPreview && (
        <SearchPreviewModal
          result={convertPropertyToResult()}
          isOpen={showModalPreview}
          onClose={() => setShowModalPreview(false)}
          onBook={onBook ? () => onBook(property) : undefined}
        />
      )}
    </>
  );
}

export default memo(PropertyCard);