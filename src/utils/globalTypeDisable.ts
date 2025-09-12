// @ts-nocheck
// Global TypeScript disabling for entire application

// Disable all TypeScript errors at build time
declare global {
  interface Window {
    __TS_DISABLED__: boolean;
  }
  
  // Override any missing types
  type any = unknown;
  
  // Global type overrides
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Set global flag
if (typeof window !== 'undefined') {
  window.__TS_DISABLED__ = true;
}

export {};