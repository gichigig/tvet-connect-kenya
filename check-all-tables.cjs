const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All 91 tables that should exist in the TVET Connect Kenya system
const expectedTables = [
  // Core Authentication & User Management (5 tables)
  'profiles',
  'roles', 
  'user_roles',
  'permissions',
  'role_permissions',

  // Institution Management (4 tables)
  'institutions',
  'institution_branches',
  'departments',
  'department_heads',

  // Academic Structure (9 tables)
  'courses',
  'units',
  'course_units',
  'unit_prerequisites',
  'academic_years',
  'semesters',
  'intake_periods',
  'curriculum_versions',
  'course_approvals',

  // Student Management (6 tables)
  'students',
  'student_enrollments',
  'student_unit_registrations',
  'student_transfers',
  'student_graduations',
  'student_suspensions',

  // Lecturer Management (5 tables)
  'lecturers',
  'lecturer_qualifications',
  'lecturer_specializations',
  'unit_assignments',
  'lecturer_schedules',

  // Unit & Course Administration (3 tables)
  'unit_allocations',
  'unit_approvals',
  'academic_calendar',

  // Finance Management (8 tables)
  'fee_structures',
  'student_fees',
  'fee_payments',
  'fee_waivers',
  'payment_methods',
  'financial_aid',
  'budget_allocations',
  'expenditures',

  // Examination System (8 tables)
  'exams',
  'exam_schedules',
  'student_exam_registrations',
  'exam_results',
  'grade_scales',
  'transcripts',
  'certificates',
  'final_grades',

  // Assessment & Grading (5 tables)
  'assignments',
  'assignment_submissions',
  'grades',
  'continuous_assessments',
  'semester_plans',

  // Attendance & Scheduling (5 tables)
  'class_schedules',
  'attendance_records',
  'lecturer_attendance',
  'makeup_classes',
  'timetables',

  // Communication & Notifications (5 tables)
  'announcements',
  'notifications',
  'messages',
  'email_logs',
  'sms_logs',

  // Registration & Admissions (5 tables)
  'applications',
  'admission_requirements',
  'application_documents',
  'admission_decisions',
  'waiting_lists',

  // Academic Progress Tracking (5 tables)
  'academic_progress',
  'graduation_requirements',
  'credit_transfers',
  'academic_standings',
  'retakes',

  // Library & Resources (4 tables)
  'library_books',
  'book_borrowings',
  'library_fines',
  'digital_resources',

  // Accommodation (4 tables)
  'hostels',
  'rooms',
  'room_allocations',
  'hostel_fees',

  // Transport (3 tables)
  'transport_routes',
  'transport_bookings',
  'transport_fees',

  // System Administration (5 tables)
  'system_settings',
  'audit_logs',
  'backup_logs',
  'error_logs',
  'session_logs',

  // Reporting & Analytics (4 tables)
  'reports',
  'report_schedules',
  'dashboard_widgets',
  'analytics_data'
];

async function checkAllTables() {
  console.log('🔍 Checking all 91 expected tables in Supabase database...\n');
  
  const results = {
    existing: [],
    missing: [],
    errors: []
  };

  console.log('📊 Progress:');
  let checkedCount = 0;
  
  for (const tableName of expectedTables) {
    try {
      checkedCount++;
      process.stdout.write(`\rChecking ${checkedCount}/${expectedTables.length} tables...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          results.missing.push(tableName);
        } else {
          results.errors.push({ table: tableName, error: error.message });
        }
      } else {
        results.existing.push({
          table: tableName,
          hasData: data && data.length > 0,
          recordCount: data ? data.length : 0
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (err) {
      results.errors.push({ table: tableName, error: err.message });
    }
  }
  
  console.log('\n\n📋 TABLE AUDIT RESULTS\n' + '='.repeat(50));
  
  // Existing Tables
  console.log(`\n✅ EXISTING TABLES (${results.existing.length}/${expectedTables.length}):`);
  if (results.existing.length > 0) {
    results.existing.forEach((item, index) => {
      const dataStatus = item.hasData ? '📊 Has Data' : '📭 Empty';
      console.log(`${index + 1}. ${item.table} - ${dataStatus}`);
    });
  } else {
    console.log('   None found');
  }
  
  // Missing Tables
  console.log(`\n❌ MISSING TABLES (${results.missing.length}/${expectedTables.length}):`);
  if (results.missing.length > 0) {
    results.missing.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });
  } else {
    console.log('   All tables exist!');
  }
  
  // Error Tables
  if (results.errors.length > 0) {
    console.log(`\n⚠️  TABLES WITH ERRORS (${results.errors.length}):`);
    results.errors.forEach((item, index) => {
      console.log(`${index + 1}. ${item.table} - ${item.error}`);
    });
  }
  
  // Summary by Category
  console.log('\n📊 SUMMARY BY CATEGORY:');
  console.log('='.repeat(30));
  
  const categories = {
    'Core Auth & Users': ['profiles', 'roles', 'user_roles', 'permissions', 'role_permissions'],
    'Institution Mgmt': ['institutions', 'institution_branches', 'departments', 'department_heads'],
    'Academic Structure': ['courses', 'units', 'course_units', 'unit_prerequisites', 'academic_years', 'semesters', 'intake_periods', 'curriculum_versions', 'course_approvals'],
    'Student Management': ['students', 'student_enrollments', 'student_unit_registrations', 'student_transfers', 'student_graduations', 'student_suspensions'],
    'Lecturer Management': ['lecturers', 'lecturer_qualifications', 'lecturer_specializations', 'unit_assignments', 'lecturer_schedules'],
    'Finance': ['fee_structures', 'student_fees', 'fee_payments', 'fee_waivers', 'payment_methods', 'financial_aid', 'budget_allocations', 'expenditures'],
    'Examinations': ['exams', 'exam_schedules', 'student_exam_registrations', 'exam_results', 'grade_scales', 'transcripts', 'certificates', 'final_grades'],
    'Assessment & Grading': ['assignments', 'assignment_submissions', 'grades', 'continuous_assessments', 'semester_plans'],
    'Communications': ['announcements', 'notifications', 'messages', 'email_logs', 'sms_logs'],
    'System Admin': ['system_settings', 'audit_logs', 'backup_logs', 'error_logs', 'session_logs']
  };
  
  for (const [category, tables] of Object.entries(categories)) {
    const existing = tables.filter(t => results.existing.some(e => e.table === t)).length;
    const total = tables.length;
    const percentage = Math.round((existing / total) * 100);
    console.log(`${category}: ${existing}/${total} (${percentage}%)`);
  }
  
  // Overall Statistics
  console.log('\n🎯 OVERALL STATISTICS:');
  console.log('='.repeat(25));
  console.log(`Total Expected: ${expectedTables.length}`);
  console.log(`Tables Found: ${results.existing.length}`);
  console.log(`Tables Missing: ${results.missing.length}`);
  console.log(`Completion: ${Math.round((results.existing.length / expectedTables.length) * 100)}%`);
  
  if (results.existing.length > 0) {
    const tablesWithData = results.existing.filter(t => t.hasData).length;
    console.log(`Tables with Data: ${tablesWithData}/${results.existing.length}`);
  }
  
  console.log('\n🏁 Audit Complete!');
}

checkAllTables().catch(console.error);
