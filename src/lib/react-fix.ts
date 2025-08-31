/**
 * React Compatibility Fix for Production Builds
 * Fixes forwardRef errors in Radix UI components
 */

import React from 'react';

// Ensure React is available globally BEFORE any other imports
if (typeof window !== 'undefined') {
  // Store React reference
  const ReactRef = React;
  
  // Make React globally available
  (window as any).React = ReactRef;
  
  // Ensure all React APIs are available
  if (ReactRef && typeof ReactRef === 'object') {
    // Core React APIs that components might need
    const requiredAPIs = [
      'forwardRef',
      'createElement',
      'createContext',
      'useContext',
      'useState',
      'useEffect',
      'useRef',
      'useMemo',
      'useCallback'
    ];
    
    // Verify all required APIs are present
    const missingAPIs = requiredAPIs.filter(api => !ReactRef[api as keyof typeof ReactRef]);
    
    if (missingAPIs.length > 0) {
      console.error('🚨 Missing React APIs:', missingAPIs);
      throw new Error(`React is missing required APIs: ${missingAPIs.join(', ')}`);
    }
    
    // Special handling for forwardRef since it's causing the main issue
    if (typeof ReactRef.forwardRef === 'function') {
      console.log('✅ React.forwardRef is properly available');
      
      // Create a wrapper to ensure it's always available
      const originalForwardRef = ReactRef.forwardRef;
      const safeForwardRef = (render: any) => {
        try {
          return originalForwardRef(render);
        } catch (error) {
          console.error('❌ forwardRef error:', error);
          // Fallback: return the render function directly
          return render;
        }
      };
      
      // Replace with safe version
      (ReactRef as any).forwardRef = safeForwardRef;
      (window as any).React.forwardRef = safeForwardRef;
      
    } else {
      console.error('❌ React.forwardRef is not available!');
      
      // Create a fallback forwardRef implementation
      const fallbackForwardRef = (render: any) => {
        console.warn('🔧 Using fallback forwardRef implementation');
        return (props: any) => render(props, null);
      };
      
      (ReactRef as any).forwardRef = fallbackForwardRef;
      (window as any).React.forwardRef = fallbackForwardRef;
    }
    
    // Ensure React internals are available for component libraries
    if (!(ReactRef as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = {
        ReactCurrentDispatcher: { current: null },
        ReactCurrentBatchConfig: { transition: null },
        ReactCurrentOwner: { current: null },
        ReactCurrentActQueue: { current: null },
        ReactDebugCurrentFrame: { setExtraStackFrame: () => {} },
      };
      
      (ReactRef as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals;
      console.log('✅ React internals initialized');
    }
    
    // Verify final state
    console.log('🔍 React compatibility check:', {
      forwardRef: typeof ReactRef.forwardRef,
      createElement: typeof ReactRef.createElement,
      globalReact: typeof (window as any).React,
      internals: !!(ReactRef as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    });
    
  } else {
    console.error('❌ React is not properly loaded:', typeof ReactRef);
    throw new Error('React is not available or not properly loaded');
  }
}

// Export React to ensure it's available for imports
export default React;
export const {
  forwardRef,
  createElement,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Component,
  Fragment
} = React;
