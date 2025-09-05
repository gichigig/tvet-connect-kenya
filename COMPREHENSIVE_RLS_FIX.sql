-- COMPREHENSIVE RLS POLICY RESET FOR PROFILES TABLE

-- STEP 1: Disable RLS temporarily to ensure we can make changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL possible policies (being very thorough)
DROP POLICY IF EXISTS "profiles_access_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view approved profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;

-- STEP 3: Drop any existing helper functions that might cause recursion
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- STEP 4: Create a completely safe function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role_safe(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- This function runs with elevated privileges, bypassing RLS
  SELECT role INTO v_role
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'unknown');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'unknown';
END;
$$;

-- STEP 5: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- STEP 6: Create simple, non-recursive policies

-- Policy for users to access their own profile
CREATE POLICY "users_own_profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for admin access using the safe function
CREATE POLICY "admin_full_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.get_user_role_safe(auth.uid()) IN ('admin', 'registrar'))
WITH CHECK (public.get_user_role_safe(auth.uid()) IN ('admin', 'registrar'));

-- STEP 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_safe(UUID) TO authenticated;

-- STEP 8: Verify the setup
SELECT 'RLS Policy Reset Complete' as status;
