import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.3p4lyjB7fjY3N1aaWuaLogP5tjbeZcpf-5ADPU4jtBY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table "profiles" does not exist. Need to deploy schema first.');
        console.log('');
        console.log('🔧 To deploy the schema:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ympnvccreuhxouyovszg');
        console.log('2. Click on "SQL Editor"');
        console.log('3. Create a new query and paste the following schema:');
        console.log('');
        console.log('-- Create profiles table');
        console.log('CREATE TABLE profiles (');
        console.log('  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,');
        console.log('  email TEXT UNIQUE NOT NULL,');
        console.log('  first_name TEXT,');
        console.log('  last_name TEXT,');
        console.log('  role TEXT CHECK (role IN (\'student\', \'lecturer\', \'admin\', \'hod\', \'registrar\', \'finance\')) NOT NULL,');
        console.log('  phone_number TEXT,');
        console.log('  username TEXT UNIQUE,');
        console.log('  approved BOOLEAN DEFAULT false,');
        console.log('  admission_number TEXT UNIQUE,');
        console.log('  course TEXT,');
        console.log('  department TEXT,');
        console.log('  level TEXT CHECK (level IN (\'certificate\', \'diploma\', \'degree\')),');
        console.log('  year INTEGER,');
        console.log('  semester INTEGER,');
        console.log('  academic_year TEXT,');
        console.log('  enrollment_type TEXT CHECK (enrollment_type IN (\'fulltime\', \'parttime\', \'online\')),');
        console.log('  institution_branch TEXT,');
        console.log('  date_of_birth DATE,');
        console.log('  gender TEXT CHECK (gender IN (\'male\', \'female\', \'other\')),');
        console.log('  national_id TEXT,');
        console.log('  address TEXT,');
        console.log('  guardian_name TEXT,');
        console.log('  guardian_phone TEXT,');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  last_login_at TIMESTAMP WITH TIME ZONE,');
        console.log('  created_by_registrar BOOLEAN DEFAULT false');
        console.log(');');
        console.log('');
        console.log('-- Enable RLS');
        console.log('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Create RLS policies');
        console.log('CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);');
        console.log('CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);');
        console.log('CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (');
        console.log('  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (\'admin\', \'registrar\'))');
        console.log(');');
        console.log('CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (');
        console.log('  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (\'admin\', \'registrar\'))');
        console.log(');');
        console.log('CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (');
        console.log('  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (\'admin\', \'registrar\'))');
        console.log(');');
        console.log('');
        console.log('4. Click "Run" to execute the SQL');
        console.log('5. Then run this script again');
      } else {
        console.error('❌ Connection error:', error.message);
      }
      return;
    }

    console.log('✅ Connected to Supabase successfully!');
    console.log(`📊 Profiles table exists with ${data.length} records`);
    
    // Check for admin user
    const { data: adminData } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('role', 'admin');
    
    if (adminData && adminData.length > 0) {
      console.log('👤 Admin users found:', adminData.map(u => u.email).join(', '));
    } else {
      console.log('⚠️  No admin users found. You may need to create one.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
