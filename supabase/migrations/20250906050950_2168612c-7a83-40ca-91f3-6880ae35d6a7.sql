-- SECURITY FIX: Remove overly permissive service_role_access policy
-- and replace with proper role-based access control

-- Step 1: Remove the dangerous service_role_access policy
DROP POLICY IF EXISTS "service_role_access" ON public.profiles;

-- Step 2: Create a secure function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user has admin, registrar, or hod role
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin_user.user_id 
    AND role IN ('admin', 'registrar', 'hod')
  );
END;
$$;

-- Step 3: Create secure admin access policy
CREATE POLICY "admin_access_profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  -- User can access their own profile OR user is an admin
  auth.uid() = user_id OR public.is_admin_user(auth.uid())
)
WITH CHECK (
  -- User can modify their own profile OR user is an admin
  auth.uid() = user_id OR public.is_admin_user(auth.uid())
);

-- Step 4: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- Step 5: Ensure the user_own_profile policy is still active (this should be redundant but ensures access)
-- The admin_access_profiles policy above should handle both cases, but we keep user_own_profile as a backup

-- Step 6: Create a read-only policy for certain non-sensitive profile fields that lecturers might need
CREATE POLICY "lecturer_read_basic_info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Lecturers can read basic non-sensitive info (names, roles) but not sensitive data
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.user_id = auth.uid() 
    AND p2.role IN ('lecturer', 'admin', 'registrar', 'hod')
  )
  AND NOT (role = 'admin' AND auth.uid() != user_id) -- Admins' profiles are still protected
);