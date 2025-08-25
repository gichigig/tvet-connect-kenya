import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ...rest of your code...
// ...existing code...

/**
 * Change password (student or user)
 * POST /api/auth/change-password
 * Body: { email, oldPassword, newPassword }
 */
router.post('/change-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('oldPassword').isLength({ min: 1 }).withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, oldPassword, newPassword } = req.body;
      const realtimeDb = getDatabase();
      const db = getFirestore();
      const usersRef = realtimeDb.ref('users');
      const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
      let userData = null;
      let userId = null;
      let isStudent = false;

      if (snapshot.exists()) {
        // User found in users
        const users = snapshot.val();
        userId = Object.keys(users)[0];
        userData = users[userId];
        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, userData.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Old password is incorrect' });
        }
        // Hash new password
        const hashed = await bcrypt.hash(newPassword, 10);
        await usersRef.child(userId).update({ password: hashed });
      } else {
        // Check in Firestore students
        const db = getFirestore();
        const studentsQuery = await db.collection('students').where('email', '==', email).get();
        if (!studentsQuery.empty) {
          isStudent = true;
          const studentDoc = studentsQuery.docs[0];
          const student = studentDoc.data();
          // Check credentials in Realtime DB
          const credentialsRef = realtimeDb.ref(`studentCredentials/${student.admissionNumber}`);
          const credSnapshot = await credentialsRef.once('value');
          if (!credSnapshot.exists()) {
            return res.status(404).json({ error: 'Student credentials not found' });
          }
          const credentials = credSnapshot.val();
          const isValidPassword = await bcrypt.compare(oldPassword, credentials.password);
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Old password is incorrect' });
          }
          // Hash new password
          const hashed = await bcrypt.hash(newPassword, 10);
          await credentialsRef.update({ password: hashed });
        } else {
          return res.status(404).json({ error: 'User not found' });
        }
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// ...existing code...

/**
 * Verify user login credentials (supports email or username)
 * POST /api/auth/verify
 */
router.post('/verify',
  [
    body('identifier').isLength({ min: 1 }).withMessage('Email or username is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { identifier, password } = req.body;

      console.log('About to get database instances...');

      // Get database instances
      const realtimeDb = getDatabase();
      const db = getFirestore();
      
      let userData = null;
      let userId = null;

      // Determine if identifier is email or username
      const isEmail = identifier.includes('@');

      // First check in Realtime Database students collection
      const studentsRef = realtimeDb.ref('students');
      let studentSnapshot;
      
      if (isEmail) {
        studentSnapshot = await studentsRef.orderByChild('email').equalTo(identifier).once('value');
      } else {
        studentSnapshot = await studentsRef.orderByChild('username').equalTo(identifier).once('value');
      }
      
      if (studentSnapshot.exists()) {
        const students = studentSnapshot.val();
        userId = Object.keys(students)[0];
        userData = students[userId];

        // Check credentials in studentCredentials collection
        const credentialsRef = realtimeDb.ref(`studentCredentials/${userData.admissionNumber}`);
        const credSnapshot = await credentialsRef.once('value');
        
        if (credSnapshot.exists()) {
          const credentials = credSnapshot.val();
          const isValidPassword = await bcrypt.compare(password, credentials.password);
          if (!isValidPassword) {
            // Fallback: try plain text comparison for registrar-created students
            if (credentials.password !== password) {
              return res.status(401).json({ error: 'Invalid credentials' });
            }
          }
        } else {
          // Fallback: check password directly from student record (for registrar-created students)
          if (userData.password && userData.password === password) {
            // Plain text match found, allow login
          } else {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        }
      } else {
        // Check in Firebase Realtime Database users (for admin/staff)
        const usersRef = realtimeDb.ref('users');
        let snapshot;
        
        if (isEmail) {
          snapshot = await usersRef.orderByChild('email').equalTo(identifier).once('value');
        } else {
          snapshot = await usersRef.orderByChild('username').equalTo(identifier).once('value');
        }
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          userId = Object.keys(users)[0];
          userData = users[userId];

          // Verify password directly from user record
          const isValidPassword = await bcrypt.compare(password, userData.password);
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        } else {
          // Check in Firestore students collection as fallback
          let studentsQuery;
          if (isEmail) {
            studentsQuery = await db.collection('students').where('email', '==', identifier).get();
          } else {
            studentsQuery = await db.collection('students').where('username', '==', identifier).get();
          }
          
          if (!studentsQuery.empty) {
            const studentDoc = studentsQuery.docs[0];
            userData = studentDoc.data();
            userId = studentDoc.id;

            // For students, check credentials in Realtime DB
            const credentialsRef = realtimeDb.ref(`studentCredentials/${userData.admissionNumber}`);
            const credSnapshot = await credentialsRef.once('value');
            
            if (credSnapshot.exists()) {
              const credentials = credSnapshot.val();
              const isValidPassword = await bcrypt.compare(password, credentials.password);
              if (!isValidPassword) {
                // Fallback: try plain text comparison for registrar-created students
                if (credentials.password !== password) {
                  return res.status(401).json({ error: 'Invalid credentials' });
                }
              }
            } else {
              // No credentials found - this student may not have proper auth setup
              return res.status(401).json({ error: 'Invalid credentials' });
            }
          } else {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId, 
          email: userData.email,
          username: userData.username,
          role: 'student', // Ensure role is always 'student' for this endpoint
          admissionNumber: userData.admissionNumber 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login verified successfully',
        user: {
          id: userId,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'student', // Ensure consistent role
          admissionNumber: userData.admissionNumber,
          department: userData.department,
          course: userData.course || userData.courseName
        },
        token
      });

    } catch (error) {
      console.error('Login verification error:', error);
      res.status(500).json({ error: 'Failed to verify login' });
    }
  }
);

/**
 * Get user profile by ID or admission number
 * GET /api/auth/profile/:identifier
 */
/**
 * Student-only login for Grade Vault TVET
 * POST /api/auth/student-login
 * Body: { email, password }
 */
router.post('/student-login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const db = getFirestore();
      const realtimeDb = getDatabase();

      // 1. Find the student in Firestore by email
      const studentsQuery = await db.collection('students').where('email', '==', email).get();
      if (studentsQuery.empty) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const studentDoc = studentsQuery.docs[0];
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;

      // 2. Verify student's password from Realtime DB
      const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
      const credSnapshot = await credentialsRef.once('value');

      if (!credSnapshot.exists()) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your details.' });
      }

      const credentials = credSnapshot.val();
      const isPasswordValid = await bcrypt.compare(password, credentials.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your details.' });
      }

      // 3. Generate JWT for the authenticated student
      const token = jwt.sign(
        {
          userId: studentId,
          email: studentData.email,
          role: 'student', // Explicitly set role
          admissionNumber: studentData.admissionNumber
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // 4. Return token and student data
      res.json({
        message: 'Student login successful!',
        token,
        student: {
          id: studentId,
          email: studentData.email,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          admissionNumber: studentData.admissionNumber,
          course: studentData.courseName,
          role: 'student'
        }
      });

    } catch (error) {
      console.error('Student login error:', error);
      res.status(500).json({ error: 'An internal server error occurred during login.' });
    }
  }
);

router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let userData = null;

    // Try to find by admission number first (for students)
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', identifier).get();
    
    if (!studentsQuery.empty) {
      const studentDoc = studentsQuery.docs[0];
      userData = {
        id: studentDoc.id,
        ...studentDoc.data(),
        type: 'student'
      };
    } else {
      // Try to find by user ID in regular users
      const realtimeDb = getDatabase();
      const userRef = realtimeDb.ref(`users/${identifier}`);
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) {
        userData = {
          id: identifier,
          ...snapshot.val(),
          type: 'user'
        };
      }
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    delete userData.password;
    delete userData.hashedKey;

    res.json({ user: userData });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * Validate JWT token
 * POST /api/auth/validate
 */
router.post('/validate',
  [
    body('token').isLength({ min: 1 }).withMessage('Token is required')
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      res.json({ 
        valid: true, 
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      });

    } catch (error) {
      res.status(401).json({ 
        valid: false, 
        error: 'Invalid or expired token' 
      });
    }
  }
);

/**
 * Migrate students from users collection to students collection
 * POST /api/auth/migrate-students
 */
router.post('/migrate-students', async (req, res) => {
  try {
    const realtimeDb = getDatabase();
    const usersRef = realtimeDb.ref('users');
    const studentsRef = realtimeDb.ref('students');
    
    // Get all users
    const usersSnapshot = await usersRef.once('value');
    
    if (!usersSnapshot.exists()) {
      return res.json({ message: 'No users found to migrate' });
    }
    
    const users = usersSnapshot.val();
    const migratedStudents = [];
    const errors = [];
    
    for (const [userId, userData] of Object.entries(users)) {
      // Check if user is a student
      if (userData.role === 'student' && userData.email) {
        try {
          // Check if student already exists in students collection
          const existingStudentSnapshot = await studentsRef
            .orderByChild('email')
            .equalTo(userData.email)
            .once('value');
          
          if (!existingStudentSnapshot.exists()) {
            // Create student record in students collection
            const studentData = {
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email,
              admissionNumber: userData.admissionNumber || userData.email.split('@')[0].toUpperCase(),
              department: userData.department || '',
              course: userData.course || '',
              role: 'student',
              createdAt: userData.createdAt || new Date().toISOString(),
              isActive: userData.isActive !== false
            };
            
            // Add to students collection
            const newStudentRef = await studentsRef.push(studentData);
            
            // Move password to studentCredentials if it exists
            if (userData.password) {
              const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
              await credentialsRef.set({
                password: userData.password,
                createdAt: userData.createdAt || new Date().toISOString()
              });
            }
            
            // Remove from users collection
            await usersRef.child(userId).remove();
            
            migratedStudents.push({
              oldId: userId,
              newId: newStudentRef.key,
              email: userData.email,
              admissionNumber: studentData.admissionNumber
            });
          }
        } catch (error) {
          errors.push({
            userId,
            email: userData.email,
            error: error.message
          });
        }
      }
    }
    
    res.json({
      message: `Migration completed. ${migratedStudents.length} students migrated.`,
      migratedStudents,
      errors
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Failed to migrate students' });
  }
});

/**
 * Register a new student
 * POST /api/auth/register-student
 * Body: { firstName, lastName, email, admissionNumber, department, course, password }
 */
router.post('/register-student',
  [
    body('firstName').isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').isLength({ min: 1 }).withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('admissionNumber').isLength({ min: 1 }).withMessage('Admission number is required'),
    body('department').isLength({ min: 1 }).withMessage('Department is required'),
    body('course').isLength({ min: 1 }).withMessage('Course is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, admissionNumber, department, course, password } = req.body;
      const realtimeDb = getDatabase();

      // Check if student already exists
      const studentsRef = realtimeDb.ref('students');
      const emailSnapshot = await studentsRef.orderByChild('email').equalTo(email).once('value');
      const admissionSnapshot = await studentsRef.orderByChild('admissionNumber').equalTo(admissionNumber).once('value');

      if (emailSnapshot.exists()) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      if (admissionSnapshot.exists()) {
        return res.status(400).json({ error: 'Admission number already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create student record in Realtime Database
      const studentData = {
        firstName,
        lastName,
        email,
        admissionNumber,
        department,
        course,
        role: 'student',
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Save to students collection
      const newStudentRef = await studentsRef.push(studentData);

      // Save credentials separately
      const credentialsRef = realtimeDb.ref(`studentCredentials/${admissionNumber}`);
      await credentialsRef.set({
        password: hashedPassword,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({
        message: 'Student registered successfully',
        student: {
          id: newStudentRef.key,
          ...studentData
        }
      });

    } catch (error) {
      console.error('Student registration error:', error);
      res.status(500).json({ error: 'Failed to register student' });
    }
  }
);

export default router;
