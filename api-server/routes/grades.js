import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { requirePermission } from '../middleware/auth.js';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Middleware to block grades access for tvet-connect-kenya app
 * Grades should only be accessible via grade-vault-tvet app
 */
const blockTvetConnectAccess = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const origin = req.headers['origin'] || '';
  
  // Check if request is coming from tvet-connect-kenya app
  const isTvetConnectApp = (
    userAgent.includes('tvet-connect') ||
    referer.includes('tvet-connect') ||
    origin.includes('tvet-connect') ||
    req.headers['x-app-name'] === 'tvet-connect-kenya'
  );
  
  if (isTvetConnectApp) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.'
    });
  }
  
  next();
};

/**
 * Get grades for a student
 * GET /api/grades/student/:studentId
 */
router.get('/student/:studentId',
  blockTvetConnectAccess,
  requirePermission('grades:read'),
  [
    query('semester').optional().isInt(),
    query('year').optional().isInt(),
    query('academicYear').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId } = req.params;
      let gradesQuery = db.collection('exam_results').where('studentId', '==', studentId);

      // Apply filters
      if (req.query.semester) {
        gradesQuery = gradesQuery.where('semester', '==', parseInt(req.query.semester));
      }
      if (req.query.year) {
        gradesQuery = gradesQuery.where('year', '==', parseInt(req.query.year));
      }
      if (req.query.academicYear) {
        gradesQuery = gradesQuery.where('academicYear', '==', req.query.academicYear);
      }

      const snapshot = await gradesQuery.orderBy('createdAt', 'desc').get();
      const grades = [];

      for (const doc of snapshot.docs) {
        const gradeData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(gradeData.unitId).get();
        const unitData = unitDoc.exists ? unitDoc.data() : null;

        grades.push({
          id: doc.id,
          ...gradeData,
          unit: unitData ? { id: unitDoc.id, ...unitData } : null
        });
      }

      res.json({
        studentId,
        grades,
        count: grades.length,
        filters: req.query
      });

    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ error: 'Failed to fetch grades' });
    }
  }
);

/**
 * Get grades for a specific unit
 * GET /api/grades/unit/:unitId
 */
router.get('/unit/:unitId',
  blockTvetConnectAccess,
  requirePermission('grades:read'),
  [
    query('semester').optional().isInt(),
    query('year').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { unitId } = req.params;
      let gradesQuery = db.collection('exam_results').where('unitId', '==', unitId);

      // Apply filters
      if (req.query.semester) {
        gradesQuery = gradesQuery.where('semester', '==', parseInt(req.query.semester));
      }
      if (req.query.year) {
        gradesQuery = gradesQuery.where('year', '==', parseInt(req.query.year));
      }

      const snapshot = await gradesQuery.get();
      const grades = [];

      for (const doc of snapshot.docs) {
        const gradeData = doc.data();
        
        // Get student details
        const studentDoc = await db.collection('students').doc(gradeData.studentId).get();
        const studentData = studentDoc.exists ? studentDoc.data() : null;

        grades.push({
          id: doc.id,
          ...gradeData,
          student: studentData ? { 
            id: studentDoc.id, 
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            admissionNumber: studentData.admissionNumber
          } : null
        });
      }

      res.json({
        unitId,
        grades,
        count: grades.length,
        filters: req.query
      });

    } catch (error) {
      console.error('Error fetching unit grades:', error);
      res.status(500).json({ error: 'Failed to fetch unit grades' });
    }
  }
);

/**
 * Submit or update grades
 * POST /api/grades
 */
router.post('/',
  blockTvetConnectAccess,
  requirePermission('grades:write'),
  [
    body('studentId').isString().withMessage('Student ID is required'),
    body('unitId').isString().withMessage('Unit ID is required'),
    body('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester is required'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Valid year is required'),
    body('academicYear').isString().withMessage('Academic year is required'),
    body('marks').isObject().withMessage('Marks object is required'),
    body('grade').isString().withMessage('Grade is required'),
    body('status').isIn(['pass', 'fail', 'incomplete', 'retake']).withMessage('Valid status is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const gradeData = {
        ...req.body,
        submittedAt: new Date().toISOString(),
        submittedBy: req.apiKey.createdBy // Using API key creator as submitter
      };

      // Check if grade already exists
      const existingQuery = await db.collection('exam_results')
        .where('studentId', '==', req.body.studentId)
        .where('unitId', '==', req.body.unitId)
        .where('semester', '==', req.body.semester)
        .where('year', '==', req.body.year)
        .where('academicYear', '==', req.body.academicYear)
        .get();

      if (!existingQuery.empty) {
        // Update existing grade
        const existingDoc = existingQuery.docs[0];
        await existingDoc.ref.update({
          ...gradeData,
          updatedAt: new Date().toISOString()
        });

        res.json({
          message: 'Grade updated successfully',
          gradeId: existingDoc.id,
          action: 'updated'
        });
      } else {
        // Create new grade
        const docRef = await db.collection('exam_results').add({
          ...gradeData,
          createdAt: new Date().toISOString()
        });

        res.status(201).json({
          message: 'Grade submitted successfully',
          gradeId: docRef.id,
          action: 'created'
        });
      }

    } catch (error) {
      console.error('Error submitting grade:', error);
      res.status(500).json({ error: 'Failed to submit grade' });
    }
  }
);

/**
 * Get student transcript
 * GET /api/grades/transcript/:studentId
 */
router.get('/transcript/:studentId',
  blockTvetConnectAccess,
  requirePermission('grades:read'),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      // Get student info
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentDoc.data();

      // Get all grades for the student
      const gradesQuery = await db.collection('exam_results')
        .where('studentId', '==', studentId)
        .orderBy('year')
        .orderBy('semester')
        .get();

      const grades = [];
      for (const doc of gradesQuery.docs) {
        const gradeData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(gradeData.unitId).get();
        const unitData = unitDoc.exists ? unitDoc.data() : null;

        grades.push({
          id: doc.id,
          ...gradeData,
          unit: unitData
        });
      }

      // Calculate GPA and other statistics
      const validGrades = grades.filter(g => g.status === 'pass');
      const totalCredits = validGrades.reduce((sum, grade) => sum + (grade.unit?.credits || 0), 0);
      
      // Simple GPA calculation (you may need to adjust based on your grading system)
      const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
      };
      
      const totalGradePoints = validGrades.reduce((sum, grade) => {
        const points = gradePoints[grade.grade] || 0;
        const credits = grade.unit?.credits || 0;
        return sum + (points * credits);
      }, 0);

      const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

      res.json({
        student: {
          id: studentDoc.id,
          ...studentData
        },
        transcript: {
          grades,
          summary: {
            totalUnits: grades.length,
            passedUnits: validGrades.length,
            totalCredits,
            gpa,
            generatedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Error generating transcript:', error);
      res.status(500).json({ error: 'Failed to generate transcript' });
    }
  }
);

export default router;
