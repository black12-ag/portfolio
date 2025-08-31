import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HotelImage } from '@/types/image.types';
import { imageStorageService } from '@/services/imageStorageService';
import { imageFormatSelector } from '@/utils/imageFormatSelector';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  image: HotelImage;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  placeholder?: 'blur' | 'color' | 'skeleton' | 'none';
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (error: string) => void;
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  image,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  quality = 85,
  fit = 'cover',
  position = 'center',
  placeholder = 'blur',
  onLoad,
  onError,
  onClick,
  style,
  width,
  height,
  aspectRatio
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const calculatedWidth = width || image.width;
  const calculatedHeight = height || image.height || (calculatedWidth && aspectRatio ? calculatedWidth / aspectRatio : undefined);
  const calculatedAspectRatio = aspectRatio || image.aspectRatio || (calculatedWidth && calculatedHeight ? calculatedWidth / calculatedHeight : 16 / 9);

  const responsiveSources = imageStorageService.getResponsiveImageSources(image);
  const formatSelection = imageFormatSelector.selectOptimalFormat(navigator.userAgent, 'photo', false);

  useEffect(() => {
    if (placeholder === 'blur' && !blurDataUrl) {
      // Simple neutral blur placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 20; canvas.height = 20;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#f3f4f6'; ctx.fillRect(0, 0, 20, 20); }
      setBlurDataUrl(canvas.toDataURL());
    }
  }, [image.url, placeholder]);

  useEffect(() => {
    if (!priority && imgRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.disconnect();
          }
        });
      }, { rootMargin: '50px', threshold: 0.1 });
      observerRef.current.observe(imgRef.current);
    } else if (priority) {
      loadImage();
    }
    return () => observerRef.current?.disconnect();
  }, [priority, image.url]);

  const loadImage = useCallback(() => {
    const optimizedUrl = imageStorageService.getOptimizedImageUrl(image, {
      width: calculatedWidth,
      height: calculatedHeight,
      quality,
      format: formatSelection.primary as any,
      fit
    });
    setCurrentSrc(optimizedUrl);
  }, [image, calculatedWidth, calculatedHeight, quality, formatSelection.primary, fit]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    if (formatSelection.fallback !== formatSelection.primary) {
      const fallbackUrl = imageStorageService.getOptimizedImageUrl(image, {
        width: calculatedWidth,
        height: calculatedHeight,
        quality,
        format: formatSelection.fallback as any,
        fit
      });
      setCurrentSrc(fallbackUrl);
    } else {
      onError?.('Failed to load image');
    }
  }, [image, calculatedWidth, calculatedHeight, quality, formatSelection, fit, onError]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: calculatedAspectRatio.toString(),
    width: calculatedWidth ? `${calculatedWidth}px` : '100%',
    height: calculatedHeight ? `${calculatedHeight}px` : 'auto',
    ...style
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: position,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  };

  return (
    <div className={`optimized-image-container ${className}`} style={containerStyle}>
      {!isLoaded && !isError && placeholder !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined, backgroundSize: 'cover', filter: 'blur(10px)', transform: 'scale(1.1)' }} />
      )}
      {isError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#6b7280' }}>
          Image unavailable
        </div>
      )}
      <picture>
        {responsiveSources.map((source, idx) => (
          <source key={idx} srcSet={source.srcSet} type={source.type as any} sizes={sizes} />
        ))}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt || image.alt}
          style={imageStyle}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={onClick}
          width={calculatedWidth}
          height={calculatedHeight}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;

// Backward-compatible no-op to satisfy existing imports
export function InjectImageCSS() {
  return null;
}
