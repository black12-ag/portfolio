import React, { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMount: number;
  userInteraction: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  const trackRender = useCallback((renderStart: number) => {
    const renderTime = performance.now() - renderStart;
    if (import.meta.env.MODE === 'development') {
      console.log(`🎭 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      if (renderTime > 16) {
        console.warn(`⚠️ ${componentName} slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
    return renderTime;
  }, [componentName]);

  const trackInteraction = useCallback((interactionName: string) => {
    const interactionStart = performance.now();
    return () => {
      const responseTime = performance.now() - interactionStart;
      if (import.meta.env.MODE === 'development') {
        console.log(`🖱️ ${componentName} - ${interactionName}: ${responseTime.toFixed(2)}ms`);
        if (responseTime > 100) {
          console.warn(`⚠️ ${componentName} slow interaction: ${interactionName} took ${responseTime.toFixed(2)}ms`);
        }
      }
      return responseTime;
    };
  }, [componentName]);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  useEffect(() => {
    const mountTime = performance.now() - startTime;
    if (import.meta.env.MODE === 'development') {
      console.log(`⚡ ${componentName} mount time: ${mountTime.toFixed(2)}ms`);
      const memory = getMemoryUsage();
      if (memory) {
        console.log(`💾 Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }, [componentName, startTime, getMemoryUsage]);

  useEffect(() => {
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`🐌 Long task detected in ${componentName}: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // ignore unsupported entry type
      }
      return () => {
        observer.disconnect();
      };
    }
  }, [componentName]);

  const reportMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (import.meta.env.MODE === 'development') {
      console.table({
        component: componentName,
        ...metrics,
        memory: getMemoryUsage()?.usedJSHeapSize ? `${(getMemoryUsage().usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      });
    }
  }, [componentName, getMemoryUsage]);

  return {
    trackRender,
    trackInteraction,
    getMemoryUsage,
    reportMetrics,
  };
};

export function withPerformanceMonitoring<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { trackRender, reportMetrics } = usePerformanceMonitor(
      componentName || Component.displayName || Component.name || 'Unknown'
    );
    const renderStart = performance.now();
    useEffect(() => {
      const renderTime = trackRender(renderStart);
      reportMetrics({ renderTime });
    });
    return <Component {...props} />;
  };
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name || 'Unknown'})`;
  return WrappedComponent;
}

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useThrottle = <T,>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  return throttledValue;
};


