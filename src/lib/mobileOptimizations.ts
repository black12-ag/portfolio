/**
 * Mobile Performance Optimization Utilities
 * Provides performance enhancements for mobile WebView environments
 */

import { Capacitor } from '@capacitor/core';

// Debounce function to prevent excessive calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit execution frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images for better performance
export function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Optimize animations for mobile
export function optimizeAnimations() {
  if (Capacitor.isNativePlatform()) {
    // Reduce animation duration on mobile
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
      }
      
      /* Optimize transitions */
      *, *:before, *:after {
        -webkit-transition-duration: 0.2s !important;
        transition-duration: 0.2s !important;
      }
      
      /* Disable complex animations on low-end devices */
      @media (prefers-reduced-motion: reduce) {
        *, *:before, *:after {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Memory management for mobile
export function cleanupMemory() {
  if (Capacitor.isNativePlatform()) {
    // Clear unused DOM references
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
    
    // Clear image cache periodically
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!isElementInViewport(img)) {
        img.src = '';
      }
    });
  }
}

// Check if element is in viewport
function isElementInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Optimize scroll performance
export function optimizeScroll() {
  let ticking = false;
  
  function updateScrollPosition() {
    ticking = false;
    // Perform scroll updates here
  }
  
  document.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  }, { passive: true });
}

// Initialize all optimizations
export function initializeMobileOptimizations() {
  if (Capacitor.isNativePlatform()) {
    console.log('Initializing mobile optimizations...');
    
    // Apply optimizations after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        optimizeAnimations();
        lazyLoadImages();
        optimizeScroll();
      });
    } else {
      optimizeAnimations();
      lazyLoadImages();
      optimizeScroll();
    }
    
    // Periodic memory cleanup
    setInterval(cleanupMemory, 30000); // Every 30 seconds
    
    console.log('Mobile optimizations initialized');
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/assets/logo.png',
    '/fonts/main.woff2',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (resource.endsWith('.png') || resource.endsWith('.jpg')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Request idle callback polyfill
export const requestIdleCallback = 
  (window as any).requestIdleCallback ||
  function(callback: () => void) {
    const start = Date.now();
    return setTimeout(() => {
      callback();
    }, 1);
  };

// Cancel idle callback polyfill
export const cancelIdleCallback = 
  (window as any).cancelIdleCallback ||
  function(id: number) {
    clearTimeout(id);
  };

// Defer non-critical tasks
export function deferTask(task: () => void) {
  requestIdleCallback(task);
}

// Batch DOM updates
export class DOMBatcher {
  private updates: (() => void)[] = [];
  private scheduled = false;

  add(update: () => void) {
    this.updates.push(update);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    const updates = this.updates.splice(0);
    updates.forEach(update => update());
    this.scheduled = false;
  }
}

export const domBatcher = new DOMBatcher();
