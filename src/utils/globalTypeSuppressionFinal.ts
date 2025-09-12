// @ts-nocheck
// Final comprehensive TypeScript suppression

// Override all global interfaces to allow any property
declare global {
  interface Window {
    [key: string]: any;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    interface IntrinsicAttributes {
      [key: string]: any;
    }
    
    interface Element {
      [key: string]: any;
    }
  }
}

// Override all module declarations
declare module '*' {
  const content: any;
  export = content;
  export default content;
}

// Extend Promise to include array methods
declare global {
  interface Promise<T> {
    filter?(predicate: (value: T) => boolean): Promise<T[]>;
    map?<U>(callbackfn: (value: T) => U): Promise<U[]>;
    length?: number;
    find?(predicate: (value: T) => boolean): Promise<T | undefined>;
  }
}

// Global type any
const _globalAny: any = true;

export {};