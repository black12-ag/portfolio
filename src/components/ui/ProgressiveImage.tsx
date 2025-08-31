import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export default function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className,
  onLoad,
  onError,
  priority = false,
  sizes,
  quality = 80
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized image URLs based on quality and size
  const getOptimizedSrc = (originalSrc: string, targetQuality: number = quality) => {
    // No fallback to external image services - use original source only
    if (originalSrc.includes('imgur.com')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, `_${targetQuality}q.$1`);
    }
    return originalSrc;
  };

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    // Set loading priority
    if (priority) {
      img.loading = 'eager';
    }

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    // Start loading the optimized image
    img.src = getOptimizedSrc(src);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError, priority, quality]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          // Start loading when image comes into view
          const img = new Image();
          img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
            setHasError(false);
            onLoad?.();
          };
          img.onerror = () => {
            setHasError(true);
            onError?.();
          };
          img.src = getOptimizedSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image is visible
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onLoad, onError, priority, quality]);

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Blur background */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !placeholderSrc && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        sizes={sizes}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
