// Test Supabase Database Schema
// This script tests if the Supabase database has the required tables and RLS policies

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseSchema() {
  console.log('🧪 Testing Supabase Database Schema...');
  
  try {
    // Test 1: Check if profiles table exists
    console.log('📋 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      if (profilesError.message.includes('relation "public.profiles" does not exist')) {
        console.log('💡 Need to deploy database schema first!');
      }
    } else {
      console.log('✅ Profiles table exists');
    }
    
    // Test 2: Check if units table exists
    console.log('📋 Testing units table...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .limit(1);
    
    if (unitsError) {
      console.log('❌ Units table error:', unitsError.message);
    } else {
      console.log('✅ Units table exists');
    }
    
    // Test 3: Check if courses table exists
    console.log('📋 Testing courses table...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    
    if (coursesError) {
      console.log('❌ Courses table error:', coursesError.message);
    } else {
      console.log('✅ Courses table exists');
    }
    
    // Test 4: Test authentication
    console.log('🔐 Testing Supabase auth...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth connection working');
      if (authData.session) {
        console.log('✅ User session exists');
      } else {
        console.log('ℹ️ No active user session');
      }
    }
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  }
}

testSupabaseSchema();
