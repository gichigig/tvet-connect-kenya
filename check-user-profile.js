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

async function checkUserProfile() {
    console.log('🔍 Checking user profile for: billyblund7@gmail.com');
    
    try {
        // First check if user exists in auth
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const user = authUsers.users.find(u => u.email === 'billyblund7@gmail.com');
        
        if (!user) {
            console.log('❌ User not found in auth.users');
            return;
        }
        
        console.log('✅ User found in auth.users:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        
        // Check if profile exists
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (error) {
            console.log('❌ Profile query error:', error.message);
            
            // Let's create a profile for this user
            console.log('🔧 Creating profile for user...');
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    user_id: user.id,
                    email: user.email,
                    first_name: 'System',
                    last_name: 'Administrator',
                    role: 'admin',
                    approved: true,
                    blocked: false
                })
                .select()
                .single();
                
            if (createError) {
                console.log('❌ Error creating profile:', createError.message);
            } else {
                console.log('✅ Profile created successfully:', newProfile);
            }
            
            return;
        }
        
        if (profile) {
            console.log('✅ Profile found:');
            console.log('   User ID:', profile.user_id);
            console.log('   Email:', profile.email);
            console.log('   Name:', profile.first_name, profile.last_name);
            console.log('   Role:', profile.role);
            console.log('   Approved:', profile.approved);
            console.log('   Blocked:', profile.blocked);
        } else {
            console.log('❌ No profile found, but no error either');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUserProfile().catch(console.error);
