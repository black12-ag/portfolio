// CRITICAL MOBILE POLYFILLS - MUST BE LOADED FIRST
// This file provides essential polyfills for mobile WebView compatibility

import { Buffer } from 'buffer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Fix Array constructor issue - ensure native constructors are preserved
if (typeof Array.isArray === 'undefined') {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

// Preserve native Array constructor
const NativeArray = Array;
(globalThis as any).NativeArray = NativeArray;

// Ensure Array constructor is not overridden
if (typeof (globalThis as any).Array !== 'function' || (globalThis as any).Array !== NativeArray) {
  console.warn('Array constructor was modified, restoring native Array');
  (globalThis as any).Array = NativeArray;
}

// Immediately set up global React before any other code can execute
(globalThis as any).React = React;
(globalThis as any).ReactDOM = ReactDOM;

// Initialize essential Node.js polyfills
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {},
    nextTick: (callback: () => void) => setTimeout(callback, 0),
    version: '18.0.0',
    platform: 'browser',
    cwd: () => '/',
    versions: { node: '18.0.0' },
    argv: [],
    browser: true
  } as any;
}

// Initialize CommonJS globals
if (typeof (globalThis as any).exports === 'undefined') {
  (globalThis as any).exports = {};
}

if (typeof (globalThis as any).module === 'undefined') {
  (globalThis as any).module = { 
    exports: {},
    id: 'main',
    loaded: true,
    parent: null,
    children: [],
    paths: []
  };
}

// CRITICAL: Universal require function for mobile compatibility
if (typeof (globalThis as any).require === 'undefined') {
  const moduleCache = new Map<string, any>();
  
  console.log('🔧 Initializing mobile require() function');
  
  (globalThis as any).require = function(id: string) {
    // Check cache first
    if (moduleCache.has(id)) {
      return moduleCache.get(id);
    }

    console.log(`📦 Loading module: ${id}`);

    // Handle React core module
    if (id.includes('react.production.min.js') || 
        id.includes('react.development.js') || 
        (id.includes('react') && !id.includes('jsx') && !id.includes('dom') && !id.includes('router'))) {
      
      const reactModule = React;
      moduleCache.set(id, reactModule);
      console.log(`✅ Loaded React module: ${id}`);
      return reactModule;
    }

    // Handle ReactDOM module
    if (id.includes('react-dom')) {
      const reactDomModule = ReactDOM;
      moduleCache.set(id, reactDomModule);
      console.log(`✅ Loaded ReactDOM module: ${id}`);
      return reactDomModule;
    }

    // Handle JSX runtime
    if (id.includes('react-jsx-runtime') || id.includes('react/jsx-runtime')) {
      const jsxRuntime = {
        jsx: React.createElement,
        jsxs: React.createElement,
        Fragment: React.Fragment
      };
      moduleCache.set(id, jsxRuntime);
      console.log(`✅ Loaded JSX runtime: ${id}`);
      return jsxRuntime;
    }

    // Handle JSX dev runtime
    if (id.includes('react-jsx-dev-runtime') || id.includes('react/jsx-dev-runtime')) {
      const jsxDevRuntime = {
        jsxDEV: React.createElement,
        Fragment: React.Fragment
      };
      moduleCache.set(id, jsxDevRuntime);
      console.log(`✅ Loaded JSX dev runtime: ${id}`);
      return jsxDevRuntime;
    }

    // Handle other known modules
    if (id.includes('buffer')) {
      const bufferModule = { Buffer };
      moduleCache.set(id, bufferModule);
      console.log(`✅ Loaded Buffer module: ${id}`);
      return bufferModule;
    }

    // Default fallback - return empty object but log it
    console.warn(`⚠️ Unknown module '${id}', returning empty object`);
    const emptyModule = {};
    moduleCache.set(id, emptyModule);
    return emptyModule;
  };
  
  // Alias for Vite
  (globalThis as any).__vite_require = (globalThis as any).require;
  
  console.log('✅ Mobile require() function initialized successfully');
}

// Additional mobile-specific globals
if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Ensure console is available
if (typeof globalThis.console === 'undefined') {
  globalThis.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  } as any;
}

console.log('🚀 Mobile polyfills initialized successfully');
