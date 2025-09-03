/**
 * Bulk Migration Script
 * Migrates all Firebase users to Supabase in batches
 */

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BATCH_SIZE = 50;
const migrationLog = [];

async function bulkMigrateUsers() {
  console.log('🚀 Starting bulk user migration from Firebase to Supabase...');
  
  let totalMigrated = 0;
  let totalFailed = 0;
  let nextPageToken;

  try {
    // First, ensure Supabase schema is ready
    await ensureSupabaseSchema();

    do {
      console.log(`\n📦 Processing batch of ${BATCH_SIZE} users...`);
      
      const listUsersResult = await admin.auth().listUsers(BATCH_SIZE, nextPageToken);
      const users = listUsersResult.users;
      
      if (users.length === 0) {
        console.log('✅ No more users to process');
        break;
      }

      console.log(`📋 Found ${users.length} users in this batch`);

      // Process users in parallel (but with rate limiting)
      const migrationPromises = users.map(user => migrateUser(user));
      const results = await Promise.allSettled(migrationPromises);

      // Process results
      results.forEach((result, index) => {
        const user = users[index];
        if (result.status === 'fulfilled' && result.value.success) {
          totalMigrated++;
          console.log(`✅ ${user.email}: Migrated successfully`);
          migrationLog.push({
            email: user.email,
            firebaseUid: user.uid,
            supabaseUid: result.value.supabaseUid,
            status: 'success',
            timestamp: new Date().toISOString()
          });
        } else {
          totalFailed++;
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          console.log(`❌ ${user.email}: Migration failed - ${error}`);
          migrationLog.push({
            email: user.email,
            firebaseUid: user.uid,
            status: 'failed',
            error: error,
            timestamp: new Date().toISOString()
          });
        }
      });

      nextPageToken = listUsersResult.pageToken;
      
      console.log(`📊 Batch complete: ${totalMigrated} migrated, ${totalFailed} failed`);
      
      // Small delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } while (nextPageToken);

    // Final report
    console.log('\n🎉 Bulk migration completed!');
    console.log(`📊 Final statistics:`);
    console.log(`   ✅ Successfully migrated: ${totalMigrated}`);
    console.log(`   ❌ Failed migrations: ${totalFailed}`);
    console.log(`   📱 Total processed: ${totalMigrated + totalFailed}`);

    // Save migration log
    await saveMigrationLog();

    // Migrate data
    console.log('\n🔄 Starting data migration...');
    await migrateFirebaseData();

    console.log('\n✅ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Bulk migration failed:', error);
    process.exit(1);
  }
}

async function migrateUser(firebaseUser) {
  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUser.uid)
      .single();

    if (existingUser && !fetchError) {
      return {
        success: true,
        supabaseUid: existingUser.id,
        message: 'User already migrated'
      };
    }

    // Generate temporary password
    const temporaryPassword = crypto.randomBytes(16).toString('hex');

    // Create Supabase auth user
    const { data: supabaseUser, error: createError } = await supabase.auth.admin.createUser({
      email: firebaseUser.email,
      password: temporaryPassword,
      user_metadata: {
        firebase_uid: firebaseUser.uid,
        display_name: firebaseUser.displayName,
        migrated_from_firebase: true,
        migration_date: new Date().toISOString(),
      },
      email_confirm: true
    });

    if (createError) {
      throw createError;
    }

    // Get Firebase user profile data
    const realtimeDb = admin.database();
    const userProfileRef = realtimeDb.ref(`users/${firebaseUser.uid}`);
    const profileSnapshot = await userProfileRef.once('value');
    const profileData = profileSnapshot.val();

    // Create user profile in Supabase
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: supabaseUser.user.id,
        email: firebaseUser.email,
        first_name: profileData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
        last_name: profileData?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        firebase_uid: firebaseUser.uid,
        phone: profileData?.phone,
        admission_number: profileData?.admissionNumber,
        employee_id: profileData?.employeeId,
        course: profileData?.course,
        department: profileData?.department,
        level: profileData?.level,
        year_of_study: profileData?.yearOfStudy,
        role: profileData?.role || 'student',
        approved: profileData?.approved !== false,
        blocked: profileData?.blocked === true,
        is_active: !firebaseUser.disabled,
        created_at: firebaseUser.metadata.creationTime,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn(`⚠️ Profile creation failed for ${firebaseUser.email}:`, profileError.message);
    }

    // Copy notifications
    await copyUserNotifications(firebaseUser.uid, supabaseUser.user.id);

    return {
      success: true,
      supabaseUid: supabaseUser.user.id,
      temporaryPassword
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function copyUserNotifications(firebaseUid, supabaseUid) {
  try {
    const firestore = admin.firestore();
    const notificationsQuery = firestore.collection('notifications')
      .where('userId', '==', firebaseUid)
      .limit(100);
    
    const snapshot = await notificationsQuery.get();
    
    if (snapshot.empty) return;

    const notifications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        recipient_id: supabaseUid,
        sender_id: data.senderId || null,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        data: data.data || {},
        read_at: data.readAt ? data.readAt.toDate().toISOString() : null,
        created_at: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      });
    });

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      console.log(`📧 Copied ${notifications.length} notifications for user`);
    }

  } catch (error) {
    console.warn('⚠️ Failed to copy notifications:', error.message);
  }
}

async function migrateFirebaseData() {
  console.log('🔄 Migrating Firebase Realtime Database data...');

  const realtimeDb = admin.database();

  // Migrate attendance data
  console.log('📊 Migrating attendance sessions...');
  const attendanceRef = realtimeDb.ref('attendance');
  const attendanceSnapshot = await attendanceRef.once('value');
  const attendanceData = attendanceSnapshot.val();

  if (attendanceData) {
    const attendanceSessions = [];
    const studentAttendance = [];

    for (const [sessionId, session] of Object.entries(attendanceData)) {
      // Create attendance session
      const sessionRecord = {
        unit_id: session.unitId || generateUnitId(session.unitName),
        lecturer_id: await getSupabaseUserId(session.lecturerId),
        session_date: session.date || new Date().toISOString().split('T')[0],
        session_time: session.time,
        location: session.location,
        total_students: Object.keys(session.students || {}).length,
        present_students: Object.values(session.students || {}).filter(s => s.present).length,
        status: session.status || 'closed',
        created_at: session.createdAt || new Date().toISOString()
      };

      sessionRecord.attendance_rate = sessionRecord.total_students > 0 
        ? (sessionRecord.present_students / sessionRecord.total_students) * 100 
        : 0;

      attendanceSessions.push(sessionRecord);

      // Create individual student attendance records
      if (session.students) {
        for (const [studentFirebaseUid, attendance] of Object.entries(session.students)) {
          const supabaseUid = await getSupabaseUserId(studentFirebaseUid);
          if (supabaseUid) {
            studentAttendance.push({
              attendance_session_id: sessionId,
              student_id: supabaseUid,
              present: attendance.present,
              marked_at: attendance.markedAt || new Date().toISOString()
            });
          }
        }
      }
    }

    // Insert attendance sessions
    if (attendanceSessions.length > 0) {
      const { error } = await supabase.from('attendance_sessions').insert(attendanceSessions);
      if (error) {
        console.error('❌ Failed to migrate attendance sessions:', error);
      } else {
        console.log(`✅ Migrated ${attendanceSessions.length} attendance sessions`);
      }
    }

    // Insert student attendance
    if (studentAttendance.length > 0) {
      const { error } = await supabase.from('student_attendance').insert(studentAttendance);
      if (error) {
        console.error('❌ Failed to migrate student attendance:', error);
      } else {
        console.log(`✅ Migrated ${studentAttendance.length} student attendance records`);
      }
    }
  }

  console.log('✅ Firebase data migration completed');
}

async function getSupabaseUserId(firebaseUid) {
  if (!firebaseUid) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  return data?.id || null;
}

function generateUnitId(unitName) {
  // Simple unit ID generation - you might want to improve this
  return unitName?.toLowerCase().replace(/\s+/g, '-') || 'unknown-unit';
}

async function ensureSupabaseSchema() {
  console.log('🔍 Checking Supabase schema...');
  
  // Check if users table exists
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (error) {
    console.error('❌ Supabase schema not ready:', error.message);
    console.log('Please run the schema deployment first: node scripts/deploy-schema.js');
    process.exit(1);
  }

  console.log('✅ Supabase schema is ready');
}

async function saveMigrationLog() {
  try {
    const fs = await import('fs/promises');
    const logFile = `migration-log-${Date.now()}.json`;
    await fs.writeFile(logFile, JSON.stringify(migrationLog, null, 2));
    console.log(`📝 Migration log saved to: ${logFile}`);
  } catch (error) {
    console.error('⚠️ Failed to save migration log:', error);
  }
}

// Run the migration
bulkMigrateUsers().catch(console.error);
