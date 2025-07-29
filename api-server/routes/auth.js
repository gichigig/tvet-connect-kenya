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
 * Verify user login credentials
 * POST /api/auth/verify
 */
router.post('/verify',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check in Firebase Realtime Database first (current auth system)
      const realtimeDb = getDatabase();
      const usersRef = realtimeDb.ref('users');
      const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
      
      let userData = null;
      let userId = null;

      if (snapshot.exists()) {
        const users = snapshot.val();
        userId = Object.keys(users)[0];
        userData = users[userId];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      } else {
        // Check in Firestore students collection
        const studentsQuery = await db.collection('students').where('email', '==', email).get();
        
        if (!studentsQuery.empty) {
          const studentDoc = studentsQuery.docs[0];
          userData = studentDoc.data();
          userId = studentDoc.id;

          // For students, you might not have password in Firestore
          // You might need to check in Realtime DB studentCredentials
          const credentialsRef = realtimeDb.ref(`studentCredentials/${userData.admissionNumber}`);
          const credSnapshot = await credentialsRef.once('value');
          
          if (credSnapshot.exists()) {
            const credentials = credSnapshot.val();
            const isValidPassword = await bcrypt.compare(password, credentials.password);
            if (!isValidPassword) {
              return res.status(401).json({ error: 'Invalid credentials' });
            }
          } else {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId, 
          email: userData.email,
          role: userData.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login verified successfully',
        user: {
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
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

export default router;
