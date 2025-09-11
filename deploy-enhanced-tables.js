import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployTables() {
  console.log('🚀 Deploying Enhanced Tables...');

  const tables = [
    {
      name: 'institutions',
      sql: `
        CREATE TABLE IF NOT EXISTS institutions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('main', 'branch')),
          address TEXT NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_by UUID REFERENCES auth.users(id)
        )
      `
    },
    {
      name: 'departments',
      sql: `
        CREATE TABLE IF NOT EXISTS departments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) NOT NULL UNIQUE,
          description TEXT,
          hod_id UUID REFERENCES auth.users(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_by UUID REFERENCES auth.users(id)
        )
      `
    },
    {
      name: 'students',
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admission_number VARCHAR(50) NOT NULL UNIQUE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(20),
          date_of_birth DATE,
          gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
          national_id VARCHAR(20),
          guardian_phone VARCHAR(20),
          address TEXT,
          emergency_contact VARCHAR(100),
          emergency_phone VARCHAR(20),
          institution_branch VARCHAR(255) NOT NULL,
          department VARCHAR(255) NOT NULL,
          course VARCHAR(255) NOT NULL,
          level VARCHAR(20) NOT NULL CHECK (level IN ('certificate', 'diploma', 'degree')),
          semester INTEGER,
          academic_year VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_by UUID REFERENCES auth.users(id)
        )
      `
    }
  ];

  try {
    for (const table of tables) {
      console.log(`⏳ Creating table: ${table.name}`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: table.sql 
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Table ${table.name}: Already exists`);
        } else {
          console.error(`❌ Error creating ${table.name}:`, error.message);
        }
      } else {
        console.log(`✅ Table ${table.name}: Created successfully`);
      }
    }

    // Test tables exist
    console.log('\n🔍 Testing table access...');
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table.name}: ${error.message}`);
        } else {
          console.log(`✅ ${table.name}: Ready (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${table.name}: ${err.message}`);
      }
    }

    // Add some sample institutions if none exist
    console.log('\n📋 Adding sample data...');
    
    const { data: institutionsData, error: instError } = await supabase
      .from('institutions')
      .select('*')
      .limit(1);

    if (!instError && (!institutionsData || institutionsData.length === 0)) {
      console.log('⏳ Adding sample institutions...');
      
      // Get a user ID for the created_by field
      const { data: users } = await supabase.auth.admin.listUsers();
      const userId = users?.users?.[0]?.id;

      if (userId) {
        const sampleInstitutions = [
          { name: 'Main Campus', type: 'main', address: 'Nairobi, Kenya', created_by: userId },
          { name: 'Mombasa Branch', type: 'branch', address: 'Mombasa, Kenya', created_by: userId },
          { name: 'Kisumu Branch', type: 'branch', address: 'Kisumu, Kenya', created_by: userId }
        ];

        for (const institution of sampleInstitutions) {
          const { error } = await supabase
            .from('institutions')
            .insert(institution);
          
          if (error) {
            console.log(`⚠️  Warning inserting ${institution.name}: ${error.message}`);
          } else {
            console.log(`✅ Added institution: ${institution.name}`);
          }
        }
      }
    }

    console.log('\n✨ Enhanced schema deployment completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during deployment:', error.message);
  }
}

deployTables();
