-- Approve all admin and registrar users
UPDATE public.profiles 
SET approved = true, blocked = false 
WHERE role IN ('admin', 'registrar', 'hod');

-- Also update the trigger to auto-approve admin users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    -- Auto-approve admin, registrar, and hod users
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'student') IN ('admin', 'registrar', 'hod') THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;