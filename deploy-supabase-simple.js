import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

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
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ympnvccreuhxouyovszg');
      console.log('2. Click on "SQL Editor"');
      console.log('3. Copy and paste the schema from supabase-schema.sql');
      console.log('4. Run the SQL commands');
      return;
    }

    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      return;
    }

    console.log('✅ Connected to Supabase successfully');
    console.log(`📊 Current profiles count: ${data?.length || 0}`);

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
        console.error('❌ Error creating admin auth user:', authError.message);
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
        console.error('❌ Error creating admin profile:', profileError.message);
        return;
      }

      console.log('✅ Sample admin user created:');
      console.log('   Email: admin@tvetkenya.com');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
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
        console.error('❌ Error creating registrar auth user:', authError.message);
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
        console.error('❌ Error creating registrar profile:', profileError.message);
        return;
      }

      console.log('✅ Sample registrar user created:');
      console.log('   Email: registrar@tvetkenya.com');
      console.log('   Password: registrar123');
    } else {
      console.log('✅ Registrar user already exists');
    }

    console.log('');
    console.log('🎉 Supabase deployment check completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Switch main.tsx to use Supabase');
    console.log('2. Test login at /supabase-login');
    console.log('3. Test student creation in registrar dashboard');
    console.log('4. Run migration test suite at /migration-test-suite');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
  }
}

deploySchema();
