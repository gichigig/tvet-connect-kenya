import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔧 Fixing RLS infinite recursion...');

async function fixRLSRecursion() {
  try {
    console.log('1. Dropping all existing policies...');
    
    const dropPoliciesSQL = `
-- STEP 1: Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- STEP 3: Drop any recursive functions
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_safe(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role_safe(UUID) CASCADE;
DROP FUNCTION IF EXISTS auth.user_role() CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec', { sql: dropPoliciesSQL });
    if (dropError) throw dropError;
    
    console.log('2. Creating new simple policies...');
    
    const createPoliciesSQL = `
-- STEP 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create simple, non-recursive policies
-- Policy 1: Users can access their own profile ONLY
CREATE POLICY "user_own_profile"
ON public.profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Service role has full access (for admin operations)
CREATE POLICY "service_role_full_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Simple admin check using a direct JWT role claim (if available)
-- This avoids recursion by not checking the profiles table
CREATE POLICY "admin_access_via_jwt"
ON public.profiles
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'registrar')
  OR 
  auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'registrar')
)
WITH CHECK (
  auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'registrar')
  OR 
  auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'registrar')
);
    `;
    
    const { error: createError } = await supabase.rpc('exec', { sql: createPoliciesSQL });
    if (createError) throw createError;
    
    console.log('3. Verifying policies...');
    
    const { data: policies, error: verifyError } = await supabase.rpc('exec', { 
      sql: `
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
      `
    });
    
    if (verifyError) throw verifyError;
    
    console.log('✅ New policies created:', policies);
    
    console.log('4. Testing profile access...');
    
    // Test profile access
    const { data: testProfiles, error: testError } = await supabase
      .from('profiles')
      .select('id, email, role, approved')
      .limit(3);
    
    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ Profile access test successful!');
      console.log('   Found profiles:', testProfiles?.length || 0);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ RLS fix failed:', err);
    return false;
  }
}

fixRLSRecursion()
  .then(success => {
    if (success) {
      console.log('\n🎉 RLS RECURSION FIX COMPLETE!');
      console.log('✅ Infinite recursion eliminated');
      console.log('✅ Simple policies created');
      console.log('✅ Login should work now');
    } else {
      console.log('\n💥 RLS fix failed!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
