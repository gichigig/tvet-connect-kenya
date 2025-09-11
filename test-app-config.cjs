const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Checking environment variables used by the app...\n');

// Exactly what the app should be using
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', url);
console.log('VITE_SUPABASE_ANON_KEY (first 50 chars):', anonKey?.substring(0, 50));
console.log('VITE_SUPABASE_ANON_KEY (last 10 chars):', anonKey?.slice(-10));

// Test the exact configuration the app is using
const supabase = createClient(url, anonKey);

async function testAuth() {
  console.log('\n🧪 Testing login with the app configuration...');
  
  try {
    // Try to authenticate with an existing user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'bildad@tvet.ac.ke',
      password: 'temp_password_123' // You'll need to provide the actual password
    });
    
    if (error) {
      console.log('❌ Auth failed:', error.message);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔧 SOLUTION: The anon key is still incorrect or not loading properly');
        console.log('1. Check that .env file has the correct VITE_SUPABASE_ANON_KEY');
        console.log('2. Restart the entire VS Code or development environment');
        console.log('3. Clear browser cache completely');
      }
    } else {
      console.log('✅ Auth successful:', data.user?.email);
    }
  } catch (err) {
    console.log('❌ General error:', err.message);
  }
}

// Also test if we can at least connect to Supabase
async function testConnection() {
  console.log('\n🌐 Testing basic Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('departments').select('count');
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Connection successful');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

testConnection();
testAuth();
