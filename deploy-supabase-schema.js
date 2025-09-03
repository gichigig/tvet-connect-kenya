import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (for admin operations)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySchema() {
  console.log('🚀 Deploying Supabase schema...');

  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('📋 Schema not deployed yet. Please deploy using Supabase CLI or dashboard.');
      console.log('');
      console.log('To deploy the schema:');
      console.log('1. Install Supabase CLI: npm install -g supabase');
      console.log('2. Login: supabase login');
      console.log('3. Link project: supabase link --project-ref YOUR_PROJECT_REF');
      console.log('4. Push schema: supabase db push');
      console.log('');
      console.log('Or copy the schema from supabase-schema.sql to your Supabase SQL editor.');
      return;
    }

    if (error) {
      console.error('❌ Error connecting to Supabase:', error);
      return;
    }

    console.log('✅ Connected to Supabase successfully');
    console.log(`📊 Current profiles count: ${data?.count || 0}`);

    // Test creating a sample admin user if none exists
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);

    if (!adminCheck || adminCheck.length === 0) {
      console.log('👤 No admin user found. Creating sample admin...');
      
      // Create auth user first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@tvetkenya.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          first_name: 'System',
          last_name: 'Administrator',
          role: 'admin'
        }
      });

      if (authError) {
        console.error('❌ Error creating admin auth user:', authError);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: 'admin@tvetkenya.com',
          first_name: 'System',
          last_name: 'Administrator',
          role: 'admin',
          approved: true,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError);
        return;
      }

      console.log('✅ Sample admin user created:');
      console.log('   Email: admin@tvetkenya.com');
      console.log('   Password: admin123');
    }

    // Create sample registrar if none exists
    const { data: registrarCheck } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'registrar')
      .limit(1);

    if (!registrarCheck || registrarCheck.length === 0) {
      console.log('👤 No registrar user found. Creating sample registrar...');
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'registrar@tvetkenya.com',
        password: 'registrar123',
        email_confirm: true,
        user_metadata: {
          first_name: 'Academic',
          last_name: 'Registrar',
          role: 'registrar'
        }
      });

      if (authError) {
        console.error('❌ Error creating registrar auth user:', authError);
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: 'registrar@tvetkenya.com',
          first_name: 'Academic',
          last_name: 'Registrar',
          role: 'registrar',
          approved: true,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('❌ Error creating registrar profile:', profileError);
        return;
      }

      console.log('✅ Sample registrar user created:');
      console.log('   Email: registrar@tvetkenya.com');
      console.log('   Password: registrar123');
    }

    console.log('');
    console.log('🎉 Supabase deployment check completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update src/main.tsx to import from supabase-main.tsx');
    console.log('2. Test login at /supabase-login');
    console.log('3. Test student creation in registrar dashboard');
    console.log('4. Run migration test suite at /migration-test-suite');

  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
}

// Check if this is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deploySchema();
}

export { deploySchema };
