import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateApiKey, requirePermission } from '../middleware/auth.js';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to get Firestore instance
const getDB = () => getFirestore();

/**
 * GET /api/admin/clearance-applications
 * Get clearance applications for admin review (library, hostel, general only)
 */
router.get('/clearance-applications',
  authenticateApiKey,
  requirePermission('admin:clearance:read'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('type').optional().isIn(['library', 'hostel', 'general']),
    query('course').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Admin only sees library, hostel, and general clearances
      let query = getDB().collection('clearanceApplications')
        .where('type', 'in', ['library', 'hostel', 'general']);

      // Apply additional filters
      if (req.query.status) {
        query = getDB().collection('clearanceApplications')
          .where('type', 'in', ['library', 'hostel', 'general'])
          .where('status', '==', req.query.status);
      }
      if (req.query.type && ['library', 'hostel', 'general'].includes(req.query.type)) {
        query = getDB().collection('clearanceApplications')
          .where('type', '==', req.query.type);
        
        if (req.query.status) {
          query = query.where('status', '==', req.query.status);
        }
      }
      if (req.query.course) {
        // Need to rebuild query with course filter
        const baseQuery = req.query.type ? 
          getDB().collection('clearanceApplications').where('type', '==', req.query.type) :
          getDB().collection('clearanceApplications').where('type', 'in', ['library', 'hostel', 'general']);
        
        query = baseQuery.where('course', '==', req.query.course);
        
        if (req.query.status) {
          query = query.where('status', '==', req.query.status);
        }
      }

      const snapshot = await query.orderBy('appliedAt', 'desc').get();
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        applications,
        total: applications.length,
        allowedTypes: ['library', 'hostel', 'general']
      });

    } catch (error) {
      console.error('Failed to fetch clearance applications:', error);
      res.status(500).json({ error: 'Failed to fetch clearance applications' });
    }
  }
);

/**
 * PUT /api/admin/clearance-applications/:id/status
 * Update clearance application status (library, hostel, general only)
 */
router.put('/clearance-applications/:id/status',
  authenticateApiKey,
  requirePermission('admin:clearance:write'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('comment').optional().isString(),
    body('reviewedBy').notEmpty().withMessage('Reviewer name is required')
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

      // Verify this is a clearance type that admin can process
      const allowedTypes = ['library', 'hostel', 'general'];
      if (!allowedTypes.includes(applicationData.type)) {
        return res.status(403).json({ 
          error: `Admin can only process ${allowedTypes.join(', ')} clearance applications. This is a ${applicationData.type} clearance.` 
        });
      }

      const updateData = {
        status,
        reviewedBy,
        reviewedByRole: 'Admin',
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
        message: `${applicationData.type} clearance application ${status} by Admin`,
        application: updatedApplication
      });

    } catch (error) {
      console.error('Failed to update clearance application:', error);
      res.status(500).json({ error: 'Failed to update clearance application' });
    }
  }
);

/**
 * GET /api/admin/fee-structures
 * Get all fee structures
 */
router.get('/fee-structures',
  authenticateApiKey,
  requirePermission('admin:fees:read'),
  async (req, res) => {
    try {
      const snapshot = await getDB().collection('feeStructures').orderBy('course').get();
      const feeStructures = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        feeStructures,
        total: feeStructures.length
      });

    } catch (error) {
      console.error('Failed to fetch fee structures:', error);
      res.status(500).json({ error: 'Failed to fetch fee structures' });
    }
  }
);

/**
 * POST /api/admin/fee-structures
 * Create or update fee structure
 */
router.post('/fee-structures',
  authenticateApiKey,
  requirePermission('admin:fees:write'),
  [
    body('course').notEmpty().withMessage('Course is required'),
    body('tuitionFee').isNumeric().withMessage('Tuition fee must be a number'),
    body('examFee').isNumeric().withMessage('Exam fee must be a number'),
    body('libraryFee').isNumeric().withMessage('Library fee must be a number'),
    body('labFee').isNumeric().withMessage('Lab fee must be a number'),
    body('otherFees').isNumeric().withMessage('Other fees must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { course, tuitionFee, examFee, libraryFee, labFee, otherFees } = req.body;

      const totalPerSemester = parseFloat(tuitionFee) + parseFloat(examFee) + 
                               parseFloat(libraryFee) + parseFloat(labFee) + parseFloat(otherFees);
      const totalPerYear = totalPerSemester * 2;

      const feeStructure = {
        course,
        tuitionFee: parseFloat(tuitionFee),
        examFee: parseFloat(examFee),
        libraryFee: parseFloat(libraryFee),
        labFee: parseFloat(labFee),
        otherFees: parseFloat(otherFees),
        totalPerSemester,
        totalPerYear,
        updatedAt: new Date().toISOString()
      };

      // Check if fee structure exists for this course
      const existingQuery = await getDB().collection('feeStructures')
        .where('course', '==', course)
        .limit(1)
        .get();

      let docRef;
      if (!existingQuery.empty) {
        // Update existing
        docRef = existingQuery.docs[0].ref;
        await docRef.update(feeStructure);
      } else {
        // Create new
        feeStructure.createdAt = new Date().toISOString();
        docRef = await getDB().collection('feeStructures').add(feeStructure);
      }

      res.json({
        success: true,
        message: 'Fee structure saved successfully',
        feeStructure: {
          id: docRef.id,
          ...feeStructure
        }
      });

    } catch (error) {
      console.error('Failed to save fee structure:', error);
      res.status(500).json({ error: 'Failed to save fee structure' });
    }
  }
);

/**
 * GET /api/admin/unit-registrations
 * Get all unit registrations for admin review
 */
router.get('/unit-registrations',
  authenticateApiKey,
  requirePermission('admin:units:read'),
  [
    query('course').optional().isString(),
    query('semester').optional().isInt(),
    query('academicYear').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = getDB().collection('unitRegistrations');

      // Apply filters
      if (req.query.course) {
        query = query.where('course', '==', req.query.course);
      }
      if (req.query.semester) {
        query = query.where('semester', '==', parseInt(req.query.semester));
      }
      if (req.query.academicYear) {
        query = query.where('academicYear', '==', req.query.academicYear);
      }

      const snapshot = await query.orderBy('registeredAt', 'desc').get();
      const registrations = [];

      for (const doc of snapshot.docs) {
        const registration = doc.data();
        
        // Get unit details
        const unitDoc = await getDB().collection('units').doc(registration.unitId).get();
        const unitData = unitDoc.exists ? unitDoc.data() : null;

        registrations.push({
          id: doc.id,
          ...registration,
          unit: unitData
        });
      }

      res.json({
        success: true,
        registrations,
        total: registrations.length
      });

    } catch (error) {
      console.error('Failed to fetch unit registrations:', error);
      res.status(500).json({ error: 'Failed to fetch unit registrations' });
    }
  }
);

export default router;
