// CDN and Image Optimization Service
// Handles image optimization, CDN delivery, and performance monitoring

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
}

export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheTTL: number;
  compressionEnabled: boolean;
  http2Enabled: boolean;
  ssl: boolean;
}

export interface PerformanceMetrics {
  loadTime: number;
  imageSize: number;
  compressionRatio: number;
  cacheHitRate: number;
  bandwidth: number;
  region: string;
}

class CDNOptimizationService {
  private readonly CDN_BASE_URL = 'https://cdn.metah.travel';
  private readonly IMAGE_CDN_URL = 'https://images.metah.travel';
  private readonly SUPPORTED_FORMATS = ['webp', 'avif', 'jpg', 'png', 'gif'];
  
  private readonly DEFAULT_OPTIONS: ImageOptimizationOptions = {
    quality: 85,
    format: 'auto',
    progressive: true,
    fit: 'cover'
  };

  // Generate optimized image URL
  generateImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const params = new URLSearchParams();

    // Add optimization parameters
    if (opts.width) params.append('w', opts.width.toString());
    if (opts.height) params.append('h', opts.height.toString());
    if (opts.quality) params.append('q', opts.quality.toString());
    if (opts.format && opts.format !== 'auto') params.append('f', opts.format);
    if (opts.fit) params.append('fit', opts.fit);
    if (opts.progressive !== undefined) params.append('prog', opts.progressive.toString());
    if (opts.blur) params.append('blur', opts.blur.toString());
    if (opts.sharpen) params.append('sharp', '1');
    if (opts.grayscale) params.append('gray', '1');

    // Auto-detect best format
    if (opts.format === 'auto') {
      const bestFormat = this.detectBestFormat();
      if (bestFormat !== 'jpg') {
        params.append('f', bestFormat);
      }
    }

    const optimizedUrl = `${this.IMAGE_CDN_URL}/${encodeURIComponent(originalUrl)}`;
    return params.toString() ? `${optimizedUrl}?${params.toString()}` : optimizedUrl;
  }

  // Generate responsive image srcset
  generateResponsiveImageSet(
    originalUrl: string,
    breakpoints: number[] = [320, 480, 768, 1024, 1200, 1920],
    options: ImageOptimizationOptions = {}
  ): string {
    return breakpoints
      .map(width => {
        const url = this.generateImageUrl(originalUrl, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  // Generate picture element with multiple formats
  generatePictureElement(
    originalUrl: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const breakpoints = [320, 480, 768, 1024, 1200, 1920];
    
    // Generate WebP sources
    const webpSrcset = this.generateResponsiveImageSet(originalUrl, breakpoints, {
      ...options,
      format: 'webp'
    });
    
    // Generate AVIF sources (next-gen format)
    const avifSrcset = this.generateResponsiveImageSet(originalUrl, breakpoints, {
      ...options,
      format: 'avif'
    });
    
    // Fallback JPEG
    const jpegSrcset = this.generateResponsiveImageSet(originalUrl, breakpoints, {
      ...options,
      format: 'jpg'
    });
    
    const fallbackSrc = this.generateImageUrl(originalUrl, { ...options, width: 800 });

    return `
      <picture>
        <source srcset="${avifSrcset}" type="image/avif">
        <source srcset="${webpSrcset}" type="image/webp">
        <source srcset="${jpegSrcset}" type="image/jpeg">
        <img src="${fallbackSrc}" alt="${alt}" loading="lazy" decoding="async">
      </picture>
    `;
  }

  // Optimize image for different use cases
  optimizeForUseCase(originalUrl: string, useCase: string): string {
    const optimizations: Record<string, ImageOptimizationOptions> = {
      'hero': { width: 1920, height: 800, quality: 90, format: 'webp' },
      'thumbnail': { width: 300, height: 200, quality: 80, format: 'webp' },
      'gallery': { width: 800, height: 600, quality: 85, format: 'webp' },
      'profile': { width: 150, height: 150, quality: 85, format: 'webp', fit: 'cover' },
      'card': { width: 400, height: 250, quality: 80, format: 'webp' },
      'fullscreen': { width: 2048, quality: 95, format: 'auto' },
      'email': { width: 600, quality: 75, format: 'jpg' }, // Better email support
      'social': { width: 1200, height: 630, quality: 85, format: 'jpg' }, // Social media
      'print': { width: 2400, quality: 100, format: 'jpg' } // High quality for print
    };

    const options = optimizations[useCase] || optimizations['gallery'];
    return this.generateImageUrl(originalUrl, options);
  }

  // Preload critical images
  preloadCriticalImages(images: Array<{ url: string; options?: ImageOptimizationOptions }>): void {
    images.forEach(({ url, options }) => {
      const optimizedUrl = this.generateImageUrl(url, options);
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      
      // Add responsive preloading for critical images
      if (options?.width && options.width > 768) {
        link.media = '(min-width: 768px)';
      }
      
      document.head.appendChild(link);
    });
  }

  // Lazy load images with intersection observer
  setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.fallbackLazyLoading();
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the actual image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Load srcset if available
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Add loaded class for styling
          img.classList.add('loaded');
          
          // Stop observing this image
          observer.unobserve(img);
          
          // Track performance
          this.trackImageLoad(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before image comes into view
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Progressive JPEG loading
  setupProgressiveLoading(): void {
    const images = document.querySelectorAll('img[data-progressive]');
    
    images.forEach(img => {
      const lowQualityUrl = this.generateImageUrl(img.getAttribute('src') || '', {
        quality: 10,
        blur: 2
      });
      
      const highQualityUrl = this.generateImageUrl(img.getAttribute('src') || '', {
        quality: 85
      });
      
      // Load low quality first
      const lowQualityImg = new Image();
      lowQualityImg.onload = () => {
        (img as HTMLImageElement).src = lowQualityUrl;
        (img as HTMLImageElement).classList.add('low-quality');
        
        // Then load high quality
        const highQualityImg = new Image();
        highQualityImg.onload = () => {
          (img as HTMLImageElement).src = highQualityUrl;
          (img as HTMLImageElement).classList.remove('low-quality');
          (img as HTMLImageElement).classList.add('high-quality');
        };
        highQualityImg.src = highQualityUrl;
      };
      lowQualityImg.src = lowQualityUrl;
    });
  }

  // Fallback lazy loading for older browsers
  private fallbackLazyLoading(): void {
    let lazyImages = document.querySelectorAll('img[data-src]');
    
    const loadImage = (img: HTMLImageElement) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
      img.classList.add('loaded');
    };

    const isInViewport = (img: HTMLImageElement) => {
      const rect = img.getBoundingClientRect();
      return rect.top <= window.innerHeight + 50 && rect.bottom >= -50;
    };

    const lazyLoad = () => {
      lazyImages.forEach(img => {
        if (isInViewport(img as HTMLImageElement)) {
          loadImage(img as HTMLImageElement);
        }
      });
      
      // Remove loaded images from the list
      lazyImages = document.querySelectorAll('img[data-src]');
    };

    // Initial check
    lazyLoad();
    
    // Check on scroll and resize
    window.addEventListener('scroll', lazyLoad, { passive: true });
    window.addEventListener('resize', lazyLoad, { passive: true });
  }

  // Detect best image format support
  private detectBestFormat(): string {
    // Check for AVIF support
    if (this.supportsImageFormat('avif')) {
      return 'avif';
    }
    
    // Check for WebP support
    if (this.supportsImageFormat('webp')) {
      return 'webp';
    }
    
    // Fallback to JPEG
    return 'jpg';
  }

  // Check if browser supports image format
  private supportsImageFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    
    try {
      const dataUrl = canvas.toDataURL(`image/${format}`);
      return dataUrl.startsWith(`data:image/${format}`);
    } catch {
      return false;
    }
  }

  // Track image loading performance
  private trackImageLoad(img: HTMLImageElement): void {
    const startTime = performance.now();
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      
      // Send analytics data
      this.sendPerformanceMetrics({
        type: 'image_load',
        url: img.src,
        loadTime,
        size: this.estimateImageSize(img),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connection: this.getConnectionInfo()
      });
    });
  }

  // Estimate image file size
  private estimateImageSize(img: HTMLImageElement): number {
    // This is an estimation - in production, you'd get actual size from response headers
    const area = img.naturalWidth * img.naturalHeight;
    const compressionRatio = 0.1; // Estimated compression ratio
    return Math.round(area * compressionRatio);
  }

  // Get connection information
  private getConnectionInfo(): any {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      };
    }
    return null;
  }

  // Send performance metrics
  private sendPerformanceMetrics(data: unknown): void {
    // In production, send to analytics service
    if (import.meta.env.MODE === 'development') {
      console.log('Image Performance Metrics:', data);
    }
    
    // Store locally for now
    const metrics = JSON.parse(localStorage.getItem('image_performance_metrics') || '[]');
    metrics.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 entries
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('image_performance_metrics', JSON.stringify(metrics));
  }

  // CDN cache management
  purgeCache(urls: string[]): Promise<boolean> {
    // Mock implementation - in production, this would call CDN API
    return new Promise((resolve) => {
      console.log('Purging CDN cache for:', urls);
      setTimeout(() => resolve(true), 1000);
    });
  }

  // Get performance analytics
  getPerformanceAnalytics(): {
    averageLoadTime: number;
    averageImageSize: number;
    cacheHitRate: number;
    topPerformingImages: string[];
    slowestImages: string[];
  } {
    const metrics = JSON.parse(localStorage.getItem('image_performance_metrics') || '[]');
    
    if (metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageImageSize: 0,
        cacheHitRate: 0,
        topPerformingImages: [],
        slowestImages: []
      };
    }

    const avgLoadTime = metrics.reduce((sum: number, m: unknown) => sum + m.loadTime, 0) / metrics.length;
    const avgSize = metrics.reduce((sum: number, m: unknown) => sum + (m.size || 0), 0) / metrics.length;
    
    const sortedBySpeed = [...metrics].sort((a: unknown, b: unknown) => a.loadTime - b.loadTime);
    
    return {
      averageLoadTime: Math.round(avgLoadTime),
      averageImageSize: Math.round(avgSize),
      cacheHitRate: Math.random() * 0.2 + 0.8, // Mock cache hit rate
      topPerformingImages: sortedBySpeed.slice(0, 5).map((m: unknown) => m.url),
      slowestImages: sortedBySpeed.slice(-5).map((m: unknown) => m.url)
    };
  }

  // Image format conversion utility
  convertImageFormat(file: File, targetFormat: string, quality = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${targetFormat}`,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate CSS for responsive images
  generateResponsiveCSS(): string {
    return `
      /* Responsive image base styles */
      .responsive-image {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      /* Lazy loading placeholder */
      .responsive-image[data-src] {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Progressive loading styles */
      .responsive-image.low-quality {
        filter: blur(2px);
        transition: filter 0.3s ease;
      }
      
      .responsive-image.high-quality {
        filter: none;
      }
      
      /* Picture element styling */
      picture {
        display: block;
      }
      
      picture img {
        width: 100%;
        height: auto;
      }
      
      /* Aspect ratio containers */
      .aspect-ratio-16-9 {
        aspect-ratio: 16 / 9;
        overflow: hidden;
      }
      
      .aspect-ratio-4-3 {
        aspect-ratio: 4 / 3;
        overflow: hidden;
      }
      
      .aspect-ratio-1-1 {
        aspect-ratio: 1 / 1;
        overflow: hidden;
      }
      
      .aspect-ratio-16-9 img,
      .aspect-ratio-4-3 img,
      .aspect-ratio-1-1 img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;
  }

  // Initialize CDN optimization
  initialize(): void {
    // Add responsive image CSS
    const style = document.createElement('style');
    style.textContent = this.generateResponsiveCSS();
    document.head.appendChild(style);
    
    // Setup lazy loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupLazyLoading();
        this.setupProgressiveLoading();
      });
    } else {
      this.setupLazyLoading();
      this.setupProgressiveLoading();
    }
    
    // Monitor connection changes
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', () => {
        console.log('Connection changed:', this.getConnectionInfo());
      });
    }
  }
}

// Export singleton instance
export const cdnOptimization = new CDNOptimizationService();

// Helper functions
export function optimizeImage(url: string, options?: ImageOptimizationOptions): string {
  return cdnOptimization.generateImageUrl(url, options);
}

export function generateResponsiveImage(url: string, alt: string, options?: ImageOptimizationOptions): string {
  return cdnOptimization.generatePictureElement(url, alt, options);
}

export function preloadImages(images: Array<{ url: string; options?: ImageOptimizationOptions }>): void {
  cdnOptimization.preloadCriticalImages(images);
}

export function initializeCDN(): void {
  cdnOptimization.initialize();
}

// React hook for optimized images
export function useOptimizedImage(url: string, options?: ImageOptimizationOptions) {
  const optimizedUrl = cdnOptimization.generateImageUrl(url, options);
  const responsiveSrcSet = cdnOptimization.generateResponsiveImageSet(url, undefined, options);
  
  return {
    src: optimizedUrl,
    srcSet: responsiveSrcSet,
    loading: 'lazy' as const,
    decoding: 'async' as const
  };
}
