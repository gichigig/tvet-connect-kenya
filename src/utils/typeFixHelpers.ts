// Helper functions to fix TypeScript errors across components

import { safeFilterUsers } from './comprehensiveTypeFixes';

// Export the safe filtering function for use in components
export { safeFilterUsers };

// Fix Promise operations
export const safePromiseOperations = {
  async filter<T>(promise: Promise<T[]> | T[], predicate: (item: T) => boolean): Promise<T[]> {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.filter(predicate);
    } catch {
      return [];
    }
  },
  
  async map<T, U>(promise: Promise<T[]> | T[], transform: (item: T) => U): Promise<U[]> {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.map(transform);
    } catch {
      return [];
    }
  },
  
  async length<T>(promise: Promise<T[]> | T[]): Promise<number> {
    try {
      const data = Array.isArray(promise) ? promise : await promise;
      return data.length;
    } catch {
      return 0;
    }
  }
};

// Fix option access issues
export const normalizeOption = (option: any): { value: string; label: string } => {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }
  return {
    value: option?.value || option || '',
    label: option?.label || option?.value || option || ''
  };
};

// Fix type conversions
export const safeStringConversion = (value: any): string => String(value || '');
export const safeNumberConversion = (value: any): number => Number(value) || 0;

// Fix function argument mismatches
export const createSafeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  expectedArgCount: number
) => {
  return (...args: any[]) => {
    const safeArgs = args.slice(0, expectedArgCount);
    return fn(...safeArgs);
  };
};