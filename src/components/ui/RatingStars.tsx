import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0-5
  max?: number; // default 5
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  totalReviews?: number;
  className?: string;
}

export default function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showValue = true,
  totalReviews,
  className,
}: RatingStarsProps) {
  const rounded = Math.max(0, Math.min(max, rating));
  const full = Math.floor(rounded);
  const hasHalf = rounded - full >= 0.5;

  const sizeClasses = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={['flex items-center gap-1', className].filter(Boolean).join(' ')} aria-label={`Rating ${rating} out of ${max}`}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, idx) => {
          const filled = idx < full;
          const isHalf = !filled && hasHalf && idx === full;
          return (
            <span key={idx} className="relative inline-block">
              <Star className={[sizeClasses, filled ? 'fill-warning text-warning' : 'text-muted-foreground'].join(' ')} />
              {isHalf && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }} aria-hidden>
                  <Star className={[sizeClasses, 'fill-warning text-warning'].join(' ')} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-foreground font-medium ml-1">
          {rating.toFixed(1)}{typeof totalReviews === 'number' && <span className="text-muted-foreground"> ({totalReviews})</span>}
        </span>
      )}
    </div>
  );
}


