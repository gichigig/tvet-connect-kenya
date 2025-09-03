import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env file');
    process.exit(1);
}

// Create Supabase admin client (can create users)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    console.log('🔐 Creating admin user in Supabase...');
    
    const adminEmail = 'billyblund17@gmail.com';
    const adminPassword = 'bildad';
    
    try {
        // Step 1: Create user in auth.users table using admin API
        console.log('📝 Step 1: Creating user in auth.users...');
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                role: 'admin',
                first_name: 'System',
                last_name: 'Administrator'
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️  User already exists in auth.users, continuing with profile creation...');
                
                // Get existing user
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = existingUsers.users.find(u => u.email === adminEmail);
                
                if (existingUser) {
                    console.log('✅ Found existing user:', existingUser.id);
                    await createUserProfile(existingUser.id, adminEmail);
                }
            } else {
                throw authError;
            }
        } else {
            console.log('✅ User created in auth.users:', authData.user.id);
            console.log('📧 Email:', authData.user.email);
            console.log('🆔 User ID:', authData.user.id);
            
            // Step 2: Create user profile
            await createUserProfile(authData.user.id, adminEmail);
        }

        console.log('');
        console.log('🎉 Admin user creation complete!');
        console.log('');
        console.log('📊 You can now check:');
        console.log('1. Supabase Users Dashboard: https://supabase.com/dashboard/project/ympnvccreuhxouyovszg/auth/users');
        console.log('2. Login at: http://localhost:5176/supabase-login');
        console.log('');
        console.log('🔑 Admin Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Role: admin`);

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error('Full error:', error);
    }
}

async function createUserProfile(userId, email) {
    console.log('👤 Step 2: Creating user profile...');
    
    try {
        // First, let's check what columns actually exist in the profiles table
        console.log('🔍 Checking profiles table structure...');
        
        // Check if profile already exists
        const { data: existingProfile, error: selectError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking existing profile:', selectError);
            throw selectError;
        }

        if (existingProfile) {
            console.log('⚠️  Profile already exists, updating...');
            
            // Only update fields we know exist
            const updateData = {
                role: 'admin',
                approved: true,
                first_name: 'System',
                last_name: 'Administrator'
            };

            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (updateError) throw updateError;
            console.log('✅ Profile updated successfully');
        } else {
            console.log('📝 Creating new profile...');
            
            // Create profile with only essential fields first
            const profileData = {
                id: userId,
                email: email,
                first_name: 'System',
                last_name: 'Administrator',
                role: 'admin',
                approved: true
            };

            console.log('📋 Profile data to insert:', profileData);

            const { data: createdProfile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert(profileData)
                .select('*')
                .single();

            if (profileError) {
                console.error('❌ Profile creation error details:', profileError);
                if (profileError.code === '23505') { // Unique constraint violation
                    console.log('⚠️  Profile already exists with different ID, skipping...');
                } else if (profileError.code === 'PGRST204') {
                    console.log('⚠️  Column not found error. Let me try with minimal data...');
                    
                    // Try with absolute minimal data
                    const minimalData = {
                        id: userId,
                        email: email,
                        role: 'admin'
                    };

                    const { error: minimalError } = await supabaseAdmin
                        .from('profiles')
                        .insert(minimalData);

                    if (minimalError) {
                        throw minimalError;
                    }
                    console.log('✅ Profile created with minimal data');
                } else {
                    throw profileError;
                }
            } else {
                console.log('✅ Profile created successfully:', createdProfile);
            }
        }
    } catch (error) {
        console.error('❌ Error in profile creation:', error.message);
        console.error('Full error object:', error);
        
        // Don't throw the error - let's continue and let the automatic profile creation in login handle it
        console.log('⚠️  Will rely on automatic profile creation during login');
    }
}

// Also create the profiles table if it doesn't exist
async function ensureProfilesTable() {
    console.log('🏗️  Ensuring profiles table exists...');
    
    try {
        // Test if table exists by querying it
        const { error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .limit(1);

        if (error && error.code === '42P01') {
            console.log('📋 Creating profiles table...');
            
            const createTableSQL = `
                -- Create profiles table
                CREATE TABLE IF NOT EXISTS profiles (
                    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                    email TEXT UNIQUE NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    role TEXT CHECK (role IN ('student', 'lecturer', 'admin', 'hod', 'registrar', 'finance')) NOT NULL,
                    phone_number TEXT,
                    username TEXT UNIQUE,
                    approved BOOLEAN DEFAULT false,
                    admission_number TEXT UNIQUE,
                    course TEXT,
                    department TEXT,
                    level TEXT CHECK (level IN ('certificate', 'diploma', 'degree')),
                    year INTEGER,
                    semester INTEGER,
                    academic_year TEXT,
                    enrollment_type TEXT CHECK (enrollment_type IN ('fulltime', 'parttime', 'online')),
                    institution_branch TEXT,
                    date_of_birth DATE,
                    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
                    national_id TEXT,
                    address TEXT,
                    guardian_name TEXT,
                    guardian_phone TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    last_login_at TIMESTAMP WITH TIME ZONE,
                    created_by_registrar BOOLEAN DEFAULT false
                );

                -- Enable RLS
                ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

                -- Create RLS policies
                CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
                CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
                CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
                );
                CREATE POLICY IF NOT EXISTS "Admins can insert profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
                );
                CREATE POLICY IF NOT EXISTS "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
                );
            `;

            const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { 
                sql: createTableSQL 
            });

            if (sqlError) {
                console.log('⚠️  Could not create table via RPC, you may need to run the SQL manually');
                console.log('Go to Supabase SQL Editor and run the schema creation SQL');
            } else {
                console.log('✅ Profiles table created');
            }
        } else {
            console.log('✅ Profiles table already exists');
        }
    } catch (error) {
        console.log('⚠️  Could not verify table existence:', error.message);
        console.log('Continuing with user creation...');
    }
}

async function main() {
    console.log('🚀 Starting admin user creation process...');
    console.log('');
    
    await ensureProfilesTable();
    await createAdminUser();
}

main().catch(console.error);
