import React, { ComponentType, useEffect, useRef } from 'react';
import { performanceMonitor } from './performanceMonitor';

interface PerformanceTrackingOptions {
  // Component name for tracking (defaults to component.name)
  componentName?: string;
  
  // Track mount/unmount lifecycle
  trackLifecycle?: boolean;
  
  // Track render performance
  trackRender?: boolean;
  
  // Track props changes
  trackPropsChanges?: boolean;
  
  // Track component updates
  trackUpdates?: boolean;
  
  // Only track in development
  devOnly?: boolean;
  
  // Custom tracking function
  onTrack?: (metricName: string, value: number, metadata?: Record<string, unknown>) => void;
}

interface TrackingMetadata {
  component?: string;
  renderNumber?: number;
  propsCount?: number;
  updateNumber?: number;
  changedProps?: string[];
  changeTypes?: string[];
  renderCount?: number;
  updateCount?: number;
}

/**
 * Higher-order component that automatically tracks performance metrics
 * for the wrapped component
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: PerformanceTrackingOptions = {}
) {
  const {
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent',
    trackLifecycle = true,
    trackRender = true,
    trackPropsChanges = true,
    trackUpdates = true,
    devOnly = false,
    onTrack
  } = options;

  const PerformanceTrackedComponent = React.forwardRef<unknown, P>((props, ref) => {
    const mountStartTime = useRef<number>(0);
    const renderCount = useRef<number>(0);
    const lastPropsRef = useRef<P>();
    const updateCount = useRef<number>(0);

    // Check if tracking should be enabled
    const isTrackingEnabled = !devOnly || import.meta.env.DEV;

    const trackMetric = (metricName: string, value: number, metadata?: TrackingMetadata) => {
      if (!isTrackingEnabled) return;

      performanceMonitor.recordMetric(metricName, value, {
        component: componentName,
        ...metadata
      });

      if (onTrack) {
        onTrack(metricName, value, metadata);
      }
    };

    // Track component lifecycle
    useEffect(() => {
      if (!trackLifecycle || !isTrackingEnabled) return;

      mountStartTime.current = performance.now();
      performanceMonitor.startMeasure(`${componentName}-lifecycle`);

      return () => {
        const mountDuration = performance.now() - mountStartTime.current;
        trackMetric(`${componentName}-mount-duration`, mountDuration, {
          renderCount: renderCount.current,
          updateCount: updateCount.current
        });

        performanceMonitor.endMeasure(`${componentName}-lifecycle`);
      };
    }, [trackLifecycle, isTrackingEnabled, componentName, trackMetric]);

    // Track component updates and prop changes
    useEffect(() => {
      if (!isTrackingEnabled) return;

      const currentProps = props;
      const lastProps = lastPropsRef.current;

      if (trackUpdates && lastProps) {
        updateCount.current += 1;
        trackMetric(`${componentName}-update`, updateCount.current, {
          updateNumber: updateCount.current
        });
      }

      if (trackPropsChanges && lastProps) {
        const changedProps = getChangedProps(lastProps, currentProps);
        if (changedProps.length > 0) {
          trackMetric(`${componentName}-props-change`, changedProps.length, {
            changedProps: changedProps.map(prop => prop.key),
            changeTypes: changedProps.map(prop => prop.changeType)
          });
        }
      }

      lastPropsRef.current = currentProps;
    }, [isTrackingEnabled, props, trackUpdates, trackPropsChanges, componentName, trackMetric]);

    // Track render performance - Always call hooks, use conditional logic inside
    const renderStart = React.useRef<number>(0);
    
    // Always call useLayoutEffect to satisfy Rules of Hooks
    React.useLayoutEffect(() => {
      if (trackRender && isTrackingEnabled) {
        const renderEnd = performance.now();
        const renderDuration = renderEnd - renderStart.current;
        
        if (renderStart.current > 0) { // Only track if we have a valid start time
          trackMetric(`${componentName}-render-duration`, renderDuration, {
            renderNumber: renderCount.current,
            propsCount: Object.keys(props).length
          });
        }
      }
    });
    
    // Update render tracking data
    if (trackRender && isTrackingEnabled) {
      renderCount.current += 1;
      renderStart.current = performance.now();
    }

    return <WrappedComponent {...props} ref={ref} />;
  });

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;

  return PerformanceTrackedComponent;
}

/**
 * Hook version of performance tracking for functional components
 */
export function useComponentPerformanceTracking(
  componentName: string,
  options: Omit<PerformanceTrackingOptions, 'componentName'> = {}
) {
  const {
    trackLifecycle = true,
    trackRender = true,
    trackPropsChanges = false, // Disabled for hooks as props aren't directly available
    trackUpdates = true,
    devOnly = false,
    onTrack
  } = options;

  const mountStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const isTrackingEnabled = !devOnly || import.meta.env.DEV;

  const trackMetric = React.useCallback((metricName: string, value: number, metadata?: unknown) => {
    if (!isTrackingEnabled) return;

    performanceMonitor.recordMetric(metricName, value, {
      component: componentName,
      ...metadata
    });

    if (onTrack) {
      onTrack(metricName, value, metadata);
    }
  }, [componentName, isTrackingEnabled, onTrack]);

  // Track lifecycle
  useEffect(() => {
    if (!trackLifecycle || !isTrackingEnabled) return;

    mountStartTime.current = performance.now();
    performanceMonitor.startMeasure(`${componentName}-lifecycle`);

    return () => {
      const mountDuration = performance.now() - mountStartTime.current;
      trackMetric(`${componentName}-mount-duration`, mountDuration, {
        renderCount: renderCount.current,
        updateCount: updateCount.current
      });

      performanceMonitor.endMeasure(`${componentName}-lifecycle`);
    };
  }, [componentName, trackLifecycle, isTrackingEnabled, trackMetric]);

  // Track updates
  useEffect(() => {
    if (!trackUpdates || !isTrackingEnabled) return;

    updateCount.current += 1;
    if (updateCount.current > 1) { // Skip initial render
      trackMetric(`${componentName}-update`, updateCount.current, {
        updateNumber: updateCount.current
      });
    }
  }, [trackUpdates, isTrackingEnabled, trackMetric, componentName]);

  // Track render performance - Always call hooks to satisfy Rules of Hooks
  const renderStart = useRef<number>(0);
  
  // Always call useLayoutEffect
  React.useLayoutEffect(() => {
    if (trackRender && isTrackingEnabled && renderStart.current > 0) {
      const renderEnd = performance.now();
      const renderDuration = renderEnd - renderStart.current;
      
      trackMetric(`${componentName}-render-duration`, renderDuration, {
        renderNumber: renderCount.current
      });
    }
  });
  
  // Update render tracking data
  if (trackRender && isTrackingEnabled) {
    renderCount.current += 1;
    renderStart.current = performance.now();
  }

  return {
    trackCustomMetric: trackMetric,
    startMeasure: (name: string) => {
      if (isTrackingEnabled) {
        performanceMonitor.startMeasure(`${componentName}-${name}`);
      }
    },
    endMeasure: (name: string) => {
      if (isTrackingEnabled) {
        return performanceMonitor.endMeasure(`${componentName}-${name}`);
      }
      return 0;
    },
    measureAsync: <T,>(name: string, operation: () => Promise<T>) => {
      if (isTrackingEnabled) {
        return performanceMonitor.measureAsync(`${componentName}-${name}`, operation);
      }
      return operation();
    },
    measureSync: <T,>(name: string, operation: () => T) => {
      if (isTrackingEnabled) {
        return performanceMonitor.measureSync(`${componentName}-${name}`, operation);
      }
      return operation();
    }
  };
}

/**
 * Decorator for class components (if needed)
 */
export function PerformanceTracked(options: PerformanceTrackingOptions = {}) {
  return function <T extends { new (...args: unknown[]): React.Component }>(constructor: T) {
    const componentName = options.componentName || constructor.name;
    
    return class extends constructor {
      private mountStartTime = 0;
      private renderCount = 0;
      private updateCount = 0;
      private isTrackingEnabled: boolean = !options.devOnly || import.meta.env.DEV;

      componentDidMount() {
        if (options.trackLifecycle && this.isTrackingEnabled) {
          this.mountStartTime = performance.now();
          performanceMonitor.startMeasure(`${componentName}-lifecycle`);
        }
        
        if (super.componentDidMount) {
          super.componentDidMount();
        }
      }

      componentWillUnmount() {
        if (options.trackLifecycle && this.isTrackingEnabled) {
          const mountDuration = performance.now() - this.mountStartTime;
          this.trackMetric(`${componentName}-mount-duration`, mountDuration, {
            renderCount: this.renderCount,
            updateCount: this.updateCount
          });

          performanceMonitor.endMeasure(`${componentName}-lifecycle`);
        }

        if (super.componentWillUnmount) {
          super.componentWillUnmount();
        }
      }

      componentDidUpdate(prevProps: unknown, prevState: unknown) {
        if (options.trackUpdates && this.isTrackingEnabled) {
          this.updateCount += 1;
          this.trackMetric(`${componentName}-update`, this.updateCount, {
            updateNumber: this.updateCount
          });
        }

        if (options.trackPropsChanges && this.isTrackingEnabled && prevProps) {
          const changedProps = getChangedProps(prevProps, this.props);
          if (changedProps.length > 0) {
            this.trackMetric(`${componentName}-props-change`, changedProps.length, {
              changedProps: changedProps.map(prop => prop.key),
              changeTypes: changedProps.map(prop => prop.changeType)
            });
          }
        }

        if (super.componentDidUpdate) {
          super.componentDidUpdate(prevProps, prevState);
        }
      }

      render() {
        if (options.trackRender && this.isTrackingEnabled) {
          this.renderCount += 1;
          const renderStart = performance.now();
          const result = super.render();
          const renderEnd = performance.now();
          
          this.trackMetric(`${componentName}-render-duration`, renderEnd - renderStart, {
            renderNumber: this.renderCount,
            propsCount: Object.keys(this.props).length
          });
          
          return result;
        }
        
        return super.render();
      }

      private trackMetric(metricName: string, value: number, metadata?: unknown) {
        performanceMonitor.recordMetric(metricName, value, {
          component: componentName,
          ...metadata
        });

        if (options.onTrack) {
          options.onTrack(metricName, value, metadata);
        }
      }

      static displayName = `PerformanceTracked(${componentName})`;
    };
  };
}

// Helper function to detect prop changes
interface PropChange {
  key: string;
  changeType: 'added' | 'removed' | 'modified';
  oldValue?: unknown;
  newValue?: unknown;
}

function getChangedProps<T extends object>(oldProps: T, newProps: T): PropChange[] {
  const changes: PropChange[] = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    const oldValue = (oldProps as any)[key];
    const newValue = (newProps as any)[key];

    if (!(key in oldProps)) {
      changes.push({ key, changeType: 'added', newValue });
    } else if (!(key in newProps)) {
      changes.push({ key, changeType: 'removed', oldValue });
    } else if (oldValue !== newValue) {
      changes.push({ key, changeType: 'modified', oldValue, newValue });
    }
  }

  return changes;
}

export default withPerformanceTracking;
