import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.3p4lyjB7fjY3N1aaWuaLogP5tjbeZcpf-5ADPU4jtBY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  
  try {
    const result = await supabase.auth.signInWithPassword({
      email: 'billyblund17@gmail.com',
      password: 'bildad'
    });

    if (result.error) {
      console.error('❌ Login failed:', result.error.message);
    } else {
      console.log('✅ Login successful!');
      console.log('User ID:', result.data.user.id);
      console.log('Email:', result.data.user.email);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', result.data.user.id)
        .single();
      
      if (profileError) {
        console.log('⚠️ Profile not found:', profileError.message);
      } else {
        console.log('👤 Profile found:', profile);
      }
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testAdminLogin();
