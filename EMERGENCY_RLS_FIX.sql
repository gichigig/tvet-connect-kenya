-- EMERGENCY RLS FIX - Run this in Supabase SQL Editor
-- This will disable RLS for profiles table temporarily for development

-- Step 1: Disable RLS to stop infinite recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify the fix worked
SELECT 'RLS disabled for profiles table' as status;

-- Step 3: Show table info to confirm
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';
