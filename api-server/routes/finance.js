import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateApiKey, requirePermission } from '../middleware/auth.js';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to get Firestore instance
const getDB = () => getFirestore();

/**
 * GET /api/finance/clearance-applications
 * Get financial clearance applications for Finance department review
 */
router.get('/clearance-applications',
  authenticateApiKey,
  requirePermission('finance:clearance:read'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('course').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Finance only sees financial clearances
      let query = getDB().collection('clearanceApplications')
        .where('type', '==', 'financial');

      // Apply filters
      if (req.query.status) {
        query = query.where('status', '==', req.query.status);
      }
      if (req.query.course) {
        query = query.where('course', '==', req.query.course);
      }

      const snapshot = await query.orderBy('appliedAt', 'desc').get();
      const applications = [];

      // Enhance with student fee information
      for (const doc of snapshot.docs) {
        const application = doc.data();
        
        // Get student fee balance for context
        try {
          const studentQuery = await getDB().collection('students')
            .where('admissionNumber', '==', application.admissionNumber)
            .limit(1)
            .get();

          let feeBalance = null;
          if (!studentQuery.empty) {
            const studentId = studentQuery.docs[0].id;
            const feeQuery = await getDB().collection('fees')
              .where('studentId', '==', studentId)
              .get();

            const feeRecords = feeQuery.docs.map(feeDoc => feeDoc.data());
            
            let totalFees = 0;
            let totalPaid = 0;
            
            feeRecords.forEach(record => {
              totalFees += record.amount || 0;
              totalPaid += record.paid || 0;
            });

            feeBalance = {
              totalFees,
              totalPaid,
              balance: totalFees - totalPaid,
              records: feeRecords.length
            };
          }

          applications.push({
            id: doc.id,
            ...application,
            feeBalance
          });
        } catch (err) {
          // If fee lookup fails, still include the application
          applications.push({
            id: doc.id,
            ...application,
            feeBalance: null
          });
        }
      }

      res.json({
        success: true,
        applications,
        total: applications.length,
        type: 'financial'
      });

    } catch (error) {
      console.error('Failed to fetch financial clearance applications:', error);
      res.status(500).json({ error: 'Failed to fetch financial clearance applications' });
    }
  }
);

/**
 * PUT /api/finance/clearance-applications/:id/status
 * Update financial clearance application status (Finance department only)
 */
router.put('/clearance-applications/:id/status',
  authenticateApiKey,
  requirePermission('finance:clearance:write'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('comment').optional().isString(),
    body('reviewedBy').notEmpty().withMessage('Finance officer name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, comment, reviewedBy } = req.body;

      const applicationRef = getDB().collection('clearanceApplications').doc(id);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return res.status(404).json({ error: 'Clearance application not found' });
      }

      const applicationData = applicationDoc.data();

      // Verify this is a financial clearance
      if (applicationData.type !== 'financial') {
        return res.status(403).json({ 
          error: 'Finance department can only process financial clearance applications' 
        });
      }

      const updateData = {
        status,
        reviewedBy,
        reviewedByRole: 'Finance',
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (comment) {
        updateData.reviewComment = comment;
      }

      await applicationRef.update(updateData);

      const updatedApplication = {
        id,
        ...applicationData,
        ...updateData
      };

      res.json({
        success: true,
        message: `Financial clearance application ${status} by Finance department`,
        application: updatedApplication
      });

    } catch (error) {
      console.error('Failed to update financial clearance application:', error);
      res.status(500).json({ error: 'Failed to update financial clearance application' });
    }
  }
);

/**
 * GET /api/finance/student-fees/:admissionNumber
 * Get detailed fee information for a student (for clearance review)
 */
router.get('/student-fees/:admissionNumber',
  authenticateApiKey,
  requirePermission('finance:fees:read'),
  async (req, res) => {
    try {
      const { admissionNumber } = req.params;

      // Find student
      const studentQuery = await getDB().collection('students')
        .where('admissionNumber', '==', admissionNumber)
        .limit(1)
        .get();

      if (studentQuery.empty) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentQuery.docs[0].data();
      const studentId = studentQuery.docs[0].id;

      // Get fee records
      const feeQuery = await getDB().collection('fees')
        .where('studentId', '==', studentId)
        .orderBy('createdAt', 'desc')
        .get();

      const feeRecords = feeQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate totals
      let totalFees = 0;
      let totalPaid = 0;
      
      feeRecords.forEach(record => {
        totalFees += record.amount || 0;
        totalPaid += record.paid || 0;
      });

      const balance = totalFees - totalPaid;

      // Get fee structure for course
      const feeStructureQuery = await getDB().collection('feeStructures')
        .where('course', '==', studentData.course)
        .limit(1)
        .get();

      let feeStructure = null;
      if (!feeStructureQuery.empty) {
        feeStructure = feeStructureQuery.docs[0].data();
      }

      res.json({
        success: true,
        student: {
          name: `${studentData.firstName} ${studentData.lastName}`,
          admissionNumber: studentData.admissionNumber,
          course: studentData.course,
          currentSemester: studentData.currentSemester
        },
        feeDetails: {
          totalFees,
          totalPaid,
          balance,
          records: feeRecords,
          structure: feeStructure
        },
        clearanceEligible: balance <= 0
      });

    } catch (error) {
      console.error('Failed to fetch student fees:', error);
      res.status(500).json({ error: 'Failed to fetch student fees' });
    }
  }
);

/**
 * GET /api/finance/dashboard-stats
 * Get Finance department dashboard statistics
 */
router.get('/dashboard-stats',
  authenticateApiKey,
  requirePermission('finance:dashboard:read'),
  async (req, res) => {
    try {
      // Get pending financial clearances count
      const pendingFinancialClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'financial')
        .where('status', '==', 'pending')
        .get();

      // Get recent financial clearances (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentFinancialClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'financial')
        .where('appliedAt', '>=', sevenDaysAgo.toISOString())
        .get();

      // Get approved clearances count
      const approvedClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'financial')
        .where('status', '==', 'approved')
        .get();

      // Get rejected clearances count
      const rejectedClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'financial')
        .where('status', '==', 'rejected')
        .get();

      const stats = {
        pendingFinancialClearances: pendingFinancialClearances.size,
        recentFinancialClearances: recentFinancialClearances.size,
        approvedClearances: approvedClearances.size,
        rejectedClearances: rejectedClearances.size,
        totalProcessed: approvedClearances.size + rejectedClearances.size
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Failed to fetch Finance dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
);

/**
 * POST /api/finance/fee-payment
 * Record a fee payment for a student
 */
router.post('/fee-payment',
  authenticateApiKey,
  requirePermission('finance:payments:write'),
  [
    body('admissionNumber').notEmpty().withMessage('Admission number is required'),
    body('amount').isNumeric().withMessage('Payment amount must be a number'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('reference').notEmpty().withMessage('Payment reference is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { admissionNumber, amount, paymentMethod, reference, description } = req.body;

      // Find student
      const studentQuery = await getDB().collection('students')
        .where('admissionNumber', '==', admissionNumber)
        .limit(1)
        .get();

      if (studentQuery.empty) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentQuery.docs[0].data();
      const studentId = studentQuery.docs[0].id;

      // Record payment
      const payment = {
        studentId,
        admissionNumber,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        course: studentData.course,
        amount: parseFloat(amount),
        paid: parseFloat(amount),
        paymentMethod,
        reference,
        description: description || 'Fee payment',
        type: 'payment',
        createdAt: new Date().toISOString(),
        recordedBy: req.body.recordedBy || 'Finance Department'
      };

      const paymentRef = await getDB().collection('fees').add(payment);

      res.json({
        success: true,
        message: 'Payment recorded successfully',
        payment: {
          id: paymentRef.id,
          ...payment
        }
      });

    } catch (error) {
      console.error('Failed to record payment:', error);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  }
);

export default router;
