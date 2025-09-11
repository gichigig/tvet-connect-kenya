const { createClient } = require('@supabase/supabase-js');

// Test with the working Supabase URL
const supabase = createClient(
  'https://ympnvccreuhxouyovszg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.wSTGKEfPV3iw5DmN-7mEW_IbqjqYRJXlBD3xgJqLz8w'
);

async function testWorkingSupabase() {
  try {
    console.log('🔐 Testing login with working Supabase URL...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'billyblund7@gmail.com',
      password: 'password123'
    });
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else {
      console.log('✅ Authentication successful!');
      console.log('User ID:', authData.user?.id);
      
      // Test profile fetch
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Profile loaded:', profile);
      }
      
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('🚨 Error:', error);
  }
}

testWorkingSupabase();
