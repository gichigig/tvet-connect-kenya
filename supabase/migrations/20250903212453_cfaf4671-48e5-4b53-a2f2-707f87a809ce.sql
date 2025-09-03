-- Insert a default admin user to fix login issues
-- First, let's ensure we can create an admin user manually

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000',
    'admin@tvetconnect.com',
    crypt('admin123', gen_salt('bf')), -- You can change this password
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin","first_name":"Admin","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Insert the corresponding profile
INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    role,
    approved,
    blocked
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Admin',
    'User',
    'admin@tvetconnect.com',
    'admin',
    true,
    false
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    approved = true,
    blocked = false;