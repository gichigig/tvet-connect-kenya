/**
 * Test Supabase Connection
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('auth.users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      
      // Try a simple query instead
      const { data: health, error: healthError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
        
      if (healthError) {
        console.log('❌ Health check failed:', healthError.message);
      } else {
        console.log('✅ Basic connection works, but auth table access restricted');
        return true;
      }
    } else {
      console.log('✅ Full connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
  return false;
}

testConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection is working!');
  } else {
    console.log('❌ Supabase connection failed');
  }
}).catch(console.error);
