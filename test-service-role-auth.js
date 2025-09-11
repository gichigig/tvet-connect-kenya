import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('Testing service role authentication...');

// Test basic connection
supabase.from('profiles').select('count', { count: 'exact' })
  .then(result => {
    if (result.error) {
      console.error('Service role auth failed:', result.error);
    } else {
      console.log('Service role auth success! Profile count:', result.count);
    }
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
