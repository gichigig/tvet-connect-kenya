import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { requirePermission } from '../middleware/auth.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();
const db = getFirestore();

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

export default router;
