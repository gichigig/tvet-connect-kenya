const { createClient } = require('@supabase/supabase-js');

// Test with updated environment variables
const supabase = createClient(
  'https://ympnvccreuhxouyovszg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.Ap3QT6u8wSPnv8D5Q4XY2x0UdSZeBvK9kKNJYYJBvIc'
);

async function testUpdatedConfig() {
  try {
    console.log('🔐 Testing with updated Supabase configuration...');
    
    // First test basic connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Session check error:', authError);
    } else {
      console.log('✅ Session check successful');
    }

    // Test login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'billyblund7@gmail.com',
      password: 'password123'
    });
    
    if (loginError) {
      console.error('❌ Login error:', loginError);
    } else {
      console.log('✅ Login successful!');
      console.log('User ID:', loginData.user?.id);
      
      // Test profile fetch
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Profile loaded successfully');
        console.log('User role:', profile.role);
        console.log('Username:', profile.username);
      }
      
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('🚨 Error:', error);
  }
}

testUpdatedConfig();
