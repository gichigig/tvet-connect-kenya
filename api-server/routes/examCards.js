import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { requirePermission } from '../middleware/auth.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Generate exam card for a student
 * GET /api/exam-cards/:studentId
 */
router.get('/:studentId',
  requirePermission('examcards:read'),
  [
    query('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester is required'),
    query('year').isInt({ min: 1, max: 6 }).withMessage('Valid year is required'),
    query('academicYear').isString().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId } = req.params;
      const { semester, year, academicYear } = req.query;

      // Get student information
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentDoc.data();

      // Check if student has fees clearance
      const feesClearanceQuery = await db.collection('clearance_forms')
        .where('studentId', '==', studentId)
        .where('type', '==', 'fees')
        .where('academicYear', '==', academicYear)
        .where('status', '==', 'approved')
        .get();

      const hasFeesCleared = !feesClearanceQuery.empty;

      // Get unit registrations for the semester
      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .where('semester', '==', parseInt(semester))
        .where('year', '==', parseInt(year))
        .where('academicYear', '==', academicYear)
        .get();

      if (registrationsQuery.empty) {
        return res.status(404).json({ 
          error: 'No unit registrations found for this semester' 
        });
      }

      // Get unit details and exam schedules
      const examUnits = [];
      for (const doc of registrationsQuery.docs) {
        const regData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(regData.unitId).get();
        if (!unitDoc.exists) continue;
        
        const unitData = unitDoc.data();

        // Get exam schedule for this unit
        const examQuery = await db.collection('exam_schedules')
          .where('unitId', '==', regData.unitId)
          .where('semester', '==', parseInt(semester))
          .where('year', '==', parseInt(year))
          .where('academicYear', '==', academicYear)
          .get();

        let examSchedule = null;
        if (!examQuery.empty) {
          examSchedule = examQuery.docs[0].data();
        }

        examUnits.push({
          unitId: regData.unitId,
          unitCode: unitData.code,
          unitName: unitData.name,
          credits: unitData.credits,
          examDate: examSchedule?.examDate || null,
          examTime: examSchedule?.examTime || null,
          venue: examSchedule?.venue || null,
          duration: examSchedule?.duration || null,
          examType: examSchedule?.examType || 'written'
        });
      }

      // Generate exam card data
      const examCard = {
        studentInfo: {
          id: studentDoc.id,
          admissionNumber: studentData.admissionNumber,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          course: studentData.course || studentData.courseName,
          department: studentData.department,
          level: studentData.level
        },
        semesterInfo: {
          semester: parseInt(semester),
          year: parseInt(year),
          academicYear
        },
        examUnits,
        eligibility: {
          feesCleared: hasFeesCleared,
          unitsRegistered: examUnits.length > 0,
          eligible: hasFeesCleared && examUnits.length > 0
        },
        generatedAt: new Date().toISOString(),
        generatedBy: req.apiKey.name
      };

      // Log exam card generation
      await db.collection('exam_card_logs').add({
        studentId,
        semester: parseInt(semester),
        year: parseInt(year),
        academicYear,
        generatedAt: new Date(),
        generatedBy: req.apiKey.createdBy,
        apiKeyUsed: req.apiKey.id
      });

      res.json({ examCard });

    } catch (error) {
      console.error('Error generating exam card:', error);
      res.status(500).json({ error: 'Failed to generate exam card' });
    }
  }
);

/**
 * Check exam card eligibility
 * GET /api/exam-cards/eligibility/:studentId
 */
router.get('/eligibility/:studentId',
  requirePermission('examcards:read'),
  [
    query('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester is required'),
    query('year').isInt({ min: 1, max: 6 }).withMessage('Valid year is required'),
    query('academicYear').isString().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId } = req.params;
      const { semester, year, academicYear } = req.query;

      // Check student exists
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Check fees clearance
      const feesClearanceQuery = await db.collection('clearance_forms')
        .where('studentId', '==', studentId)
        .where('type', '==', 'fees')
        .where('academicYear', '==', academicYear)
        .where('status', '==', 'approved')
        .get();

      const hasFeesCleared = !feesClearanceQuery.empty;

      // Check unit registrations
      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .where('semester', '==', parseInt(semester))
        .where('year', '==', parseInt(year))
        .where('academicYear', '==', academicYear)
        .get();

      const hasUnitsRegistered = !registrationsQuery.empty;

      // Check academic standing (no pending disciplinary issues)
      const disciplinaryQuery = await db.collection('disciplinary_actions')
        .where('studentId', '==', studentId)
        .where('status', '==', 'active')
        .get();

      const hasDisciplinaryIssues = !disciplinaryQuery.empty;

      const eligibility = {
        feesCleared: hasFeesCleared,
        unitsRegistered: hasUnitsRegistered,
        noDisciplinaryIssues: !hasDisciplinaryIssues,
        eligible: hasFeesCleared && hasUnitsRegistered && !hasDisciplinaryIssues,
        issues: []
      };

      // Add specific issues
      if (!hasFeesCleared) {
        eligibility.issues.push('Fees not cleared');
      }
      if (!hasUnitsRegistered) {
        eligibility.issues.push('No units registered for this semester');
      }
      if (hasDisciplinaryIssues) {
        eligibility.issues.push('Pending disciplinary issues');
      }

      res.json({
        studentId,
        semester: parseInt(semester),
        year: parseInt(year),
        academicYear,
        eligibility
      });

    } catch (error) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({ error: 'Failed to check eligibility' });
    }
  }
);

/**
 * Get exam schedules for a course/department
 * GET /api/exam-cards/schedules
 */
router.get('/schedules',
  requirePermission('examcards:read'),
  [
    query('course').optional().isString(),
    query('department').optional().isString(),
    query('semester').isInt({ min: 1, max: 3 }).withMessage('Valid semester is required'),
    query('year').isInt({ min: 1, max: 6 }).withMessage('Valid year is required'),
    query('academicYear').isString().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { course, department, semester, year, academicYear } = req.query;

      // Build query for exam schedules
      let schedulesQuery = db.collection('exam_schedules')
        .where('semester', '==', parseInt(semester))
        .where('year', '==', parseInt(year))
        .where('academicYear', '==', academicYear);

      // Apply additional filters if provided
      if (course) {
        schedulesQuery = schedulesQuery.where('course', '==', course);
      }
      if (department) {
        schedulesQuery = schedulesQuery.where('department', '==', department);
      }

      const schedulesSnapshot = await schedulesQuery.orderBy('examDate').get();
      
      const schedules = [];
      for (const doc of schedulesSnapshot.docs) {
        const scheduleData = doc.data();
        
        // Get unit details
        const unitDoc = await db.collection('units').doc(scheduleData.unitId).get();
        const unitData = unitDoc.exists ? unitDoc.data() : null;

        schedules.push({
          id: doc.id,
          ...scheduleData,
          unit: unitData ? { id: unitDoc.id, ...unitData } : null
        });
      }

      res.json({
        schedules,
        count: schedules.length,
        filters: { course, department, semester: parseInt(semester), year: parseInt(year), academicYear }
      });

    } catch (error) {
      console.error('Error fetching exam schedules:', error);
      res.status(500).json({ error: 'Failed to fetch exam schedules' });
    }
  }
);

export default router;
