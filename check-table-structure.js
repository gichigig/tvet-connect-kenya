import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
    console.log('🔍 Checking profiles table structure...');
    
    try {
        // Try to get any existing record to see the structure
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Table does not exist');
                console.log('Creating profiles table...');
                
                // Create the table using SQL
                const createTableSQL = `
                CREATE TABLE IF NOT EXISTS public.profiles (
                    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                    email TEXT UNIQUE NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    role TEXT CHECK (role IN ('student', 'lecturer', 'admin', 'hod', 'registrar', 'finance')) NOT NULL DEFAULT 'student',
                    phone_number TEXT,
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
                ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

                -- Create RLS policies
                CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
                CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
                CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (
                    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
                );
                CREATE POLICY IF NOT EXISTS "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (
                    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar')) OR 
                    auth.uid() = id
                );
                CREATE POLICY IF NOT EXISTS "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (
                    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
                );
                `;

                const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
                    sql: createTableSQL
                });

                if (createError) {
                    console.log('❌ Could not create table:', createError);
                    console.log('Please run this SQL manually in your Supabase SQL Editor:');
                    console.log(createTableSQL);
                } else {
                    console.log('✅ Table created successfully');
                }
            } else {
                console.log('❌ Error accessing table:', error);
            }
        } else {
            console.log('✅ Table exists and is accessible');
            console.log('📊 Sample data structure:');
            if (data && data.length > 0) {
                console.log('Columns found:', Object.keys(data[0]));
            } else {
                console.log('No data in table yet');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTableStructure();
