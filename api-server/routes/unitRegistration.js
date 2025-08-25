import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { authenticateStudent } from '../middleware/authenticateStudent.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Helper functions to get Firebase instances
const getDB = () => getFirestore();
const getRTDB = () => getDatabase();

/**
 * GET /api/me/available-units
 * Get available units for student's course and semester
 */
router.get('/available-units', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const { semester } = req.query;

    // Find student
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

    const targetSemester = semester || studentData.currentSemester || 1;

    // Get available units for the course and semester
    let unitsQuery = getDB().collection('units')
      .where('course', '==', studentData.course);

    if (targetSemester) {
      unitsQuery = unitsQuery.where('semester', '==', parseInt(targetSemester));
    }

    const unitsSnapshot = await unitsQuery.get();
    const availableUnits = unitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get student's registered units for this semester
    const registeredUnitsQuery = await getDB().collection('unitRegistrations')
      .where('studentId', '==', admissionNumber)
      .where('semester', '==', parseInt(targetSemester))
      .get();

    const registeredUnitIds = registeredUnitsQuery.docs.map(doc => doc.data().unitId);

    // Mark which units are already registered
    const unitsWithStatus = availableUnits.map(unit => ({
      ...unit,
      isRegistered: registeredUnitIds.includes(unit.id),
      canRegister: !registeredUnitIds.includes(unit.id)
    }));

    res.json({
      success: true,
      units: unitsWithStatus,
      semester: parseInt(targetSemester),
      course: studentData.course,
      totalAvailable: availableUnits.length,
      totalRegistered: registeredUnitIds.length
    });

  } catch (error) {
    console.error('Failed to fetch available units:', error);
    res.status(500).json({ error: 'Failed to fetch available units' });
  }
});

/**
 * GET /api/me/registered-units
 * Get student's registered units
 */
router.get('/registered-units', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber } = req.student;
    const { semester, academicYear } = req.query;

    let registrationsQuery = getDB().collection('unitRegistrations')
      .where('studentId', '==', admissionNumber);

    if (semester) {
      registrationsQuery = registrationsQuery.where('semester', '==', parseInt(semester));
    }

    if (academicYear) {
      registrationsQuery = registrationsQuery.where('academicYear', '==', academicYear);
    }

    const registrationsSnapshot = await registrationsQuery
      .orderBy('registeredAt', 'desc')
      .get();

    const registrations = [];

    for (const doc of registrationsSnapshot.docs) {
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
      totalRegistered: registrations.length
    });

  } catch (error) {
    console.error('Failed to fetch registered units:', error);
    res.status(500).json({ error: 'Failed to fetch registered units' });
  }
});

/**
 * POST /api/me/register-units
 * Register for units
 */
router.post('/register-units',
  authenticateStudent,
  [
    body('unitIds').isArray({ min: 1 }).withMessage('At least one unit must be selected'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester required'),
    body('academicYear').notEmpty().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { admissionNumber, email } = req.student;
      const { unitIds, semester, academicYear } = req.body;

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

      // Check if units exist and are valid for student's course
      const unitsSnapshot = await getDB().collection('units')
        .where('course', '==', studentData.course)
        .where('semester', '==', semester)
        .get();

      const validUnitIds = unitsSnapshot.docs.map(doc => doc.id);
      const invalidUnits = unitIds.filter(id => !validUnitIds.includes(id));

      if (invalidUnits.length > 0) {
        return res.status(400).json({ 
          error: 'Some units are not valid for your course or semester',
          invalidUnits
        });
      }

      // Check for existing registrations
      const existingRegistrations = await getDB().collection('unitRegistrations')
        .where('studentId', '==', admissionNumber)
        .where('semester', '==', semester)
        .where('academicYear', '==', academicYear)
        .get();

      const existingUnitIds = existingRegistrations.docs.map(doc => doc.data().unitId);
      const alreadyRegistered = unitIds.filter(id => existingUnitIds.includes(id));

      if (alreadyRegistered.length > 0) {
        return res.status(400).json({ 
          error: 'Some units are already registered',
          alreadyRegistered
        });
      }

      // Create registrations
      const registrations = [];
      const batch = getDB().batch();

      for (const unitId of unitIds) {
        const registration = {
          studentId: admissionNumber,
          studentName: `${studentData.firstName} ${studentData.lastName}`,
          course: studentData.course,
          unitId,
          semester,
          academicYear,
          status: 'registered',
          registeredAt: new Date().toISOString()
        };

        const docRef = getDB().collection('unitRegistrations').doc();
        batch.set(docRef, registration);
        registrations.push({ id: docRef.id, ...registration });
      }

      await batch.commit();

      res.json({
        success: true,
        message: `Successfully registered for ${unitIds.length} units`,
        registrations
      });

    } catch (error) {
      console.error('Failed to register units:', error);
      res.status(500).json({ error: 'Failed to register units' });
    }
  }
);

/**
 * DELETE /api/me/unregister-unit/:registrationId
 * Unregister from a unit
 */
router.delete('/unregister-unit/:registrationId', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber } = req.student;
    const { registrationId } = req.params;

    // Check if registration exists and belongs to student
    const registrationDoc = await getDB().collection('unitRegistrations').doc(registrationId).get();

    if (!registrationDoc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = registrationDoc.data();

    if (registration.studentId !== admissionNumber) {
      return res.status(403).json({ error: 'Unauthorized to modify this registration' });
    }

    // Check if registration can be cancelled (e.g., before semester starts)
    const registrationDate = new Date(registration.registeredAt);
    const now = new Date();
    const daysSinceRegistration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));

    if (daysSinceRegistration > 30) {
      return res.status(400).json({ 
        error: 'Cannot unregister from unit after 30 days of registration' 
      });
    }

    // Delete the registration
    await getDB().collection('unitRegistrations').doc(registrationId).delete();

    res.json({
      success: true,
      message: 'Successfully unregistered from unit'
    });

  } catch (error) {
    console.error('Failed to unregister unit:', error);
    res.status(500).json({ error: 'Failed to unregister unit' });
  }
});

export default router;
