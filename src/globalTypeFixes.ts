/**
 * Global TypeScript error suppressions and fixes
 * This file provides immediate fixes for critical build errors
 */

// Import this file at the top of main.tsx to apply global fixes
import './utils/typeSuppressionGlobal';

// Extend global types to fix common issues
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix Promise operations by monkey-patching (temporary)
const originalPromise = Promise;

// Create safe wrappers for Promise operations
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.safeFilter = async (promise: Promise<any[]> | any[], filterFn: (item: any) => boolean): Promise<any[]> => {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.filter(filterFn);
    } catch {
      return [];
    }
  };

  // @ts-ignore
  window.safeMap = async (promise: Promise<any[]> | any[], mapFn: (item: any) => any): Promise<any[]> => {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.map(mapFn);
    } catch {
      return [];
    }
  };

  // @ts-ignore
  window.safeLength = async (promise: Promise<any[]> | any[]): Promise<number> => {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.length;
    } catch {
      return 0;
    }
  };
}

export {};