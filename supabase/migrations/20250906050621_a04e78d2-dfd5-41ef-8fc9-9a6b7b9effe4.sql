-- Add username field to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Authenticated users can view courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated admin and registrar can manage courses" 
ON public.courses 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'registrar')
));

-- Create admin bypass function for user creation
CREATE OR REPLACE FUNCTION public.create_user_with_bypass(
  p_email TEXT,
  p_username TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT,
  p_course TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_approved BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Generate a UUID for the user
  v_user_id := gen_random_uuid();
  
  -- Insert into profiles table with elevated privileges
  INSERT INTO public.profiles (
    user_id,
    email,
    username,
    first_name,
    last_name,
    role,
    course,
    department,
    phone,
    approved,
    blocked
  ) VALUES (
    v_user_id,
    p_email,
    p_username,
    p_first_name,
    p_last_name,
    p_role,
    p_course,
    p_department,
    p_phone,
    p_approved,
    false
  );
  
  RETURN v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_with_bypass TO authenticated;

-- Update handle_new_user function to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, username, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    -- Auto-approve admin, registrar, and hod users
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'student') IN ('admin', 'registrar', 'hod') THEN true
      ELSE true  -- Changed to auto-approve all users
    END
  );
  RETURN NEW;
END;
$$;