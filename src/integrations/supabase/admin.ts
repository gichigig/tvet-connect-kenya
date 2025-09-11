import { createClient } from '@supabase/supabase-js';

// Create a service role client for admin operations that bypass RLS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // This should be the service role key based on .env

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export the regular client as well for auth operations
export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
