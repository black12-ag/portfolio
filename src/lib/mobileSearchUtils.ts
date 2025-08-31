// Mobile and Responsive Search Utilities

export interface TouchGestureConfig {
  swipeThreshold: number;
  tapThreshold: number;
  longPressThreshold: number;
  enableSwipeToSearch: boolean;
  enablePullToRefresh: boolean;
  enableShakeToCancel: boolean;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface MobileSearchConfig {
  showVirtualKeyboard: boolean;
  autoFocusOnMount: boolean;
  hideKeyboardOnSubmit: boolean;
  preventZoom: boolean;
  enableHapticFeedback: boolean;
  compactMode: boolean;
}

// Device detection utilities
export class DeviceDetector {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static isTablet(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /ipad|tablet|android.*tablet/i.test(userAgent) && !/mobile/i.test(userAgent);
  }

  static isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet();
  }

  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static isPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  static getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  static supportsHapticFeedback(): boolean {
    return 'vibrate' in navigator;
  }

  static getScreenDensity(): number {
    return window.devicePixelRatio || 1;
  }
}

// Touch gesture handler
export class TouchGestureHandler {
  private startPoint: { x: number; y: number; time: number } | null = null;
  private element: HTMLElement;
  private config: TouchGestureConfig;
  private callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTap?: () => void;
    onLongPress?: () => void;
    onPinch?: (scale: number) => void;
  };

  constructor(element: HTMLElement, config: Partial<TouchGestureConfig> = {} as Record<string, never>) {
    this.element = element;
    this.config = {
      swipeThreshold: 50,
      tapThreshold: 10,
      longPressThreshold: 500,
      enableSwipeToSearch: true,
      enablePullToRefresh: true,
      enableShakeToCancel: true,
      ...config
    };
    this.callbacks = {} as Record<string, never>;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.startPoint) return;

    // Prevent default scrolling for certain gestures
    const touch = event.touches[0];
    const deltaY = Math.abs(touch.clientY - this.startPoint.y);
    
    if (deltaY > this.config.swipeThreshold && this.config.enablePullToRefresh) {
      event.preventDefault();
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.startPoint) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.startPoint.x;
    const deltaY = touch.clientY - this.startPoint.y;
    const deltaTime = Date.now() - this.startPoint.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine gesture type
    if (distance < this.config.tapThreshold) {
      // Tap or long press
      if (deltaTime > this.config.longPressThreshold) {
        this.callbacks.onLongPress?.();
      } else {
        this.callbacks.onTap?.();
      }
    } else if (distance > this.config.swipeThreshold) {
      // Swipe gesture
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.callbacks.onSwipeRight?.();
        } else {
          this.callbacks.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.callbacks.onSwipeDown?.();
        } else {
          this.callbacks.onSwipeUp?.();
        }
      }
    }

    this.startPoint = null;
  }

  private handleTouchCancel(): void {
    this.startPoint = null;
  }

  on(event: string, callback: () => void): void {
    switch (event) {
      case 'swipeLeft':
        this.callbacks.onSwipeLeft = callback;
        break;
      case 'swipeRight':
        this.callbacks.onSwipeRight = callback;
        break;
      case 'swipeUp':
        this.callbacks.onSwipeUp = callback;
        break;
      case 'swipeDown':
        this.callbacks.onSwipeDown = callback;
        break;
      case 'tap':
        this.callbacks.onTap = callback;
        break;
      case 'longPress':
        this.callbacks.onLongPress = callback;
        break;
    }
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }
}

// Virtual keyboard manager
export class VirtualKeyboardManager {
  private isVisible = false;
  private originalViewportHeight: number;
  private callbacks: {
    onShow?: (height: number) => void;
    onHide?: () => void;
    onResize?: (height: number) => void;
  } = {} as Record<string, never>;

  constructor() {
    this.originalViewportHeight = window.innerHeight;
    this.attachListeners();
  }

  private attachListeners(): void {
    // iOS Safari keyboard detection
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      window.addEventListener('focusin', this.handleFocusIn.bind(this));
      window.addEventListener('focusout', this.handleFocusOut.bind(this));
    }

    // Visual viewport API (modern browsers)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', this.handleVisualViewportResize.bind(this));
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (this.isInputElement(target)) {
      setTimeout(() => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = this.originalViewportHeight - currentHeight;
        
        if (keyboardHeight > 150) { // Threshold for keyboard detection
          this.isVisible = true;
          this.callbacks.onShow?.(keyboardHeight);
        }
      }, 300); // Delay to allow keyboard animation
    }
  }

  private handleFocusOut(): void {
    setTimeout(() => {
      if (this.isVisible && window.innerHeight >= this.originalViewportHeight - 50) {
        this.isVisible = false;
        this.callbacks.onHide?.();
      }
    }, 300);
  }

  private handleVisualViewportResize(): void {
    if (!window.visualViewport) return;

    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    
    if (keyboardHeight > 150 && !this.isVisible) {
      this.isVisible = true;
      this.callbacks.onShow?.(keyboardHeight);
    } else if (keyboardHeight < 150 && this.isVisible) {
      this.isVisible = false;
      this.callbacks.onHide?.();
    } else if (this.isVisible) {
      this.callbacks.onResize?.(keyboardHeight);
    }
  }

  private handleWindowResize(): void {
    const currentHeight = window.innerHeight;
    const keyboardHeight = this.originalViewportHeight - currentHeight;
    
    if (keyboardHeight > 150 && !this.isVisible) {
      this.isVisible = true;
      this.callbacks.onShow?.(keyboardHeight);
    } else if (keyboardHeight < 150 && this.isVisible) {
      this.isVisible = false;
      this.callbacks.onHide?.();
    }
  }

  private isInputElement(element: HTMLElement): boolean {
    const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTypes.includes(element.tagName) || element.contentEditable === 'true';
  }

  on(event: 'show' | 'hide' | 'resize', callback: (height?: number) => void): void {
    switch (event) {
      case 'show':
        this.callbacks.onShow = callback;
        break;
      case 'hide':
        this.callbacks.onHide = callback;
        break;
      case 'resize':
        this.callbacks.onResize = callback;
        break;
    }
  }

  getKeyboardHeight(): number {
    if ('visualViewport' in window && window.visualViewport) {
      return window.innerHeight - window.visualViewport.height;
    }
    return this.originalViewportHeight - window.innerHeight;
  }

  isKeyboardVisible(): boolean {
    return this.isVisible;
  }
}

// Haptic feedback utility
export class HapticFeedback {
  static vibrate(pattern: number | number[]): boolean {
    if (!DeviceDetector.supportsHapticFeedback()) {
      return false;
    }

    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }

  static success(): boolean {
    return this.vibrate([100, 50, 100]);
  }

  static error(): boolean {
    return this.vibrate([200, 100, 200, 100, 200]);
  }

  static selection(): boolean {
    return this.vibrate(50);
  }

  static impact(): boolean {
    return this.vibrate(25);
  }

  static longPress(): boolean {
    return this.vibrate([50, 25, 50]);
  }
}

// Responsive breakpoints manager
export class ResponsiveManager {
  private breakpoints: ResponsiveBreakpoints;
  private listeners: Map<string, ((matches: boolean) => void)[]> = new Map();

  constructor(breakpoints: Partial<ResponsiveBreakpoints> = {} as Record<string, never>) {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      ...breakpoints
    };

    this.initMediaQueries();
  }

  private initMediaQueries(): void {
    const queries = {
      mobile: `(max-width: ${this.breakpoints.mobile - 1}px)`,
      tablet: `(min-width: ${this.breakpoints.mobile}px) and (max-width: ${this.breakpoints.tablet - 1}px)`,
      desktop: `(min-width: ${this.breakpoints.tablet}px)`,
      'mobile-portrait': '(max-width: 767px) and (orientation: portrait)',
      'mobile-landscape': '(max-width: 767px) and (orientation: landscape)',
      'high-density': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
    };

    Object.entries(queries).forEach(([name, query]) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', (e) => {
        const callbacks = this.listeners.get(name) || [];
        callbacks.forEach(callback => callback(e.matches));
      });
    });
  }

  onBreakpoint(breakpoint: string, callback: (matches: boolean) => void): () => void {
    if (!this.listeners.has(breakpoint)) {
      this.listeners.set(breakpoint, []);
    }
    
    const callbacks = this.listeners.get(breakpoint);
    callbacks.push(callback);

    // Call immediately with current state
    const query = this.getMediaQuery(breakpoint);
    if (query) {
      callback(window.matchMedia(query).matches);
    }

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  private getMediaQuery(breakpoint: string): string | null {
    const queries: Record<string, string> = {
      mobile: `(max-width: ${this.breakpoints.mobile - 1}px)`,
      tablet: `(min-width: ${this.breakpoints.mobile}px) and (max-width: ${this.breakpoints.tablet - 1}px)`,
      desktop: `(min-width: ${this.breakpoints.tablet}px)`,
      'mobile-portrait': '(max-width: 767px) and (orientation: portrait)',
      'mobile-landscape': '(max-width: 767px) and (orientation: landscape)',
      'high-density': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
    };

    return queries[breakpoint] || null;
  }

  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.mobile) {
      return 'mobile';
    } else if (width < this.breakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  isMobile(): boolean {
    return this.getCurrentBreakpoint() === 'mobile';
  }

  isTablet(): boolean {
    return this.getCurrentBreakpoint() === 'tablet';
  }

  isDesktop(): boolean {
    return this.getCurrentBreakpoint() === 'desktop';
  }
}

// Scroll manager for mobile search
export class MobileScrollManager {
  private element: HTMLElement;
  private isScrolling = false;
  private scrollTimeout?: NodeJS.Timeout;

  constructor(element: HTMLElement) {
    this.element = element;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.element.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
  }

  private handleScroll(): void {
    this.isScrolling = true;
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150);
  }

  private handleTouchStart(): void {
    // Cancel any pending scroll end detection
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  isCurrentlyScrolling(): boolean {
    return this.isScrolling;
  }

  scrollToTop(smooth = true): void {
    this.element.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant'
    });
  }

  scrollIntoView(targetElement: HTMLElement, offset = 0): void {
    const elementTop = targetElement.offsetTop - offset;
    this.element.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    });
  }

  getScrollPosition(): { top: number; left: number } {
    return {
      top: this.element.scrollTop,
      left: this.element.scrollLeft
    };
  }
}

// Export singleton instances
export const deviceDetector = new DeviceDetector();
export const responsiveManager = new ResponsiveManager();
export const virtualKeyboard = new VirtualKeyboardManager();

// Utility functions
export const createTouchGestureHandler = (
  element: HTMLElement, 
  config?: Partial<TouchGestureConfig>
): TouchGestureHandler => {
  return new TouchGestureHandler(element, config);
};

export const createMobileScrollManager = (element: HTMLElement): MobileScrollManager => {
  return new MobileScrollManager(element);
};
