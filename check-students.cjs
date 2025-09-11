const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting student check script...');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

console.log('✅ Supabase client created');

async function checkStudents() {
  try {
    console.log('🔍 Checking for students in profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📊 Students found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('👥 Student details:');
      data.forEach((student, i) => {
        console.log(`   ${i+1}. ${student.first_name} ${student.last_name} (${student.email}) - ${student.approved ? 'Approved' : 'Pending'}`);
      });
    } else {
      console.log('📝 No students found in database');
      
      // Let's also check for any profiles at all
      console.log('\n🔍 Checking for all profiles...');
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');
      
      if (allError) {
        console.error('❌ Error getting all profiles:', allError);
        return;
      }
      
      console.log('📊 Total profiles found:', allProfiles?.length || 0);
      if (allProfiles && allProfiles.length > 0) {
        console.log('👥 All profiles:');
        allProfiles.forEach((profile, i) => {
          console.log(`   ${i+1}. ${profile.first_name} ${profile.last_name} (${profile.email}) - Role: ${profile.role} - ${profile.approved ? 'Approved' : 'Pending'}`);
        });
      }
    }
  } catch (err) {
    console.error('💥 Exception:', err);
  }
  
  console.log('🏁 Script completed');
}

console.log('🎯 About to call checkStudents...');
checkStudents();
