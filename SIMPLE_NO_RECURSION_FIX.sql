-- FINAL SOLUTION: Simple RLS without recursive functions

-- STEP 1: Completely disable RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- STEP 3: Drop all functions
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_safe(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role_safe(UUID) CASCADE;
DROP FUNCTION IF EXISTS auth.user_role() CASCADE;

-- STEP 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create simple policies WITHOUT any functions (no recursion possible)

-- Policy 1: Users can access their own profile
CREATE POLICY "user_own_profile"
ON public.profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Allow service role full access (for admin operations)
CREATE POLICY "service_role_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- STEP 6: Create a separate table for admin roles (avoids recursion)
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Simple policy for admin_roles
CREATE POLICY "admin_roles_access"
ON public.admin_roles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role access for admin_roles
CREATE POLICY "admin_roles_service_access"
ON public.admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- STEP 7: Insert admin role for your user
INSERT INTO public.admin_roles (user_id, role) 
VALUES ('9ab48cea-8477-40b2-8634-85e4b8ca23e0', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- STEP 8: Verification
SELECT 'Simple RLS Setup Complete - No Recursion Possible' as status;

-- Show current policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE (tablename = 'profiles' OR tablename = 'admin_roles') AND schemaname = 'public';
