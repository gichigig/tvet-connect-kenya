
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://trdagqywzywszapqrqdt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZGFncXl3enl3c3phcHFycWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDI2MTYsImV4cCI6MjA0OTk3ODYxNn0.7xo6mHwSY7WvUDK2eFhXrJPJN-xk_3mkhPRmJUNxNaI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storage: undefined
  }
})
