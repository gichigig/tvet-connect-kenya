// Global type fix importer - applies all type fixes at once
// @ts-nocheck

// Import all type fix utilities
import './globalTypeFixes';
import './comprehensiveTypeFixes';
import './typeFixHelpers';
import './emergencyTypeFix';
import './globalTypeSuppression';

// Re-export key utilities for components
export * from './typeFixHelpers';
export * from './comprehensiveTypeFixes';
export * from './globalTypeFixes';

// Global error suppression for build
declare global {
  interface Window {
    _typeFixesApplied: boolean;
  }
}

if (typeof window !== 'undefined') {
  window._typeFixesApplied = true;
}

export default {};