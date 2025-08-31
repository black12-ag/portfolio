import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  blur?: boolean;
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderClassName,
  fallbackSrc = '/api/placeholder/400/300',
  onLoad,
  onError,
  lazy = true,
  quality = 75,
  sizes,
  priority = false,
  blur = true,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView, src]);

  // Set src when in view
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [isInView, src, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleError = (error: Event) => {
    setIsError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsError(false); // Reset error state to try fallback
    } else {
      onError?.(error);
    }
  };

  // Generate optimized URL (you can replace this with your image optimization service)
  const getOptimizedUrl = (originalSrc: string): string => {
    // If using a service like Cloudinary, ImageKit, or custom optimization service
    // return `https://your-service.com/image?url=${encodeURIComponent(originalSrc)}&w=${width}&h=${height}&q=${quality}`;
    
    // For now, return original URL
    // In production, you might use next/image optimization or similar
    return originalSrc;
  };

  // Create srcSet for responsive images
  const generateSrcSet = (baseSrc: string): string => {
    if (!width) return '';
    
    const sizes = [0.5, 1, 1.5, 2]; // Different density variants
    return sizes
      .map(multiplier => {
        const scaledWidth = Math.round(width * multiplier);
        const optimizedUrl = getOptimizedUrl(baseSrc);
        return `${optimizedUrl} ${scaledWidth}w`;
      })
      .join(', ');
  };

  const shouldShowPlaceholder = !isLoaded && !isError;
  const shouldBlur = blur && shouldShowPlaceholder;

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gray-100",
        className
      )}
      style={{ 
        aspectRatio: width && height ? `${width}/${height}` : undefined 
      }}
    >
      {/* Placeholder */}
      {shouldShowPlaceholder && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse",
          placeholderClassName
        )}>
          <div className="w-8 h-8 text-gray-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="w-full h-full"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
            </svg>
          </div>
        </div>
      )}

      {/* Low-quality placeholder for blur effect */}
      {shouldBlur && currentSrc && (
        <img
          src={getOptimizedUrl(currentSrc)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          style={{ filter: 'blur(10px)' }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={getOptimizedUrl(currentSrc)}
          srcSet={generateSrcSet(currentSrc)}
          sizes={sizes}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            props.className
          )}
          width={width}
          height={height}
          loading={lazy && !priority ? "lazy" : "eager"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error state */}
      {isError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <div className="w-8 h-8 mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="w-full h-full"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" />
              <path d="M23 19l-7-7-7 7" />
            </svg>
          </div>
          <span className="text-xs text-center">Image not available</span>
        </div>
      )}

      {/* Loading indicator */}
      {shouldShowPlaceholder && isInView && currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

// Hook for preloading images
export const useImagePreloader = (sources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          resolve();
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(src));
          resolve();
        };
        img.src = src;
      });
    };

    // Preload all images
    Promise.all(sources.map(preloadImage));
  }, [sources]);

  return { loadedImages, failedImages };
};

// Component for image galleries with optimized loading
export const ImageGallery = memo(function ImageGallery({
  images,
  className,
  onImageClick,
}: {
  images: string[];
  className?: string;
  onImageClick?: (image: string, index: number) => void;
}) {
  const { loadedImages } = useImagePreloader(images.slice(0, 3)); // Preload first 3 images

  return (
    <div className={cn("grid gap-2", className)}>
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image}-${index}`}
          src={image}
          alt={`Gallery image ${index + 1}`}
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick?.(image, index)}
          lazy={index > 2} // Lazy load images after the first 3
          priority={index === 0} // Priority load for the first image
          width={400}
          height={300}
        />
      ))}
    </div>
  );
});

export default OptimizedImage;
