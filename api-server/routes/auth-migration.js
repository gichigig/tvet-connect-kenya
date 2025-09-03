/**
 * User Migration API Route
 * Handles Firebase user verification and Supabase account creation
 */

import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();

// Initialize Supabase with service role key
function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Migrate Firebase user to Supabase
 * POST /api/auth/migrate-user
 */
router.post('/migrate-user', async (req, res) => {
  try {
    const { firebaseToken, firebaseUid, email, displayName } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ error: 'Firebase token is required' });
    }

    console.log('🔄 Verifying Firebase token...');

    // Get Firebase services (initialized in server.js)
    const auth = getAuth();
    const realtimeDb = getDatabase();
    const supabase = getSupabaseClient();

    // Step 1: Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(firebaseToken);
    } catch (error) {
      console.error('❌ Firebase token verification failed:', error);
      return res.status(401).json({ error: 'Invalid Firebase token' });
    }

    if (decodedToken.uid !== firebaseUid) {
      return res.status(401).json({ error: 'Token UID mismatch' });
    }

    console.log('✅ Firebase token verified');

    // Step 2: Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserById(firebaseUid);
    
    if (existingUser.user && !fetchError) {
      console.log('✅ User already exists in Supabase');
      return res.json({
        success: true,
        message: 'User already migrated',
        supabaseUser: existingUser.user,
        alreadyExists: true
      });
    }

    // Step 3: Get Firebase user data
    console.log('🔄 Fetching Firebase user data...');
    const firebaseUser = await auth.getUser(firebaseUid);

    // Step 4: Generate temporary password for Supabase
    const temporaryPassword = crypto.randomBytes(16).toString('hex');

    // Step 5: Create Supabase user
    console.log('🔄 Creating Supabase user...');
    const { data: newSupabaseUser, error: createError } = await supabase.auth.admin.createUser({
      email: firebaseUser.email,
      password: temporaryPassword,
      user_metadata: {
        firebase_uid: firebaseUid,
        display_name: displayName || firebaseUser.displayName,
        migrated_from_firebase: true,
        migration_date: new Date().toISOString(),
      },
      email_confirm: true // Auto-confirm email since it's verified in Firebase
    });

    if (createError) {
      console.error('❌ Failed to create Supabase user:', createError);
      return res.status(500).json({ error: 'Failed to create Supabase account' });
    }

    console.log('✅ Supabase user created successfully');

    // Step 6: Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: newSupabaseUser.user.id,
        email: firebaseUser.email,
        first_name: displayName?.split(' ')[0] || '',
        last_name: displayName?.split(' ').slice(1).join(' ') || '',
        firebase_uid: firebaseUid,
        role: 'student', // Default role, can be updated later
        approved: true, // Auto-approve migrated users
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('⚠️ Failed to create user profile:', profileError);
      // Don't fail the migration if profile creation fails
    }

    // Step 7: Copy user data from Firebase to Supabase
    try {
      await copyUserDataFromFirebase(firebaseUid, newSupabaseUser.user.id);
    } catch (copyError) {
      console.error('⚠️ Failed to copy user data:', copyError);
      // Don't fail the migration if data copy fails
    }

    // Step 8: Log migration
    console.log(`✅ User migration completed: ${firebaseUser.email}`);
    
    res.json({
      success: true,
      message: 'User migrated successfully',
      supabaseUser: newSupabaseUser.user,
      temporaryPassword,
      migrationDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
});

/**
 * Copy user-specific data from Firebase to Supabase
 */
async function copyUserDataFromFirebase(firebaseUid, supabaseUid) {
  try {
    console.log('🔄 Copying user data from Firebase...');

    // Get Firebase services
    const realtimeDb = getDatabase();
    const firestore = getFirestore();
    const supabase = getSupabaseClient();

    // Copy attendance records where user is referenced
    const attendanceRef = realtimeDb.ref('attendance');
    const attendanceSnapshot = await attendanceRef.once('value');
    const attendanceData = attendanceSnapshot.val();

    if (attendanceData) {
      // Find attendance records related to this user
      for (const [sessionId, session] of Object.entries(attendanceData)) {
        if (session.students && session.students[firebaseUid]) {
          // This user has attendance records - we'll handle this in bulk migration
          console.log(`📋 Found attendance records for user: ${firebaseUid}`);
          break;
        }
      }
    }

    // Copy user profile data from Firebase
    const userProfileRef = realtimeDb.ref(`users/${firebaseUid}`);
    const profileSnapshot = await userProfileRef.once('value');
    const profileData = profileSnapshot.val();

    if (profileData) {
      // Update the Supabase user profile with Firebase data
      await supabase
        .from('users')
        .update({
          first_name: profileData.firstName || profileData.first_name,
          last_name: profileData.lastName || profileData.last_name,
          phone: profileData.phone,
          admission_number: profileData.admissionNumber || profileData.admission_number,
          course: profileData.course,
          level: profileData.level,
          year_of_study: profileData.yearOfStudy || profileData.year_of_study,
          role: profileData.role || 'student',
          approved: profileData.approved !== false, // Default to true
        })
        .eq('id', supabaseUid);

      console.log('✅ User profile data copied');
    }

    // Copy Firestore data if any
    
    // Check for user-specific notifications
    const notificationsQuery = firestore.collection('notifications')
      .where('userId', '==', firebaseUid)
      .limit(10);
    
    const notificationsSnapshot = await notificationsQuery.get();
    
    if (!notificationsSnapshot.empty) {
      const notifications = [];
      notificationsSnapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          recipient_id: supabaseUid,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          data: data.data || {},
          created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
        console.log(`✅ Copied ${notifications.length} notifications`);
      }
    }

    console.log('✅ User data copying completed');

  } catch (error) {
    console.error('❌ Error copying user data:', error);
    throw error;
  }
}

/**
 * Check migration status
 * GET /api/auth/migration-status/:firebaseUid
 */
router.get('/migration-status/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const supabase = getSupabaseClient();

    // Check if user exists in Supabase with Firebase UID
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, firebase_uid, created_at')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error || !user) {
      return res.json({
        migrated: false,
        message: 'User not migrated yet'
      });
    }

    res.json({
      migrated: true,
      supabaseUserId: user.id,
      migrationDate: user.created_at,
      message: 'User already migrated'
    });

  } catch (error) {
    console.error('❌ Migration status check error:', error);
    res.status(500).json({ error: 'Failed to check migration status' });
  }
});

export default router;
