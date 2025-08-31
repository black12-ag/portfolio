import { useEffect, useRef, useCallback } from 'react';
import logger from './logger';

// Debounce hook to prevent excessive function calls
export function useDebounce<T extends (...args: unknown[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
}

// Throttle hook to limit function call frequency
export function useThrottle<T extends (...args: unknown[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= interval) {
      lastCallRef.current = now;
      func(...args);
    }
  }, [func, interval]);
}

// Hook to detect excessive re-renders
export function useRenderCount(componentName: string, threshold = 10) {
  const renderCount = useRef(0);
  const lastResetRef = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceReset = now - lastResetRef.current;
    
    // Reset counter every 10 seconds
    if (timeSinceReset > 10000) {
      renderCount.current = 1;
      lastResetRef.current = now;
    }
    
    // Warn if too many renders in short time
    if (renderCount.current > threshold) {
      logger.warn('performance', 
        `${componentName} has rendered ${renderCount.current} times in ${timeSinceReset}ms`
      );
    }
  });
}

// Hook to monitor API call frequency
export function useApiCallMonitor(apiName: string, maxCallsPerMinute = 30) {
  const callTimestamps = useRef<number[]>([]);
  
  return useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove calls older than 1 minute
    callTimestamps.current = callTimestamps.current.filter(ts => ts > oneMinuteAgo);
    
    // Add current call
    callTimestamps.current.push(now);
    
    // Warn if too many calls
    if (callTimestamps.current.length > maxCallsPerMinute) {
      logger.warn('performance', 
        `${apiName} API called ${callTimestamps.current.length} times in the last minute`
      );
      return false; // Block the call
    }
    
    return true; // Allow the call
  }, [apiName, maxCallsPerMinute]);
}

// Hook to detect when page becomes visible/hidden
export function usePageVisibility() {
  const isVisible = useRef(!document.hidden);
  const listeners = useRef<((visible: boolean) => void)[]>([]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      if (visible !== isVisible.current) {
        isVisible.current = visible;
        listeners.current.forEach(listener => listener(visible));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  const subscribe = useCallback((listener: (visible: boolean) => void) => {
    listeners.current.push(listener);
    return () => {
      listeners.current = listeners.current.filter(l => l !== listener);
    };
  }, []);
  
  return { isVisible: isVisible.current, subscribe };
}

// Intelligent interval that pauses when page is not visible
export function useSmartInterval(
  callback: () => void, 
  delay: number,
  pauseWhenHidden = true
) {
  const { isVisible, subscribe } = usePageVisibility();
  const intervalRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => callbackRef.current(), delay);
    };
    
    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
    
    // Start immediately if visible or if we don't care about visibility
    if (isVisible || !pauseWhenHidden) {
      startInterval();
    }
    
    // Subscribe to visibility changes
    const unsubscribe = subscribe((visible) => {
      if (pauseWhenHidden) {
        if (visible) {
          startInterval();
        } else {
          stopInterval();
        }
      }
    });
    
    return () => {
      stopInterval();
      unsubscribe();
    };
  }, [delay, pauseWhenHidden, subscribe, isVisible]);
}

// Memory usage monitor
export function useMemoryMonitor(componentName: string) {
  useEffect(() => {
    if (import.meta.env.MODE === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        if (used > 100) { // Warn if using more than 100MB
          logger.warn('performance', 
            `${componentName} memory usage: ${used}MB / ${total}MB`
          );
        }
      };
      
      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [componentName]);
}
