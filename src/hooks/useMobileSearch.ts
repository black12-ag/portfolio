import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DeviceDetector,
  TouchGestureHandler,
  VirtualKeyboardManager,
  ResponsiveManager,
  HapticFeedback,
  MobileScrollManager,
  createTouchGestureHandler,
  createMobileScrollManager,
  MobileSearchConfig,
  TouchGestureConfig
} from '../lib/mobileSearchUtils';

export interface UseMobileSearchProps {
  enabled?: boolean;
  config?: Partial<MobileSearchConfig>;
  gestureConfig?: Partial<TouchGestureConfig>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onKeyboardShow?: (height: number) => void;
  onKeyboardHide?: () => void;
  onOrientationChange?: (isPortrait: boolean) => void;
}

export interface MobileSearchState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isPortrait: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  viewportSize: { width: number; height: number };
  screenDensity: number;
  isScrolling: boolean;
}

export interface MobileSearchHandlers {
  triggerHaptic: (type: 'success' | 'error' | 'selection' | 'impact' | 'longPress') => boolean;
  scrollToTop: (smooth?: boolean) => void;
  scrollToElement: (element: HTMLElement, offset?: number) => void;
  preventZoom: () => void;
  enableZoom: () => void;
  hideKeyboard: () => void;
  showKeyboard: (element: HTMLInputElement) => void;
  getScrollPosition: () => { top: number; left: number };
}

export function useMobileSearch({
  enabled = true,
  config = {} as Record<string, never>,
  gestureConfig = {} as Record<string, never>,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onKeyboardShow,
  onKeyboardHide,
  onOrientationChange
}: UseMobileSearchProps): [MobileSearchState, MobileSearchHandlers, React.RefObject<HTMLDivElement>] {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureHandlerRef = useRef<TouchGestureHandler | null>(null);
  const scrollManagerRef = useRef<MobileScrollManager | null>(null);
  const virtualKeyboardRef = useRef<VirtualKeyboardManager | null>(null);
  const responsiveManagerRef = useRef<ResponsiveManager | null>(null);

  // Mobile search configuration
  const searchConfig: MobileSearchConfig = {
    showVirtualKeyboard: true,
    autoFocusOnMount: false,
    hideKeyboardOnSubmit: true,
    preventZoom: false,
    enableHapticFeedback: true,
    compactMode: false,
    ...config
  };

  // State management
  const [state, setState] = useState<MobileSearchState>({
    isMobile: DeviceDetector.isMobile(),
    isTablet: DeviceDetector.isTablet(),
    isDesktop: DeviceDetector.isDesktop(),
    isTouchDevice: DeviceDetector.isTouchDevice(),
    isPortrait: DeviceDetector.isPortrait(),
    isKeyboardVisible: false,
    keyboardHeight: 0,
    currentBreakpoint: 'desktop',
    viewportSize: DeviceDetector.getViewportSize(),
    screenDensity: DeviceDetector.getScreenDensity(),
    isScrolling: false
  });

  // Initialize managers and handlers
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Initialize responsive manager
    if (!responsiveManagerRef.current) {
      responsiveManagerRef.current = new ResponsiveManager();
    }

    // Initialize virtual keyboard manager
    if (!virtualKeyboardRef.current) {
      virtualKeyboardRef.current = new VirtualKeyboardManager();
    }

    // Initialize gesture handler
    if (!gestureHandlerRef.current) {
      gestureHandlerRef.current = createTouchGestureHandler(containerRef.current, gestureConfig);
    }

    // Initialize scroll manager
    if (!scrollManagerRef.current) {
      scrollManagerRef.current = createMobileScrollManager(containerRef.current);
    }

    // Setup gesture callbacks
    const gestureHandler = gestureHandlerRef.current;
    if (onSwipeLeft) gestureHandler.on('swipeLeft', onSwipeLeft);
    if (onSwipeRight) gestureHandler.on('swipeRight', onSwipeRight);
    if (onSwipeUp) gestureHandler.on('swipeUp', onSwipeUp);
    if (onSwipeDown) gestureHandler.on('swipeDown', onSwipeDown);
    if (onLongPress) gestureHandler.on('longPress', onLongPress);

    // Setup keyboard callbacks
    const virtualKeyboard = virtualKeyboardRef.current;
    virtualKeyboard.on('show', (height) => {
      setState(prev => ({ ...prev, isKeyboardVisible: true, keyboardHeight: height || 0 }));
      onKeyboardShow?.(height || 0);
      
      if (searchConfig.enableHapticFeedback) {
        HapticFeedback.selection();
      }
    });

    virtualKeyboard.on('hide', () => {
      setState(prev => ({ ...prev, isKeyboardVisible: false, keyboardHeight: 0 }));
      onKeyboardHide?.();
    });

    // Setup responsive callbacks
    const responsiveManager = responsiveManagerRef.current;
    const unsubscribeBreakpoints = [
      responsiveManager.onBreakpoint('mobile', (matches) => {
        if (matches) {
          setState(prev => ({ ...prev, currentBreakpoint: 'mobile' }));
        }
      }),
      responsiveManager.onBreakpoint('tablet', (matches) => {
        if (matches) {
          setState(prev => ({ ...prev, currentBreakpoint: 'tablet' }));
        }
      }),
      responsiveManager.onBreakpoint('desktop', (matches) => {
        if (matches) {
          setState(prev => ({ ...prev, currentBreakpoint: 'desktop' }));
        }
      }),
      responsiveManager.onBreakpoint('mobile-portrait', (matches) => {
        setState(prev => ({ ...prev, isPortrait: matches }));
        onOrientationChange?.(matches);
      })
    ];

    // Cleanup function
    return () => {
      gestureHandlerRef.current?.destroy();
      unsubscribeBreakpoints.forEach(unsubscribe => unsubscribe());
      gestureHandlerRef.current = null;
      scrollManagerRef.current = null;
    };
  }, [enabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress, onKeyboardShow, onKeyboardHide, onOrientationChange]);

  // Update state on window resize
  useEffect(() => {
    const updateViewportSize = () => {
      setState(prev => ({
        ...prev,
        viewportSize: DeviceDetector.getViewportSize(),
        isPortrait: DeviceDetector.isPortrait()
      }));
    };

    window.addEventListener('resize', updateViewportSize);
    window.addEventListener('orientationchange', updateViewportSize);

    return () => {
      window.removeEventListener('resize', updateViewportSize);
      window.removeEventListener('orientationchange', updateViewportSize);
    };
  }, []);

  // Monitor scroll state
  useEffect(() => {
    if (!scrollManagerRef.current) return;

    const checkScrolling = () => {
      const isCurrentlyScrolling = scrollManagerRef.current?.isCurrentlyScrolling() || false;
      setState(prev => ({ ...prev, isScrolling: isCurrentlyScrolling }));
    };

    const interval = setInterval(checkScrolling, 100);
    return () => clearInterval(interval);
  }, []);

  // Handler functions
  const handlers: MobileSearchHandlers = {
    triggerHaptic: useCallback((type: 'success' | 'error' | 'selection' | 'impact' | 'longPress') => {
      if (!searchConfig.enableHapticFeedback) return false;

      switch (type) {
        case 'success':
          return HapticFeedback.success();
        case 'error':
          return HapticFeedback.error();
        case 'selection':
          return HapticFeedback.selection();
        case 'impact':
          return HapticFeedback.impact();
        case 'longPress':
          return HapticFeedback.longPress();
        default:
          return false;
      }
    }, [searchConfig.enableHapticFeedback]),

    scrollToTop: useCallback((smooth = true) => {
      scrollManagerRef.current?.scrollToTop(smooth);
    }, []),

    scrollToElement: useCallback((element: HTMLElement, offset = 0) => {
      scrollManagerRef.current?.scrollIntoView(element, offset);
    }, []),

    preventZoom: useCallback(() => {
      if (!searchConfig.preventZoom) return;
      
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }, [searchConfig.preventZoom]),

    enableZoom: useCallback(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }, []),

    hideKeyboard: useCallback(() => {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
        activeElement.blur();
        
        if (searchConfig.hideKeyboardOnSubmit && searchConfig.enableHapticFeedback) {
          HapticFeedback.impact();
        }
      }
    }, [searchConfig.hideKeyboardOnSubmit, searchConfig.enableHapticFeedback]),

    showKeyboard: useCallback((element: HTMLInputElement) => {
      if (!searchConfig.showVirtualKeyboard) return;
      
      element.focus();
      
      // iOS Safari specific handling
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }, [searchConfig.showVirtualKeyboard]),

    getScrollPosition: useCallback(() => {
      return scrollManagerRef.current?.getScrollPosition() || { top: 0, left: 0 };
    }, [])
  };

  return [state, handlers, containerRef];
}

// Hook for responsive component sizing
export function useResponsiveSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    breakpoint: 'desktop' as 'mobile' | 'tablet' | 'desktop'
  });

  useEffect(() => {
    const responsiveManager = new ResponsiveManager();
    
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: responsiveManager.getCurrentBreakpoint()
      });
    };

    const unsubscribes = [
      responsiveManager.onBreakpoint('mobile', (matches) => matches && updateSize()),
      responsiveManager.onBreakpoint('tablet', (matches) => matches && updateSize()),
      responsiveManager.onBreakpoint('desktop', (matches) => matches && updateSize())
    ];

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return size;
}

// Hook for virtual keyboard awareness
export function useVirtualKeyboard() {
  const [keyboardState, setKeyboardState] = useState({
    isVisible: false,
    height: 0
  });

  useEffect(() => {
    const virtualKeyboard = new VirtualKeyboardManager();

    virtualKeyboard.on('show', (height) => {
      setKeyboardState({ isVisible: true, height: height || 0 });
    });

    virtualKeyboard.on('hide', () => {
      setKeyboardState({ isVisible: false, height: 0 });
    });

    virtualKeyboard.on('resize', (height) => {
      setKeyboardState(prev => ({ ...prev, height: height || 0 }));
    });

    return () => {
      // Cleanup is handled by the VirtualKeyboardManager
    };
  }, []);

  return keyboardState;
}

// Hook for touch gestures
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTap?: () => void;
    onLongPress?: () => void;
  },
  config?: Partial<TouchGestureConfig>
) {
  useEffect(() => {
    if (!elementRef.current) return;

    const gestureHandler = createTouchGestureHandler(elementRef.current, config);

    // Attach callbacks
    Object.entries(callbacks).forEach(([event, callback]) => {
      if (callback) {
        const eventName = event.replace('on', '').toLowerCase();
        gestureHandler.on(eventName, callback);
      }
    });

    return () => {
      gestureHandler.destroy();
    };
  }, [elementRef, callbacks, config]);
}
