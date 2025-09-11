-- Add username column to profiles table if it doesn't exist
-- This migration ensures the username column is available for username/email login

-- Add username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
        
        -- Create index for faster username lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
        
        -- Update existing users to have username based on email prefix (temporary)
        UPDATE public.profiles 
        SET username = split_part(email, '@', 1) 
        WHERE username IS NULL;
        
        RAISE NOTICE 'Username column added successfully';
    ELSE
        RAISE NOTICE 'Username column already exists';
    END IF;
END $$;

-- Ensure username is unique and not null for new records
-- (existing records may have null usernames until manually updated)
