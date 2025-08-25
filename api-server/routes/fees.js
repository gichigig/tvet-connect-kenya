import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { authenticateStudent } from '../middleware/authenticateStudent.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Helper functions to get Firebase instances
const getDB = () => getFirestore();
const getRTDB = () => getDatabase();

/**
 * GET /api/me/fee-balance
 * Get fee balance for authenticated student
 */
router.get('/fee-balance', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;

    // Find student first
    let studentId = null;
    let studentData = null;
    
    const studentsQuery = await getDB().collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
      studentData = studentsQuery.docs[0].data();
    } else {
      // Fallback to Realtime Database
      const rtdbStudentsRef = rtgetDB().ref('students');
      const rtdbSnapshot = await rtdbStudentsRef.orderByChild('email').equalTo(email).once('value');
      
      if (rtdbSnapshot.exists()) {
        const rtdbData = rtdbSnapshot.val();
        const studentKey = Object.keys(rtdbData)[0];
        studentData = rtdbData[studentKey];
        studentId = studentKey;
      }
    }

    if (!studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get fee records
    const feeQuery = await getDB().collection('fees').where('studentId', '==', studentId).get();
    const feeRecords = feeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate balance
    let totalFees = 0;
    let totalPaid = 0;
    
    feeRecords.forEach(record => {
      totalFees += record.amount || 0;
      totalPaid += record.paid || 0;
    });

    const balance = totalFees - totalPaid;

    res.json({
      success: true,
      feeBalance: {
        totalFees,
        totalPaid,
        balance,
        course: studentData.course,
        semester: studentData.currentSemester || 1,
        records: feeRecords
      }
    });

  } catch (error) {
    console.error('Failed to fetch fee balance:', error);
    res.status(500).json({ error: 'Failed to fetch fee balance' });
  }
});

/**
 * GET /api/me/fee-structure
 * Get fee structure for student's course
 */
router.get('/fee-structure', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;

    // Find student first
    let studentData = null;
    const studentsQuery = await getDB().collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentData = studentsQuery.docs[0].data();
    } else {
      // Fallback to Realtime Database
      const rtdbStudentsRef = rtgetDB().ref('students');
      const rtdbSnapshot = await rtdbStudentsRef.orderByChild('email').equalTo(email).once('value');
      
      if (rtdbSnapshot.exists()) {
        const rtdbData = rtdbSnapshot.val();
        const studentKey = Object.keys(rtdbData)[0];
        studentData = rtdbData[studentKey];
      }
    }

    if (!studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get fee structure for the course
    const feeStructureQuery = await getDB().collection('feeStructures')
      .where('course', '==', studentData.course)
      .limit(1)
      .get();

    let feeStructure = null;
    if (!feeStructureQuery.empty) {
      feeStructure = feeStructureQuery.docs[0].data();
    } else {
      // Create default fee structure if none exists
      feeStructure = {
        course: studentData.course,
        tuitionFee: 50000,
        examFee: 5000,
        libraryFee: 2000,
        labFee: 8000,
        otherFees: 3000,
        totalPerSemester: 68000,
        totalPerYear: 136000,
        createdAt: new Date().toISOString()
      };
      
      // Save the default structure
      await getDB().collection('feeStructures').add(feeStructure);
    }

    res.json({
      success: true,
      feeStructure
    });

  } catch (error) {
    console.error('Failed to fetch fee structure:', error);
    res.status(500).json({ error: 'Failed to fetch fee structure' });
  }
});

/**
 * POST /api/me/apply-clearance
 * Student applies for clearance
 */
router.post('/apply-clearance', 
  authenticateStudent,
  [
    body('reason').notEmpty().withMessage('Reason is required'),
    body('type').isIn(['academic', 'financial', 'library', 'hostel', 'general']).withMessage('Invalid clearance type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { admissionNumber, email } = req.student;
      const { reason, type, documents } = req.body;

      // Find student
      let studentId = null;
      let studentData = null;
      
      const studentsQuery = await getDB().collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
      
      if (!studentsQuery.empty) {
        studentId = studentsQuery.docs[0].id;
        studentData = studentsQuery.docs[0].data();
      }

      if (!studentData) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Create clearance application
      const clearanceApplication = {
        studentId,
        admissionNumber,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        course: studentData.course,
        type,
        reason,
        documents: documents || [],
        status: 'pending',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await getDB().collection('clearanceApplications').add(clearanceApplication);

      res.json({
        success: true,
        message: 'Clearance application submitted successfully',
        applicationId: docRef.id,
        application: clearanceApplication
      });

    } catch (error) {
      console.error('Failed to submit clearance application:', error);
      res.status(500).json({ error: 'Failed to submit clearance application' });
    }
  }
);

/**
 * POST /api/me/defer-semester
 * Student applies to defer a semester
 */
router.post('/defer-semester',
  authenticateStudent,
  [
    body('reason').notEmpty().withMessage('Reason is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester number required'),
    body('academicYear').notEmpty().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { admissionNumber, email } = req.student;
      const { reason, semester, academicYear, documents } = req.body;

      // Find student
      let studentId = null;
      let studentData = null;
      
      const studentsQuery = await getDB().collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
      
      if (!studentsQuery.empty) {
        studentId = studentsQuery.docs[0].id;
        studentData = studentsQuery.docs[0].data();
      }

      if (!studentData) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Check if already deferred for this semester
      const existingDeferment = await getDB().collection('defermentApplications')
        .where('studentId', '==', studentId)
        .where('semester', '==', semester)
        .where('academicYear', '==', academicYear)
        .where('status', 'in', ['pending', 'approved'])
        .get();

      if (!existingDeferment.empty) {
        return res.status(400).json({ 
          error: 'You have already applied for deferment for this semester' 
        });
      }

      // Create deferment application
      const defermentApplication = {
        studentId,
        admissionNumber,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        course: studentData.course,
        semester,
        academicYear,
        reason,
        documents: documents || [],
        status: 'pending',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await getDB().collection('defermentApplications').add(defermentApplication);

      res.json({
        success: true,
        message: 'Deferment application submitted successfully',
        applicationId: docRef.id,
        application: defermentApplication
      });

    } catch (error) {
      console.error('Failed to submit deferment application:', error);
      res.status(500).json({ error: 'Failed to submit deferment application' });
    }
  }
);

/**
 * GET /api/me/applications
 * Get all applications (clearance and deferment) for student
 */
router.get('/applications', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber } = req.student;

    // Find student
    const studentsQuery = await getDB().collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (studentsQuery.empty) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentsQuery.docs[0].id;

    // Get clearance applications
    const clearanceQuery = await getDB().collection('clearanceApplications')
      .where('studentId', '==', studentId)
      .orderBy('appliedAt', 'desc')
      .get();

    const clearanceApplications = clearanceQuery.docs.map(doc => ({
      id: doc.id,
      type: 'clearance',
      ...doc.data()
    }));

    // Get deferment applications
    const defermentQuery = await getDB().collection('defermentApplications')
      .where('studentId', '==', studentId)
      .orderBy('appliedAt', 'desc')
      .get();

    const defermentApplications = defermentQuery.docs.map(doc => ({
      id: doc.id,
      type: 'deferment',
      ...doc.data()
    }));

    // Combine and sort by date
    const allApplications = [...clearanceApplications, ...defermentApplications]
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({
      success: true,
      applications: allApplications
    });

  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

export default router;
