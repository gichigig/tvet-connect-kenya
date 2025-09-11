const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dzqvgvvsgaciqkpqmraq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cXZndnZzZ2FjaXFrcHFtcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTE5NDEsImV4cCI6MjA1MDQ2Nzk0MX0.lQ4U9OeYvqpOXpY12UIHR2YNlJP9WsIgPgz8MIW6UpQ'
);

async function testDirectLogin() {
  try {
    console.log('🔐 Testing direct login with billyblund7@gmail.com...');
    
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
      console.log('📋 Testing profile fetch...');
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
      
      // Sign out
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('🚨 Network/Connection error:', error);
  }
}

testDirectLogin();
