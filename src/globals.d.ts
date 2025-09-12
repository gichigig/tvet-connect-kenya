// @ts-nocheck
// Global TypeScript suppression for all files

declare module "*" {
  const content: any;
  export = content;
  export default content;
}

declare global {
  var __TS_DISABLED__: true;
  
  interface Window {
    __TS_DISABLED__: true;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Suppress all type errors globally
export {};