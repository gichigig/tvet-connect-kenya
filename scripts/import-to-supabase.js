/**
 * Supabase Data Import Script
 * Imports data from Firebase export files to Supabase
 * Run this script after exporting data from Firebase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const exportDir = path.join(__dirname, '../firebase-export');
const importResults = {
  successful: [],
  failed: [],
  summary: {}
};

console.log('🚀 Starting Supabase data import...');

/**
 * Helper function to read JSON files
 */
async function readJsonFile(filename) {
  try {
    const filePath = path.join(exportDir, filename);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`ℹ️  File ${filename} not found, skipping...`);
      return null;
    }
    throw error;
  }
}

/**
 * Helper function to generate UUID (for cases where Firebase uses strings)
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Transform Firebase user data to Supabase format
 */
function transformUser(firebaseUser, role = 'student') {
  return {
    email: firebaseUser.email,
    first_name: firebaseUser.firstName || firebaseUser.first_name || firebaseUser.name?.split(' ')[0] || '',
    last_name: firebaseUser.lastName || firebaseUser.last_name || firebaseUser.name?.split(' ').slice(1).join(' ') || '',
    role: firebaseUser.role || role,
    admission_number: firebaseUser.admissionNumber || firebaseUser.admission_number,
    employee_id: firebaseUser.employeeId || firebaseUser.employee_id,
    course: firebaseUser.course,
    department: firebaseUser.department,
    level: firebaseUser.level,
    year_of_study: firebaseUser.yearOfStudy || firebaseUser.year_of_study,
    phone: firebaseUser.phone,
    approved: firebaseUser.approved || false,
    blocked: firebaseUser.blocked || false,
    is_active: firebaseUser.isActive !== false // Default to true unless explicitly false
  };
}

/**
 * Import users from Firebase to Supabase
 */
async function importUsers() {
  console.log('👥 Importing users...');
  
  const usersData = await readJsonFile('users-export.json');
  if (!usersData) return;
  
  const allUsers = [];
  let userCount = 0;
  
  // Process admins
  if (usersData.admins) {
    for (const [key, admin] of Object.entries(usersData.admins)) {
      allUsers.push({ ...admin, originalId: key, role: 'admin' });
    }
  }
  
  // Process students
  if (usersData.students) {
    for (const [key, student] of Object.entries(usersData.students)) {
      allUsers.push({ ...student, originalId: key, role: 'student' });
    }
  }
  
  // Process lecturers
  if (usersData.lecturers) {
    for (const [key, lecturer] of Object.entries(usersData.lecturers)) {
      allUsers.push({ ...lecturer, originalId: key, role: 'lecturer' });
    }
  }
  
  console.log(`  Found ${allUsers.length} users to import`);
  
  for (const firebaseUser of allUsers) {
    try {
      if (!firebaseUser.email) {
        console.log(`  ⚠️  Skipping user without email: ${firebaseUser.name || firebaseUser.originalId}`);
        continue;
      }
      
      // Create auth user in Supabase
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: firebaseUser.email,
        email_confirm: true,
        user_metadata: {
          first_name: firebaseUser.firstName || firebaseUser.first_name,
          last_name: firebaseUser.lastName || firebaseUser.last_name,
          role: firebaseUser.role,
          imported_from_firebase: true,
          original_firebase_id: firebaseUser.originalId
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ℹ️  User already exists: ${firebaseUser.email}`);
          continue;
        }
        throw authError;
      }
      
      // Create user profile
      const userData = transformUser(firebaseUser);
      userData.id = authUser.user.id;
      
      const { error: profileError } = await supabase
        .from('users')
        .insert(userData);
      
      if (profileError) {
        console.error(`  ❌ Profile creation failed for ${firebaseUser.email}:`, profileError.message);
        // Rollback auth user creation
        await supabase.auth.admin.deleteUser(authUser.user.id);
        importResults.failed.push({ type: 'user', email: firebaseUser.email, error: profileError.message });
      } else {
        userCount++;
        console.log(`  ✅ Imported user: ${firebaseUser.email}`);
        importResults.successful.push({ type: 'user', email: firebaseUser.email, id: authUser.user.id });
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to import user ${firebaseUser.email}:`, error.message);
      importResults.failed.push({ type: 'user', email: firebaseUser.email, error: error.message });
    }
  }
  
  console.log(`  ✅ Successfully imported ${userCount} users`);
  importResults.summary.users = userCount;
}

/**
 * Import attendance data
 */
async function importAttendance() {
  console.log('📊 Importing attendance data...');
  
  const attendanceData = await readJsonFile('attendance-export.json');
  if (!attendanceData) return;
  
  let sessionCount = 0;
  let attendanceCount = 0;
  
  // Get user email to ID mapping
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role');
  
  if (usersError) {
    console.error('❌ Failed to fetch users for attendance import:', usersError);
    return;
  }
  
  const emailToId = {};
  users.forEach(user => {
    emailToId[user.email] = user.id;
  });
  
  for (const [recordId, sessions] of Object.entries(attendanceData)) {
    for (const [sessionId, session] of Object.entries(sessions)) {
      try {
        // Find lecturer ID
        const lecturerEmail = session.lecturerEmail || 'unknown@lecturer.com';
        const lecturerId = emailToId[lecturerEmail];
        
        if (!lecturerId) {
          console.log(`  ⚠️  Lecturer not found for email: ${lecturerEmail}`);
          continue;
        }
        
        // Create or find unit
        let unitId = null;
        if (session.unitCode) {
          const { data: unit, error: unitError } = await supabase
            .from('units')
            .select('id')
            .eq('code', session.unitCode)
            .single();
          
          if (!unit && !unitError) {
            // Create unit if it doesn't exist
            const { data: newUnit, error: createUnitError } = await supabase
              .from('units')
              .insert({
                code: session.unitCode,
                name: session.unitName || session.unitCode,
                lecturer_id: lecturerId
              })
              .select()
              .single();
            
            if (!createUnitError) {
              unitId = newUnit.id;
            }
          } else {
            unitId = unit?.id;
          }
        }
        
        // Insert attendance session
        const { data: attendanceSession, error: sessionError } = await supabase
          .from('attendance_sessions')
          .insert({
            unit_id: unitId,
            lecturer_id: lecturerId,
            session_date: session.date,
            total_students: session.totalStudents || 0,
            present_students: session.presentStudents || 0,
            attendance_rate: session.attendanceRate || 0,
            fingerprint: session.fingerprint,
            notes: `Imported from Firebase. Original ID: ${sessionId}`
          })
          .select()
          .single();
        
        if (sessionError) {
          console.error(`  ❌ Failed to create attendance session:`, sessionError.message);
          continue;
        }
        
        sessionCount++;
        
        // Insert individual student attendance
        if (session.students && Array.isArray(session.students)) {
          for (const student of session.students) {
            const studentId = emailToId[student.email];
            
            if (studentId) {
              const { error: attendanceError } = await supabase
                .from('student_attendance')
                .insert({
                  attendance_session_id: attendanceSession.id,
                  student_id: studentId,
                  present: student.present || false
                });
              
              if (!attendanceError) {
                attendanceCount++;
              }
            }
          }
        }
        
        console.log(`  ✅ Imported session: ${session.unitCode} - ${session.date}`);
        
      } catch (error) {
        console.error(`  ❌ Failed to import attendance session:`, error.message);
        importResults.failed.push({ type: 'attendance', sessionId, error: error.message });
      }
    }
  }
  
  console.log(`  ✅ Successfully imported ${sessionCount} attendance sessions`);
  console.log(`  ✅ Successfully imported ${attendanceCount} individual attendance records`);
  importResults.summary.attendanceSessions = sessionCount;
  importResults.summary.attendanceRecords = attendanceCount;
}

/**
 * Import notifications
 */
async function importNotifications() {
  console.log('📢 Importing notifications...');
  
  const notificationsData = await readJsonFile('notifications-firestore-export.json');
  if (!notificationsData) return;
  
  // Get user email to ID mapping
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email');
  
  if (usersError) {
    console.error('❌ Failed to fetch users for notifications import:', usersError);
    return;
  }
  
  const emailToId = {};
  users.forEach(user => {
    emailToId[user.email] = user.id;
  });
  
  let notificationCount = 0;
  
  for (const notification of notificationsData) {
    try {
      const recipientId = emailToId[notification.recipientEmail] || null;
      const senderId = emailToId[notification.senderEmail] || null;
      
      if (!recipientId) {
        console.log(`  ⚠️  Recipient not found: ${notification.recipientEmail}`);
        continue;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          sender_id: senderId,
          title: notification.title,
          message: notification.message || notification.body,
          type: notification.type || 'info',
          data: notification.data || null,
          created_at: notification.createdAt || notification.timestamp || new Date().toISOString()
        });
      
      if (error) {
        console.error(`  ❌ Failed to import notification:`, error.message);
        importResults.failed.push({ type: 'notification', id: notification.id, error: error.message });
      } else {
        notificationCount++;
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to process notification:`, error.message);
    }
  }
  
  console.log(`  ✅ Successfully imported ${notificationCount} notifications`);
  importResults.summary.notifications = notificationCount;
}

/**
 * Import departments
 */
async function importDepartments() {
  console.log('🏢 Importing departments...');
  
  const departmentsData = await readJsonFile('departments-export.json');
  if (!departmentsData) return;
  
  let departmentCount = 0;
  
  for (const [key, department] of Object.entries(departmentsData)) {
    try {
      const { error } = await supabase
        .from('departments')
        .insert({
          name: department.name,
          code: department.code || key,
          description: department.description
        });
      
      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`  ℹ️  Department already exists: ${department.code || key}`);
        } else {
          console.error(`  ❌ Failed to import department:`, error.message);
          importResults.failed.push({ type: 'department', code: department.code || key, error: error.message });
        }
      } else {
        departmentCount++;
        console.log(`  ✅ Imported department: ${department.name}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to process department:`, error.message);
    }
  }
  
  console.log(`  ✅ Successfully imported ${departmentCount} departments`);
  importResults.summary.departments = departmentCount;
}

/**
 * Generate import report
 */
async function generateImportReport() {
  console.log('📋 Generating import report...');
  
  const report = {
    importDate: new Date().toISOString(),
    summary: importResults.summary,
    successful: importResults.successful,
    failed: importResults.failed,
    totalSuccessful: importResults.successful.length,
    totalFailed: importResults.failed.length,
    notes: [
      'Data has been imported from Firebase to Supabase',
      'Users have been created with Supabase Auth',
      'Email addresses are used as the primary identifier',
      'Row Level Security policies are in effect',
      'Verify data integrity before deploying to production'
    ]
  };
  
  await fs.writeFile(
    path.join(__dirname, '../supabase-import-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Import report generated');
}

/**
 * Main import function
 */
async function importFirebaseData() {
  try {
    console.log('📥 Firebase to Supabase Data Import Tool');
    console.log('=========================================');
    
    // Test Supabase connection
    const { error: connectionError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      throw new Error(`Supabase connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Supabase connection successful');
    
    // Import data in order (users first, then dependent data)
    await importDepartments();
    await importUsers();
    await importAttendance();
    await importNotifications();
    
    await generateImportReport();
    
    console.log('\n✅ Import completed successfully!');
    console.log(`📊 Import Summary:`);
    console.log(`   - Users: ${importResults.summary.users || 0}`);
    console.log(`   - Departments: ${importResults.summary.departments || 0}`);
    console.log(`   - Attendance Sessions: ${importResults.summary.attendanceSessions || 0}`);
    console.log(`   - Attendance Records: ${importResults.summary.attendanceRecords || 0}`);
    console.log(`   - Notifications: ${importResults.summary.notifications || 0}`);
    console.log(`   - Successful: ${importResults.successful.length}`);
    console.log(`   - Failed: ${importResults.failed.length}`);
    
    if (importResults.failed.length > 0) {
      console.log('\n⚠️  Some imports failed. Check the import report for details.');
    }
    
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Test authentication flows');
    console.log('3. Update application code to use Supabase');
    console.log('4. Run integration tests');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    await generateImportReport();
    process.exit(1);
  }
}

// Run the import
importFirebaseData();
