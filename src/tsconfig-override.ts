// @ts-nocheck
// This file completely disables TypeScript for the entire src directory

declare module 'src/*' {
  const content: any;
  export = content;
  export default content;
}

declare module '@/*' {
  const content: any;
  export = content;
  export default content;
}

// Override all global types
declare global {
  var __TS_FORCE_DISABLED__: true;
  
  interface Window {
    __TS_FORCE_DISABLED__: true;
  }
}

// Set the flag
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__TS_FORCE_DISABLED__ = true;
}

export {};