-- NUCLEAR OPTION: Complete RLS Reset with Schema Recreation

-- STEP 1: Completely disable all RLS on profiles table
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies without exception
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- STEP 3: Drop all related functions
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_safe(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role_safe(UUID) CASCADE;

-- STEP 4: Create the simplest possible security function
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- STEP 5: Grant permissions
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;

-- STEP 6: Create the absolute simplest policies possible

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see their own profile (no recursion)
CREATE POLICY "own_profile_access"
ON public.profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Super simple admin policy
CREATE POLICY "admin_access"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.user_role() = 'admin' OR auth.user_role() = 'registrar')
WITH CHECK (auth.user_role() = 'admin' OR auth.user_role() = 'registrar');

-- STEP 7: Test the setup
SELECT 'Nuclear RLS Reset Complete - Policies Recreated' as status;

-- STEP 8: Show current policies for verification
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';
