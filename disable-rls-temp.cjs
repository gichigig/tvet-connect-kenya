const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLSTemporarily() {
  console.log('🔧 Temporarily disabling RLS for development...\n');
  
  try {
    // First, let's try to create a simple policy that allows all operations
    console.log('1. Creating permissive policies for departments table...');
    
    // Note: We can't execute raw SQL directly, so we'll provide instructions
    console.log('\n📋 MANUAL STEPS NEEDED:');
    console.log('Go to your Supabase Dashboard and execute these SQL commands:');
    console.log('='.repeat(60));
    
    console.log('\n-- Remove existing problematic policies');
    console.log('DROP POLICY IF EXISTS "Enable read access for all users" ON departments;');
    console.log('DROP POLICY IF EXISTS "Enable insert for authenticated users" ON departments;'); 
    console.log('DROP POLICY IF EXISTS "Enable update for authenticated users" ON departments;');
    console.log('DROP POLICY IF EXISTS "Enable delete for authenticated users" ON departments;');
    
    console.log('\n-- Temporarily disable RLS (for development only)');
    console.log('ALTER TABLE departments DISABLE ROW LEVEL SECURITY;');
    
    console.log('\n-- OR create simple permissive policies');
    console.log('CREATE POLICY "allow_all_departments" ON departments FOR ALL USING (true);');
    
    console.log('\n⚠️  IMPORTANT: Re-enable proper RLS policies before production!');
    
    // Test if we can create without RLS issues
    console.log('\n2. Testing department creation after policy changes...');
    console.log('   (Run this script again after making the above changes)');
    
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: 'RLS Test Department',
        code: 'RLSTEST',
        description: 'Testing after RLS policy fix'
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ Still failing:', error.message);
      console.log('\n💡 Try the manual steps above in Supabase Dashboard');
    } else {
      console.log('✅ Success! Department created:', data);
      // Clean up
      await supabase.from('departments').delete().eq('id', data.id);
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('🛠️  SUPABASE RLS QUICK FIX\n');
  console.log('Problem: Infinite recursion in RLS policy for profiles table');
  console.log('Solution: Temporarily disable or simplify RLS policies\n');
  
  await disableRLSTemporarily();
  
  console.log('\n🔄 AFTER MAKING CHANGES:');
  console.log('1. Restart your Vite dev server');
  console.log('2. Clear browser cache/cookies');
  console.log('3. Try creating a department again');
  console.log('4. If still failing, check browser network tab for exact error');
}

main().catch(console.error);
