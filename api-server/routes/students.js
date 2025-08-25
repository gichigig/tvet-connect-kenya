import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { requirePermission } from '../middleware/auth.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Get all students
 * GET /api/students
 */
router.get('/', 
  requirePermission('students:read'),
  [
    query('department').optional().isString(),
    query('course').optional().isString(),
    query('year').optional().isInt(),
    query('semester').optional().isInt(),
    query('status').optional().isIn(['active', 'inactive', 'suspended']),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('pageToken').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const db = getFirestore();
      let studentsQuery = db.collection('students');

      // Apply filters
      if (req.query.department) {
        studentsQuery = studentsQuery.where('department', '==', req.query.department);
      }
      if (req.query.course) {
        studentsQuery = studentsQuery.where('course', '==', req.query.course);
      }
      if (req.query.year) {
        studentsQuery = studentsQuery.where('year', '==', parseInt(req.query.year));
      }
      if (req.query.semester) {
        studentsQuery = studentsQuery.where('semester', '==', parseInt(req.query.semester));
      }
      if (req.query.status) {
        studentsQuery = studentsQuery.where('status', '==', req.query.status);
      }


      // Pagination
      let limit = parseInt(req.query.limit) || 100;
      if (limit > 1000) limit = 1000;
      studentsQuery = studentsQuery.orderBy('admissionNumber').limit(limit);

      let startAfterDoc = null;
      if (req.query.pageToken) {
        startAfterDoc = await db.collection('students').doc(req.query.pageToken).get();
        if (startAfterDoc.exists) {
          studentsQuery = studentsQuery.startAfter(startAfterDoc);
        }
      }

      const snapshot = await studentsQuery.get();
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // For next page
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextPageToken = lastDoc ? lastDoc.id : null;

      res.json({
        students,
        count: students.length,
        nextPageToken,
        filters: req.query
      });

    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
);

/**
 * Get student by ID or admission number
 * GET /api/students/:identifier
 */
router.get('/:identifier', 
  requirePermission('students:read'),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      let studentDoc = null;

      // Try to find by ID first
      const docRef = db.collection('students').doc(identifier);
      const doc = await docRef.get();

      if (doc.exists) {
        studentDoc = { id: doc.id, ...doc.data() };
      } else {
        // Try to find by admission number
        const query = await db.collection('students').where('admissionNumber', '==', identifier).get();
        if (!query.empty) {
          const found = query.docs[0];
          studentDoc = { id: found.id, ...found.data() };
        }
      }

      if (!studentDoc) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ student: studentDoc });

    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  }
);

/**
 * Get student's enrolled units
 * GET /api/students/:identifier/units
 */
router.get('/:identifier/units',
  requirePermission('students:read'),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // First get the student
      let studentId = identifier;
      const studentQuery = await db.collection('students').where('admissionNumber', '==', identifier).get();
      if (!studentQuery.empty) {
        studentId = studentQuery.docs[0].id;
      }

      // Get unit registrations for this student
      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .get();

      const registrations = [];
      for (const doc of registrationsQuery.docs) {
        const regData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(regData.unitId).get();
        if (unitDoc.exists) {
          registrations.push({
            id: doc.id,
            ...regData,
            unit: { id: unitDoc.id, ...unitDoc.data() }
          });
        }
      }

      res.json({ 
        studentId,
        units: registrations,
        count: registrations.length
      });

    } catch (error) {
      console.error('Error fetching student units:', error);
      res.status(500).json({ error: 'Failed to fetch student units' });
    }
  }
);

/**
 * Get student's semester reports
 * GET /api/students/:identifier/semester-reports
 */
router.get('/:identifier/semester-reports',
  requirePermission('students:read'),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Get semester reports for student
      const reportsQuery = await db.collection('semester_reports')
        .where('studentId', '==', identifier)
        .orderBy('createdAt', 'desc')
        .get();

      const reports = reportsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({ 
        studentId: identifier,
        reports,
        count: reports.length
      });

    } catch (error) {
      console.error('Error fetching semester reports:', error);
      res.status(500).json({ error: 'Failed to fetch semester reports' });
    }
  }
);

/**
 * Update student information
 * PATCH /api/students/:identifier
 */
router.patch('/:identifier',
  requirePermission('students:write'),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated via API
      delete updates.id;
      delete updates.admissionNumber;
      delete updates.createdAt;
      delete updates.password;

      updates.updatedAt = new Date().toISOString();

      let studentRef = null;
      
      // Try to find by ID first
      const docRef = db.collection('students').doc(identifier);
      const doc = await docRef.get();

      if (doc.exists) {
        studentRef = docRef;
      } else {
        // Try to find by admission number
        const query = await db.collection('students').where('admissionNumber', '==', identifier).get();
        if (!query.empty) {
          studentRef = query.docs[0].ref;
        }
      }

      if (!studentRef) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await studentRef.update(updates);

      res.json({ 
        message: 'Student updated successfully',
        updates 
      });

    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  }
);

/**
 * Activate student account
 * POST /api/students/activate/:studentId
 */
router.post('/activate/:studentId',
  requirePermission('students:write'),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const { email, approved = true, accountActive = true } = req.body;

      const getDB = () => getFirestore();
      const db = getDB();

      // Update student in Firestore
      const studentRef = db.collection('students').doc(studentId);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentDoc.data();

      // Update approval status in Firestore
      await studentRef.update({
        approved: approved,
        accountActive: accountActive,
        updatedAt: new Date().toISOString()
      });

      // Update approval status in Realtime Database for authentication
      const { getDatabase } = await import('firebase-admin/database');
      const realtimeDb = getDatabase();

      // Update in students collection in Realtime Database
      const realtimeStudentRef = realtimeDb.ref('students');
      const realtimeStudentSnapshot = await realtimeStudentRef.orderByChild('admissionNumber').equalTo(studentData.admissionNumber).once('value');
      
      if (realtimeStudentSnapshot.exists()) {
        const students = realtimeStudentSnapshot.val();
        const studentKey = Object.keys(students)[0];
        await realtimeStudentRef.child(studentKey).update({
          approved: approved,
          accountActive: accountActive,
          updatedAt: new Date().toISOString()
        });
      }

      // Also update in studentCredentials if it exists
      if (studentData.admissionNumber) {
        const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
        const credentialsSnapshot = await credentialsRef.once('value');
        if (credentialsSnapshot.exists()) {
          await credentialsRef.update({
            approved: approved,
            accountActive: accountActive,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      res.json({ 
        message: 'Student account activated successfully',
        studentId: studentId,
        approved: approved,
        accountActive: accountActive
      });

    } catch (error) {
      console.error('Error activating student account:', error);
      res.status(500).json({ error: 'Failed to activate student account' });
    }
  }
);

/**
 * Get approved units for a specific student
 * GET /api/students/approved-units/:studentId
 */
router.get('/approved-units/:studentId',
  requirePermission('students:read'),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
      }

      const db = getFirestore();
      let actualStudentId = studentId;
      
      // If the studentId looks like an email, find the actual student ID
      if (studentId.includes('@')) {
        console.log('Looking up student by email:', studentId);
        const studentsSnapshot = await db.collection('students')
          .where('email', '==', studentId)
          .limit(1)
          .get();
        
        if (!studentsSnapshot.empty) {
          actualStudentId = studentsSnapshot.docs[0].id;
          console.log('Found student ID for email:', actualStudentId);
        } else {
          console.log('No student found with email:', studentId);
          return res.json({
            success: true,
            units: [],
            count: 0,
            message: 'No student found with this email'
          });
        }
      } else {
        // If not an email, try to find by document ID first, if not found try by email
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists()) {
          // Maybe it's stored as email in some field, let's search
          const studentsSnapshot = await db.collection('students')
            .where('email', '==', studentId)
            .limit(1)
            .get();
          
          if (!studentsSnapshot.empty) {
            actualStudentId = studentsSnapshot.docs[0].id;
            console.log('Found student by email search:', actualStudentId);
          }
        }
      }
      
      console.log('Using student ID for unit lookup:', actualStudentId);
      
      // Query unit registrations for this student that are approved
      const registrationsSnapshot = await db.collection('unit_registrations')
        .where('studentId', '==', actualStudentId)
        .where('status', '==', 'approved')
        .get();

      const approvedUnits = [];
      
      for (const doc of registrationsSnapshot.docs) {
        const registration = doc.data();
        
        // Get unit details from the units collection
        const unitDoc = await db.collection('units').doc(registration.unitId).get();
        
        if (unitDoc.exists) {
          const unitData = unitDoc.data();
          approvedUnits.push({
            id: doc.id,
            unitId: registration.unitId,
            unitCode: unitData.code,
            unitName: unitData.name,
            semester: registration.semester,
            year: registration.year,
            course: registration.course,
            approvedAt: registration.approvedAt,
            approvedBy: registration.approvedBy
          });
        }
      }

      res.json({
        success: true,
        units: approvedUnits,
        count: approvedUnits.length,
        studentId: actualStudentId,
        queriedId: studentId
      });

    } catch (error) {
      console.error('Error fetching approved units:', error);
      res.status(500).json({ error: 'Failed to fetch approved units' });
    }
  }
);

export default router;
