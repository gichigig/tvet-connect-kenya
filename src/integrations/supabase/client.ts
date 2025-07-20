// Placeholder Supabase client - replace with actual Supabase setup when integration is configured
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (orderBy: string, options?: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
        }),
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      order: (orderBy: string, options?: any) => ({
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      then: (callback: any) => Promise.resolve({ data: null, error: null }).then(callback)
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    })
  }),
  functions: {
    invoke: (functionName: string, options?: any) => Promise.resolve({ data: null, error: null })
  }
};