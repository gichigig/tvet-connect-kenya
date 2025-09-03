import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testConnection() {
    console.log('🔄 Testing Supabase connection...');
    
    try {
        // Simple test to see if we can connect
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('❌ Connection error:', error.message);
        } else {
            console.log('✅ Connected! Profiles table has', data?.length ?? 0, 'records');
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
    
    // Also test auth admin connection
    try {
        console.log('🔄 Testing auth admin...');
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
        
        if (error) {
            console.log('❌ Auth admin error:', error.message);
        } else {
            console.log('✅ Auth admin works! Found', data?.users?.length ?? 0, 'users');
        }
    } catch (error) {
        console.log('❌ Auth admin error:', error.message);
    }
}

testConnection();
