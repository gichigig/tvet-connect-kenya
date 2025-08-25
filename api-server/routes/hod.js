import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateApiKey, requirePermission } from '../middleware/auth.js';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to get Firestore instance
const getDB = () => getFirestore();

/**
 * GET /api/hod/deferment-applications
 * Get all deferment applications for HOD review
 */
router.get('/deferment-applications',
  authenticateApiKey,
  requirePermission('hod:deferment:read'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('course').optional().isString(),
    query('semester').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = getDB().collection('defermentApplications');

      // Apply filters
      if (req.query.status) {
        query = query.where('status', '==', req.query.status);
      }
      if (req.query.course) {
        query = query.where('course', '==', req.query.course);
      }
      if (req.query.semester) {
        query = query.where('semester', '==', parseInt(req.query.semester));
      }

      const snapshot = await query.orderBy('appliedAt', 'desc').get();
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        applications,
        total: applications.length
      });

    } catch (error) {
      console.error('Failed to fetch deferment applications:', error);
      res.status(500).json({ error: 'Failed to fetch deferment applications' });
    }
  }
);

/**
 * PUT /api/hod/deferment-applications/:id/status
 * Update deferment application status (HOD only)
 */
router.put('/deferment-applications/:id/status',
  authenticateApiKey,
  requirePermission('hod:deferment:write'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('comment').optional().isString(),
    body('reviewedBy').notEmpty().withMessage('HOD name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, comment, reviewedBy } = req.body;

      const applicationRef = getDB().collection('defermentApplications').doc(id);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return res.status(404).json({ error: 'Deferment application not found' });
      }

      const updateData = {
        status,
        reviewedBy,
        reviewedByRole: 'HOD',
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (comment) {
        updateData.reviewComment = comment;
      }

      await applicationRef.update(updateData);

      const updatedApplication = {
        id,
        ...applicationDoc.data(),
        ...updateData
      };

      res.json({
        success: true,
        message: `Deferment application ${status} by HOD`,
        application: updatedApplication
      });

    } catch (error) {
      console.error('Failed to update deferment application:', error);
      res.status(500).json({ error: 'Failed to update deferment application' });
    }
  }
);

/**
 * GET /api/hod/clearance-applications
 * Get academic clearance applications for HOD review
 */
router.get('/clearance-applications',
  authenticateApiKey,
  requirePermission('hod:clearance:read'),
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

      // HOD only sees academic clearances
      let query = getDB().collection('clearanceApplications')
        .where('type', '==', 'academic');

      // Apply filters
      if (req.query.status) {
        query = query.where('status', '==', req.query.status);
      }
      if (req.query.course) {
        query = query.where('course', '==', req.query.course);
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
        type: 'academic'
      });

    } catch (error) {
      console.error('Failed to fetch academic clearance applications:', error);
      res.status(500).json({ error: 'Failed to fetch academic clearance applications' });
    }
  }
);

/**
 * PUT /api/hod/clearance-applications/:id/status
 * Update academic clearance application status (HOD only)
 */
router.put('/clearance-applications/:id/status',
  authenticateApiKey,
  requirePermission('hod:clearance:write'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('comment').optional().isString(),
    body('reviewedBy').notEmpty().withMessage('HOD name is required')
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

      // Verify this is an academic clearance
      if (applicationData.type !== 'academic') {
        return res.status(403).json({ 
          error: 'HOD can only process academic clearance applications' 
        });
      }

      const updateData = {
        status,
        reviewedBy,
        reviewedByRole: 'HOD',
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
        message: `Academic clearance application ${status} by HOD`,
        application: updatedApplication
      });

    } catch (error) {
      console.error('Failed to update clearance application:', error);
      res.status(500).json({ error: 'Failed to update clearance application' });
    }
  }
);

/**
 * GET /api/hod/dashboard-stats
 * Get HOD dashboard statistics
 */
router.get('/dashboard-stats',
  authenticateApiKey,
  requirePermission('hod:dashboard:read'),
  async (req, res) => {
    try {
      // Get pending deferment applications count
      const pendingDeferments = await getDB().collection('defermentApplications')
        .where('status', '==', 'pending')
        .get();

      // Get pending academic clearances count
      const pendingAcademicClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'academic')
        .where('status', '==', 'pending')
        .get();

      // Get recent applications (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentDeferments = await getDB().collection('defermentApplications')
        .where('appliedAt', '>=', sevenDaysAgo.toISOString())
        .get();

      const recentAcademicClearances = await getDB().collection('clearanceApplications')
        .where('type', '==', 'academic')
        .where('appliedAt', '>=', sevenDaysAgo.toISOString())
        .get();

      const stats = {
        pendingDeferments: pendingDeferments.size,
        pendingAcademicClearances: pendingAcademicClearances.size,
        recentDeferments: recentDeferments.size,
        recentAcademicClearances: recentAcademicClearances.size,
        totalPending: pendingDeferments.size + pendingAcademicClearances.size
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Failed to fetch HOD dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
);

/**
 * GET /api/hod/unit-registrations
 * Get all pending unit registrations for HOD approval
 */
router.get('/unit-registrations',
  authenticateApiKey,
  requirePermission('hod:units:read'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('course').optional().isString(),
    query('semester').optional().isString(),
    query('year').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = getDB().collection('unit_registrations');

      // Apply filters
      if (req.query.status) {
        query = query.where('status', '==', req.query.status);
      }
      if (req.query.course) {
        query = query.where('course', '==', req.query.course);
      }
      if (req.query.semester) {
        query = query.where('semester', '==', req.query.semester);
      }
      if (req.query.year) {
        query = query.where('year', '==', parseInt(req.query.year));
      }

      const snapshot = await query.orderBy('dateRegistered', 'desc').get();
      
      // Group registrations by student
      const registrationsByStudent = {};
      const studentIds = new Set();

      snapshot.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        studentIds.add(data.studentId);
        
        if (!registrationsByStudent[data.studentId]) {
          registrationsByStudent[data.studentId] = [];
        }
        registrationsByStudent[data.studentId].push(data);
      });

      // Get student details
      const students = {};
      if (studentIds.size > 0) {
        const studentPromises = Array.from(studentIds).map(async (studentId) => {
          const studentDoc = await getDB().collection('students').doc(studentId).get();
          if (studentDoc.exists) {
            students[studentId] = { id: studentId, ...studentDoc.data() };
          }
        });
        await Promise.all(studentPromises);
      }

      // Format response with student details
      const formattedRegistrations = Object.entries(registrationsByStudent).map(([studentId, units]) => ({
        student: students[studentId] || { id: studentId, name: 'Unknown Student' },
        units: units,
        totalUnits: units.length,
        hasPendingUnits: units.some(unit => unit.status === 'pending')
      }));

      res.json({
        success: true,
        registrations: formattedRegistrations,
        totalStudents: formattedRegistrations.length,
        totalRegistrations: snapshot.size
      });

    } catch (error) {
      console.error('Failed to fetch unit registrations:', error);
      res.status(500).json({ error: 'Failed to fetch unit registrations' });
    }
  }
);

/**
 * POST /api/hod/unit-registrations/approve-bulk
 * Approve all unit registrations for a student in bulk
 */
router.post('/unit-registrations/approve-bulk',
  authenticateApiKey,
  requirePermission('hod:units:approve'),
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId, action, remarks } = req.body;
      const db = getDB();
      const batch = db.batch();

      // Get all pending registrations for this student
      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .where('status', '==', 'pending')
        .get();

      if (registrationsQuery.empty) {
        return res.status(404).json({ error: 'No pending registrations found for this student' });
      }

      // Update all pending registrations for this student
      registrationsQuery.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedAt: new Date().toISOString(),
          approvedBy: req.user.email || 'HOD',
          remarks: remarks || ''
        });
      });

      await batch.commit();

      res.json({
        success: true,
        message: `Successfully ${action}d ${registrationsQuery.size} unit registrations for the student`,
        updatedCount: registrationsQuery.size
      });

    } catch (error) {
      console.error('Failed to approve unit registrations:', error);
      res.status(500).json({ error: 'Failed to approve unit registrations' });
    }
  }
);

/**
 * POST /api/hod/unit-registrations/approve-individual
 * Approve or reject individual unit registration
 */
router.post('/unit-registrations/approve-individual',
  authenticateApiKey,
  requirePermission('hod:units:approve'),
  [
    body('registrationId').notEmpty().withMessage('Registration ID is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { registrationId, action, remarks } = req.body;
      const db = getDB();

      const registrationRef = db.collection('unit_registrations').doc(registrationId);
      const registrationDoc = await registrationRef.get();

      if (!registrationDoc.exists) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      await registrationRef.update({
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: new Date().toISOString(),
        approvedBy: req.user.email || 'HOD',
        remarks: remarks || ''
      });

      res.json({
        success: true,
        message: `Unit registration ${action}d successfully`
      });

    } catch (error) {
      console.error('Failed to approve unit registration:', error);
      res.status(500).json({ error: 'Failed to approve unit registration' });
    }
  }
);

/**
 * POST /api/hod/unit-registrations/approve-course
 * Approve or reject all pending unit registrations for a specific course
 */
router.post('/unit-registrations/approve-course',
  authenticateApiKey,
  requirePermission('hod:units:approve'),
  [
    body('course').notEmpty().withMessage('Course is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { course, action, remarks } = req.body;
      const db = getDB();

      // Get all pending unit registrations for the specified course
      const registrationsRef = db.collection('unit_registrations');
      const studentsRef = db.collection('students');

      // First get all students from the specified course
      const studentsSnapshot = await studentsRef.where('course', '==', course).get();
      const studentIds = studentsSnapshot.docs.map(doc => doc.id);

      if (studentIds.length === 0) {
        return res.status(404).json({ error: 'No students found for the specified course' });
      }

      // Get all pending registrations for these students
      const pendingRegistrations = [];
      for (const studentId of studentIds) {
        const studentRegsSnapshot = await registrationsRef
          .where('studentId', '==', studentId)
          .where('status', '==', 'pending')
          .get();
        
        studentRegsSnapshot.docs.forEach(doc => {
          pendingRegistrations.push({ id: doc.id, ...doc.data() });
        });
      }

      if (pendingRegistrations.length === 0) {
        return res.status(404).json({ 
          error: 'No pending unit registrations found for the specified course' 
        });
      }

      // Batch update all pending registrations
      const batch = db.batch();
      const timestamp = new Date().toISOString();

      pendingRegistrations.forEach(registration => {
        const docRef = registrationsRef.doc(registration.id);
        batch.update(docRef, {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedAt: timestamp,
          approvedBy: req.user?.id || 'hod',
          remarks: remarks || ''
        });
      });

      await batch.commit();

      const affectedStudents = [...new Set(pendingRegistrations.map(r => r.studentId))].length;
      
      res.json({
        success: true,
        message: `Successfully ${action}d ${pendingRegistrations.length} unit registrations for ${affectedStudents} students in ${course}`,
        affected: {
          registrations: pendingRegistrations.length,
          students: affectedStudents,
          course: course
        }
      });

    } catch (error) {
      console.error('Failed to approve course unit registrations:', error);
      res.status(500).json({ error: 'Failed to approve course unit registrations' });
    }
  }
);

export default router;
