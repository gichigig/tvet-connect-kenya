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

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixRLSPolicies() {
    console.log('🔒 Fixing RLS policies...');

    const sql = `
        -- First, drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
        DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
        DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

        -- Create new policies with fixed conditions
        CREATE POLICY "Users can view own profile"
        ON profiles FOR SELECT
        USING (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE user_id = auth.uid()
                AND role IN ('admin', 'registrar')
            )
        );

        CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE user_id = auth.uid()
                AND role IN ('admin', 'registrar')
            )
        );

        CREATE POLICY "Admins can insert profiles"
        ON profiles FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE user_id = auth.uid()
                AND role IN ('admin', 'registrar')
            )
        );
    `;

    try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
        
        if (error) {
            console.error('❌ Error updating policies:', error.message);
            throw error;
        }

        console.log('✅ RLS policies updated successfully!');
        console.log('\nNew policies created:');
        console.log('1. Users can view own profile');
        console.log('2. Users can update own profile');
        console.log('3. Admins can insert profiles');
        console.log('\nYou can now try logging in again.');

    } catch (error) {
        console.error('❌ Failed to update policies:', error);
        console.log('\nPlease run these SQL commands manually in the Supabase SQL editor:');
        console.log(sql);
    }
}

// Run the fix
fixRLSPolicies().catch(console.error);
