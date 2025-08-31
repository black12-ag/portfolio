// Performance Monitoring and Optimization Service
// Tracks Core Web Vitals, user interactions, and system performance

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  url: string;
  userAgent: string;
  connectionType?: string;
  metadata?: Record<string, unknown>;
}

interface WebVital {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface UserTiming {
  name: string;
  duration: number;
  startTime: number;
  detail?: any;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private vitalsCallback?: (vital: WebVital) => void;
  private metricsBuffer: PerformanceMetric[] = [];
  private isEnabled = true;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    // Initialize performance monitoring
    this.setupWebVitalsMonitoring();
    this.setupResourceMonitoring();
    this.setupUserTimingMonitoring();
    this.setupLongTaskMonitoring();
    this.setupNavigationMonitoring();

    // Setup automatic reporting
    this.setupAutoReporting();

    // Load saved metrics
    this.loadSavedMetrics();
  }

  private setupWebVitalsMonitoring(): void {
    // Core Web Vitals monitoring
    this.observeWebVital('first-contentful-paint', this.onFCP.bind(this));
    this.observeWebVital('largest-contentful-paint', this.onLCP.bind(this));
    this.observeWebVital('first-input-delay', this.onFID.bind(this));
    this.observeWebVital('cumulative-layout-shift', this.onCLS.bind(this));
    this.observeWebVital('interaction-to-next-paint', this.onINP.bind(this));

    // Time to First Byte
    this.measureTTFB();
  }

  private observeWebVital(entryType: string, callback: (entry: PerformanceEntry) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        // Check if the entry type is supported before observing
        const supportedTypes = PerformanceObserver.supportedEntryTypes || [];
        if (supportedTypes.includes(entryType)) {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(callback);
          });
          observer.observe({ entryTypes: [entryType] });
          this.observers.set(entryType, observer);
        }
        // Silently skip unsupported entry types - no console logging
      } catch (error) {
        // Silently handle errors - only log in development if really needed
        if (import.meta.env.MODE === 'development' && console.debug) {
          console.debug(`Performance monitoring: skipped ${entryType}`);
        }
      }
    }
  }

  private onFCP(entry: PerformanceEntry): void {
    this.recordMetric('FCP', entry.startTime, {
      entryType: entry.entryType,
      name: entry.name
    });
  }

  private onLCP(entry: any): void {
    this.recordMetric('LCP', entry.startTime, {
      entryType: entry.entryType,
      element: entry.element?.tagName,
      url: entry.url,
      size: entry.size
    });
  }

  private onFID(entry: any): void {
    this.recordMetric('FID', entry.processingStart - entry.startTime, {
      entryType: entry.entryType,
      name: entry.name,
      target: entry.target?.tagName
    });
  }

  private onCLS(entry: any): void {
    this.recordMetric('CLS', entry.value, {
      entryType: entry.entryType,
      hadRecentInput: entry.hadRecentInput,
      sources: entry.sources?.map((s: any) => ({
        element: s.node?.tagName,
        previousRect: s.previousRect,
        currentRect: s.currentRect
      }))
    });
  }

  private onINP(entry: any): void {
    this.recordMetric('INP', entry.duration, {
      entryType: entry.entryType,
      name: entry.name,
      target: entry.target?.tagName,
      interactionId: entry.interactionId
    });
  }

  private measureTTFB(): void {
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const ttfb = navTiming.responseStart - navTiming.requestStart;
        this.recordMetric('TTFB', ttfb, {
          domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
          domComplete: navTiming.domComplete - navTiming.navigationStart,
          loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart
        });
      }
    }
  }

  private setupResourceMonitoring(): void {
    this.observeWebVital('resource', (entry: any) => {
      // Monitor slow resources
      if (entry.duration > 1000) {
        this.recordMetric('SlowResource', entry.duration, {
          name: entry.name,
          initiatorType: entry.initiatorType,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize
        });
      }

      // Monitor large resources
      if (entry.transferSize > 500000) { // > 500KB
        this.recordMetric('LargeResource', entry.transferSize, {
          name: entry.name,
          initiatorType: entry.initiatorType,
          duration: entry.duration
        });
      }
    });
  }

  private setupUserTimingMonitoring(): void {
    this.observeWebVital('measure', (entry: any) => {
      this.recordMetric('UserTiming', entry.duration, {
        name: entry.name,
        detail: entry.detail
      });
    });
  }

  private setupLongTaskMonitoring(): void {
    this.observeWebVital('longtask', (entry: any) => {
      this.recordMetric('LongTask', entry.duration, {
        startTime: entry.startTime,
        attribution: entry.attribution?.map((attr: any) => ({
          name: attr.name,
          containerType: attr.containerType,
          containerSrc: attr.containerSrc,
          containerId: attr.containerId,
          containerName: attr.containerName
        }))
      });
    });
  }

  private setupNavigationMonitoring(): void {
    this.observeWebVital('navigation', (entry: any) => {
      this.recordMetric('NavigationTiming', entry.duration, {
        type: entry.type,
        redirectCount: entry.redirectCount,
        transferSize: entry.transferSize,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart
      });
    });
  }

  private setupAutoReporting(): void {
    // Send metrics every 30 seconds
    setInterval(() => {
      this.flushMetrics();
    }, 30000);

    // Send metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics(true);
    });

    // Send metrics on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushMetrics(true);
      }
    });
  }

  private recordMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      metadata
    };

    // Add to buffer
    this.metricsBuffer.push(metric);

    // Store in memory
    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    this.metrics.set(name, existing.slice(-100)); // Keep last 100 entries

    // Save to localStorage (for offline support)
    this.saveMetricsToStorage();

    // Call vitals callback if set
    if (this.vitalsCallback && ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP'].includes(name)) {
      this.vitalsCallback({
        name: name as WebVital['name'],
        value,
        delta: value,
        id: Date.now().toString(),
        entries: []
      });
    }
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const conn = (navigator as unknown).connection;
      return conn.effectiveType || conn.type || 'unknown';
    }
    return 'unknown';
  }

  private flushMetrics(force = false): void {
    if (this.metricsBuffer.length === 0) return;
    if (!force && this.metricsBuffer.length < 10) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Send to analytics service
    this.sendMetricsToAnalytics(metricsToSend);
  }

  private sendMetricsToAnalytics(metrics: PerformanceMetric[]): void {
    // Just save locally - no network calls to avoid connection errors
    try {
      // Only log in development for debugging
      if (import.meta.env.MODE === 'development') {
        console.debug('📊 Performance Metrics collected:', metrics.length);
      }
      // Save to localStorage for later analysis
      this.saveFailedMetrics(metrics);
    } catch (error) {
      // Silently handle any errors
      if (import.meta.env.MODE === 'development') {
        console.warn('Performance metrics storage failed:', error);
      }
    }
  }


  private saveFailedMetrics(metrics: PerformanceMetric[]): void {
    const failed = JSON.parse(localStorage.getItem('failed_metrics') || '[]');
    failed.push(...metrics);
    localStorage.setItem('failed_metrics', JSON.stringify(failed.slice(-500))); // Keep last 500
  }

  private saveMetricsToStorage(): void {
    try {
      const allMetrics: Record<string, PerformanceMetric[]> = {} as Record<string, never>;
      for (const [key, value] of this.metrics.entries()) {
        allMetrics[key] = value.slice(-10); // Keep last 10 of each type
      }
      localStorage.setItem('performance_metrics', JSON.stringify(allMetrics));
    } catch (error) {
      // Storage full or unavailable
      console.warn('Failed to save metrics to storage:', error);
    }
  }

  private loadSavedMetrics(): void {
    try {
      const saved = localStorage.getItem('performance_metrics');
      if (saved) {
        const parsed = JSON.parse(saved);
        for (const [key, value] of Object.entries(parsed)) {
          this.metrics.set(key, value as PerformanceMetric[]);
        }
      }

      // Retry failed metrics
      const failed = localStorage.getItem('failed_metrics');
      if (failed) {
        const failedMetrics = JSON.parse(failed);
        if (failedMetrics.length > 0) {
          this.sendMetricsToAnalytics(failedMetrics);
          localStorage.removeItem('failed_metrics');
        }
      }
    } catch (error) {
      console.warn('Failed to load saved metrics:', error);
    }
  }

  // Public API
  startMeasure(name: string, detail?: any): void {
    performance.mark(`${name}-start`);
    if (detail) {
      performance.mark(`${name}-start`, { detail });
    }
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name, 'measure');
    return entries.length > 0 ? entries[entries.length - 1].duration : 0;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => {
      this.endMeasure(name);
    });
  }

  measureSync<T>(name: string, fn: () => T): T {
    this.startMeasure(name);
    try {
      return fn();
    } finally {
      this.endMeasure(name);
    }
  }

  onWebVital(callback: (vital: WebVital) => void): void {
    this.vitalsCallback = callback;
  }

  public recordCustomMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.recordMetric(name, value, metadata);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }

  getWebVitalsScore(): { score: number; metrics: Record<string, { value: number; score: number }> } {
    const latestMetrics = this.getLatestMetrics(['FCP', 'LCP', 'FID', 'CLS', 'TTFB']);
    const scores: Record<string, { value: number; score: number }> = {} as Record<string, never>;
    
    // Scoring thresholds (Google's recommended values)
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    };

    let totalScore = 0;
    let metricCount = 0;

    for (const [name, metric] of Object.entries(latestMetrics)) {
      if (metric && thresholds[name as keyof typeof thresholds]) {
        const threshold = thresholds[name as keyof typeof thresholds];
        let score = 100;
        
        if (metric.value > threshold.poor) {
          score = 0;
        } else if (metric.value > threshold.good) {
          score = Math.round(50 * (1 - (metric.value - threshold.good) / (threshold.poor - threshold.good)));
        }
        
        scores[name] = { value: metric.value, score };
        totalScore += score;
        metricCount++;
      }
    }

    return {
      score: metricCount > 0 ? Math.round(totalScore / metricCount) : 0,
      metrics: scores
    };
  }

  private getLatestMetrics(names: string[]): Record<string, PerformanceMetric | null> {
    const result: Record<string, PerformanceMetric | null> = {} as Record<string, never>;
    
    for (const name of names) {
      const metrics = this.metrics.get(name);
      result[name] = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
    }
    
    return result;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  clear(): void {
    this.metrics.clear();
    this.metricsBuffer = [];
    localStorage.removeItem('performance_metrics');
    localStorage.removeItem('failed_metrics');
  }

  destroy(): void {
    this.disable();
    this.clear();
    
    // Disconnect observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }

  // Memory monitoring
  getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if ('memory' in performance) {
      const memory = (performance as unknown).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      };
    }
    return null;
  }

  // Network monitoring
  getConnectionInfo(): { effectiveType: string; downlink: number; rtt: number } | null {
    if ('connection' in navigator) {
      const conn = (navigator as unknown).connection;
      return {
        effectiveType: conn.effectiveType || 'unknown',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0
      };
    }
    return null;
  }

  // Battery monitoring
  getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    if ('getBattery' in navigator) {
      return (navigator as unknown).getBattery().then((battery: any) => ({
        level: Math.round(battery.level * 100),
        charging: battery.charging
      }));
    }
    return Promise.resolve(null);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export function measurePageLoad(): void {
  performanceMonitor.startMeasure('page-load');
  
  window.addEventListener('load', () => {
    performanceMonitor.endMeasure('page-load');
  });
}

export function measureRouteChange(route: string): void {
  performanceMonitor.startMeasure(`route-${route}`);
}

export function endRouteChange(route: string): void {
  performanceMonitor.endMeasure(`route-${route}`);
}

export function measureApiCall<T>(url: string, promise: Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(`api-${url}`, () => promise);
}

export function measureRender(componentName: string, renderFn: () => void): void {
  performanceMonitor.measureSync(`render-${componentName}`, renderFn);
}

// Import React hooks
import { useMemo } from 'react';

// React hooks
export function usePerformanceMonitor() {
  return useMemo(() => ({
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getWebVitalsScore: performanceMonitor.getWebVitalsScore.bind(performanceMonitor),
    getMemoryUsage: performanceMonitor.getMemoryUsage.bind(performanceMonitor),
    getConnectionInfo: performanceMonitor.getConnectionInfo.bind(performanceMonitor),
    getBatteryInfo: performanceMonitor.getBatteryInfo.bind(performanceMonitor)
  }), []);
}
