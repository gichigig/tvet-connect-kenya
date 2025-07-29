import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { requirePermission } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const db = getFirestore();

/**
 * Report a new semester for a student
 * POST /api/semester/report
 */
router.post('/report',
  requirePermission('semester:write'),
  [
    body('studentId').isString().withMessage('Student ID is required'),
    body('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester (1-3) is required'),
    body('year').isInt({ min: 1, max: 6 }).withMessage('Valid year (1-6) is required'),
    body('academicYear').isString().withMessage('Academic year is required'),
    body('course').optional().isString().withMessage('Course must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId, semester, year, academicYear, course } = req.body;

      // Check if student exists
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Check if semester report already exists
      const existingQuery = await db.collection('semester_reports')
        .where('studentId', '==', studentId)
        .where('semester', '==', semester)
        .where('year', '==', year)
        .where('academicYear', '==', academicYear)
        .get();

      if (!existingQuery.empty) {
        return res.status(409).json({ 
          error: 'Semester report already exists',
          reportId: existingQuery.docs[0].id
        });
      }

      // Create semester report
      const reportData = {
        studentId,
        semester,
        year,
        academicYear,
        course: course || studentDoc.data().course,
        status: 'active',
        reportedAt: new Date().toISOString(),
        reportedBy: req.apiKey.createdBy
      };

      const docRef = await db.collection('semester_reports').add(reportData);

      res.status(201).json({
        message: 'Semester reported successfully',
        report: {
          id: docRef.id,
          ...reportData
        }
      });

    } catch (error) {
      console.error('Error reporting semester:', error);
      res.status(500).json({ error: 'Failed to report semester' });
    }
  }
);

/**
 * Get semester reports for a student
 * GET /api/semester/reports/:studentId
 */
router.get('/reports/:studentId',
  requirePermission('semester:read'),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      const reportsQuery = await db.collection('semester_reports')
        .where('studentId', '==', studentId)
        .orderBy('academicYear', 'desc')
        .orderBy('year', 'desc')
        .orderBy('semester', 'desc')
        .get();

      const reports = reportsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        studentId,
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
 * Get current semester for a student
 * GET /api/semester/current/:studentId
 */
router.get('/current/:studentId',
  requirePermission('semester:read'),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      // Get the most recent semester report
      const reportsQuery = await db.collection('semester_reports')
        .where('studentId', '==', studentId)
        .where('status', '==', 'active')
        .orderBy('reportedAt', 'desc')
        .limit(1)
        .get();

      if (reportsQuery.empty) {
        return res.status(404).json({ error: 'No active semester found for student' });
      }

      const currentSemester = {
        id: reportsQuery.docs[0].id,
        ...reportsQuery.docs[0].data()
      };

      res.json({
        studentId,
        currentSemester
      });

    } catch (error) {
      console.error('Error fetching current semester:', error);
      res.status(500).json({ error: 'Failed to fetch current semester' });
    }
  }
);

/**
 * Register units for a semester
 * POST /api/semester/register-units
 */
router.post('/register-units',
  requirePermission('units:write'),
  [
    body('studentId').isString().withMessage('Student ID is required'),
    body('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester is required'),
    body('year').isInt({ min: 1, max: 6 }).withMessage('Valid year is required'),
    body('academicYear').isString().withMessage('Academic year is required'),
    body('unitIds').isArray({ min: 1 }).withMessage('At least one unit ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId, semester, year, academicYear, unitIds } = req.body;

      // Verify student exists
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Verify units exist
      const unitPromises = unitIds.map(unitId => db.collection('units').doc(unitId).get());
      const unitDocs = await Promise.all(unitPromises);
      
      const missingUnits = unitIds.filter((unitId, index) => !unitDocs[index].exists);
      if (missingUnits.length > 0) {
        return res.status(400).json({ 
          error: 'Some units not found',
          missingUnits 
        });
      }

      // Create unit registrations
      const registrations = [];
      for (const unitId of unitIds) {
        // Check if already registered
        const existingQuery = await db.collection('unit_registrations')
          .where('studentId', '==', studentId)
          .where('unitId', '==', unitId)
          .where('semester', '==', semester)
          .where('year', '==', year)
          .where('academicYear', '==', academicYear)
          .get();

        if (existingQuery.empty) {
          const registrationData = {
            studentId,
            unitId,
            semester,
            year,
            academicYear,
            status: 'registered',
            registeredAt: new Date().toISOString(),
            registeredBy: req.apiKey.createdBy
          };

          const docRef = await db.collection('unit_registrations').add(registrationData);
          registrations.push({
            id: docRef.id,
            ...registrationData
          });
        }
      }

      res.json({
        message: 'Units registered successfully',
        registrations,
        registeredCount: registrations.length,
        totalRequested: unitIds.length
      });

    } catch (error) {
      console.error('Error registering units:', error);
      res.status(500).json({ error: 'Failed to register units' });
    }
  }
);

/**
 * Get unit registrations for a semester
 * GET /api/semester/registrations/:studentId/:academicYear/:year/:semester
 */
router.get('/registrations/:studentId/:academicYear/:year/:semester',
  requirePermission('units:read'),
  async (req, res) => {
    try {
      const { studentId, academicYear, year, semester } = req.params;

      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .where('academicYear', '==', academicYear)
        .where('year', '==', parseInt(year))
        .where('semester', '==', parseInt(semester))
        .get();

      const registrations = [];
      for (const doc of registrationsQuery.docs) {
        const regData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(regData.unitId).get();
        const unitData = unitDoc.exists ? unitDoc.data() : null;

        registrations.push({
          id: doc.id,
          ...regData,
          unit: unitData ? { id: unitDoc.id, ...unitData } : null
        });
      }

      res.json({
        studentId,
        academicYear,
        year: parseInt(year),
        semester: parseInt(semester),
        registrations,
        count: registrations.length
      });

    } catch (error) {
      console.error('Error fetching unit registrations:', error);
      res.status(500).json({ error: 'Failed to fetch unit registrations' });
    }
  }
);

export default router;
