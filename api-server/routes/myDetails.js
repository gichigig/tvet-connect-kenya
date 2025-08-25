import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { authenticateStudent } from '../middleware/authenticateStudent.js';

const router = express.Router();

/**
 * GET /api/me/details
 * Fetches the logged-in student's profile and grades.
 * Protected by student-only JWT authentication.
 */
router.get('/details', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student; // From JWT payload
    const db = getFirestore();
    const rtdb = getDatabase();

    // 1. Fetch student profile from Firestore first, then Realtime DB as fallback
    let studentData = null;
    let studentId = null;

    // Try Firestore first
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentData = studentsQuery.docs[0].data();
      studentId = studentsQuery.docs[0].id;
    } else {
      // Fallback to Realtime Database
      const rtdbStudentsRef = rtdb.ref('students');
      const rtdbSnapshot = await rtdbStudentsRef.orderByChild('admissionNumber').equalTo(admissionNumber).once('value');
      
      if (rtdbSnapshot.exists()) {
        const rtdbData = rtdbSnapshot.val();
        const studentKey = Object.keys(rtdbData)[0];
        studentData = rtdbData[studentKey];
        studentId = studentKey;
      }
    }

    if (!studentData) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // 2. Fetch student grades from Firestore
    const gradesQuery = await db.collection('grades').where('studentId', '==', studentId).get();
    const gradesList = gradesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Combine and return the data
    res.json({
      profile: {
        id: studentId,
        ...studentData
      },
      grades: gradesList,
    });

  } catch (error) {
    console.error('Failed to fetch student details:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

/**
 * GET /api/me/profile
 * Alternative endpoint for student profile (for compatibility)
 */
router.get('/profile', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();
    const rtdb = getDatabase();

    // Try Firestore first
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    let studentData = null;
    let studentId = null;

    if (!studentsQuery.empty) {
      studentData = studentsQuery.docs[0].data();
      studentId = studentsQuery.docs[0].id;
    } else {
      // Fallback to Realtime Database using email
      const rtdbStudentsRef = rtdb.ref('students');
      const rtdbSnapshot = await rtdbStudentsRef.orderByChild('email').equalTo(email).once('value');
      
      if (rtdbSnapshot.exists()) {
        const rtdbData = rtdbSnapshot.val();
        const studentKey = Object.keys(rtdbData)[0];
        studentData = rtdbData[studentKey];
        studentId = studentKey;
      }
    }

    if (!studentData) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    res.json({
      success: true,
      profile: {
        id: studentId,
        ...studentData
      },
      student: {
        id: studentId,
        ...studentData
      }
    });

  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /api/me/grades
 * Get grades for the authenticated student
 */
router.get('/grades', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();

    // Find student first
    let studentId = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentId = emailQuery.docs[0].id;
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch grades - try multiple collection names
    let grades = [];
    
    // Try 'grades' collection first
    const gradesQuery = await db.collection('grades').where('studentId', '==', studentId).get();
    if (!gradesQuery.empty) {
      grades = gradesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Try 'exam_results' collection
      const examResultsQuery = await db.collection('exam_results').where('studentId', '==', studentId).get();
      grades = examResultsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    res.json({
      success: true,
      grades: grades
    });

  } catch (error) {
    console.error('Failed to fetch student grades:', error);
    res.status(500).json({ error: 'Failed to fetch student grades' });
  }
});

/**
 * GET /api/me/fees
 * Get fees information for the authenticated student
 */
router.get('/fees', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();

    // Find student first
    let studentId = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentId = emailQuery.docs[0].id;
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch fees from multiple possible collections
    let fees = [];
    
    // Try 'student_fees' collection first
    const feesQuery = await db.collection('student_fees').where('studentId', '==', studentId).get();
    if (!feesQuery.empty) {
      fees = feesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Try 'fees' collection with different structure
      const generalFeesQuery = await db.collection('fees').where('studentId', '==', studentId).get();
      fees = generalFeesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    res.json({
      success: true,
      fees: fees
    });

  } catch (error) {
    console.error('Failed to fetch student fees:', error);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
});

/**
 * GET /api/me/payments
 * Get payment history for the authenticated student
 */
router.get('/payments', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();

    // Find student first
    let studentId = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentId = emailQuery.docs[0].id;
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch payments
    let payments = [];
    const paymentsQuery = await db.collection('payments').where('studentId', '==', studentId).get();
    payments = paymentsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Failed to fetch student payments:', error);
    res.status(500).json({ error: 'Failed to fetch student payments' });
  }
});

/**
 * GET /api/me/available-units
 * Get available units for registration for the authenticated student
 */
router.get('/available-units', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();

    // Find student first to get their course and year
    let studentData = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentData = studentsQuery.docs[0].data();
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentData = emailQuery.docs[0].data();
      }
    }

    if (!studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get student ID for checking registrations
    let studentId = null;
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
    } else {
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentId = emailQuery.docs[0].id;
      }
    }

    // Fetch available units based on student's course
    let units = [];
    const unitsQuery = await db.collection('units')
      .where('course', '==', studentData.course || studentData.courseName)
      .get();
    
    units = unitsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get student's existing registrations to mark units as registered
    let registeredUnitIds = [];
    if (studentId) {
      const registrationsQuery = await db.collection('unit_registrations')
        .where('studentId', '==', studentId)
        .get();
      
      registeredUnitIds = registrationsQuery.docs.map(doc => doc.data().unitId);
    }

    // Mark units as registered if student already registered for them
    units = units.map(unit => ({
      ...unit,
      isRegistered: registeredUnitIds.includes(unit.id)
    }));

    res.json({
      success: true,
      units: units
    });

  } catch (error) {
    console.error('Failed to fetch available units:', error);
    res.status(500).json({ error: 'Failed to fetch available units' });
  }
});

/**
 * GET /api/me/registered-units
 * Get unit registrations for the authenticated student
 */
router.get('/registered-units', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const db = getFirestore();

    // Find student first
    let studentId = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      studentId = studentsQuery.docs[0].id;
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        studentId = emailQuery.docs[0].id;
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch unit registrations
    let registrations = [];
    const registrationsQuery = await db.collection('unit_registrations').where('studentId', '==', studentId).get();
    registrations = registrationsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      registrations: registrations
    });

  } catch (error) {
    console.error('Failed to fetch unit registrations:', error);
    res.status(500).json({ error: 'Failed to fetch unit registrations' });
  }
});

/**
 * POST /api/me/register-unit
 * Register for a unit
 */
router.post('/register-unit', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const { unitId } = req.body;
    const db = getFirestore();

    if (!unitId) {
      return res.status(400).json({ error: 'Unit ID is required' });
    }

    // Find student first
    let studentId = null;
    let studentData = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      const studentDoc = studentsQuery.docs[0];
      studentId = studentDoc.id;
      studentData = studentDoc.data();
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        const studentDoc = emailQuery.docs[0];
        studentId = studentDoc.id;
        studentData = studentDoc.data();
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student is already registered for this unit
    const existingRegistration = await db.collection('unit_registrations')
      .where('studentId', '==', studentId)
      .where('unitId', '==', unitId)
      .limit(1)
      .get();

    if (!existingRegistration.empty) {
      return res.status(400).json({ 
        error: 'You are already registered for this unit',
        isAlreadyRegistered: true 
      });
    }

    // Get unit details
    const unitDoc = await db.collection('units').doc(unitId).get();
    if (!unitDoc.exists) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const unitData = unitDoc.data();

    // Check if student should register for ALL units of their semester/course
    // Get all required units for this student's course and year
    const requiredUnitsQuery = await db.collection('units')
      .where('course', '==', studentData.course || studentData.courseName)
      .where('year', '==', unitData.year)
      .where('semester', '==', unitData.semester)
      .get();
    
    const requiredUnits = requiredUnitsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Check how many units the student has already registered for in this semester
    const existingRegistrationsQuery = await db.collection('unit_registrations')
      .where('studentId', '==', studentId)
      .where('semester', '==', unitData.semester)
      .where('year', '==', unitData.year)
      .get();
    
    const existingRegistrations = existingRegistrationsQuery.docs.map(doc => doc.data());
    const registeredUnitIds = existingRegistrations.map(reg => reg.unitId);
    
    // If this is their first unit registration for this semester, 
    // ensure they register for ALL required units
    if (existingRegistrations.length === 0) {
      const unregisteredUnits = requiredUnits.filter(unit => !registeredUnitIds.includes(unit.id));
      
      if (unregisteredUnits.length > 1) {
        return res.status(400).json({ 
          error: 'You must register for all units in your semester at once',
          requiredUnits: requiredUnits.map(u => ({ id: u.id, code: u.code, name: u.name })),
          message: `You need to register for all ${requiredUnits.length} units for this semester`
        });
      }
    }

    // Create unit registration
    const registration = {
      studentId: studentId,
      unitId: unitId,
      unitCode: unitData.code,
      unitName: unitData.name,
      status: 'pending',
      dateRegistered: new Date().toISOString(),
      semester: unitData.semester,
      year: unitData.year,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('unit_registrations').add(registration);

    res.json({
      success: true,
      registrationId: docRef.id,
      message: 'Unit registration submitted successfully'
    });

  } catch (error) {
    console.error('Failed to register unit:', error);
    res.status(500).json({ error: 'Failed to register unit' });
  }
});

/**
 * POST /api/me/register-semester-units
 * Register for all units in a semester (bulk registration)
 */
router.post('/register-semester-units', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const { semester, year } = req.body;
    const db = getFirestore();

    if (!semester || !year) {
      return res.status(400).json({ error: 'Semester and year are required' });
    }

    // Find student first
    let studentId = null;
    let studentData = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      const studentDoc = studentsQuery.docs[0];
      studentId = studentDoc.id;
      studentData = studentDoc.data();
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        const studentDoc = emailQuery.docs[0];
        studentId = studentDoc.id;
        studentData = studentDoc.data();
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all units for this course, year, and semester
    const unitsQuery = await db.collection('units')
      .where('course', '==', studentData.course || studentData.courseName)
      .where('year', '==', parseInt(year))
      .where('semester', '==', semester)
      .get();

    if (unitsQuery.empty) {
      return res.status(404).json({ error: 'No units found for this semester' });
    }

    const units = unitsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Check if student has already registered for any units in this semester
    const existingRegistrationsQuery = await db.collection('unit_registrations')
      .where('studentId', '==', studentId)
      .where('semester', '==', semester)
      .where('year', '==', parseInt(year))
      .get();

    if (!existingRegistrationsQuery.empty) {
      return res.status(400).json({ 
        error: 'You have already registered for units in this semester',
        existingRegistrations: existingRegistrationsQuery.size
      });
    }

    // Create registrations for all units
    const batch = db.batch();
    const registrationIds = [];

    units.forEach(unit => {
      const docRef = db.collection('unit_registrations').doc();
      const registration = {
        studentId: studentId,
        unitId: unit.id,
        unitCode: unit.code,
        unitName: unit.name,
        status: 'pending',
        dateRegistered: new Date().toISOString(),
        semester: semester,
        year: parseInt(year),
        createdAt: new Date().toISOString()
      };
      
      batch.set(docRef, registration);
      registrationIds.push(docRef.id);
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Successfully registered for all ${units.length} units in ${semester} semester`,
      registrationIds: registrationIds,
      unitsRegistered: units.length
    });

  } catch (error) {
    console.error('Failed to register for semester units:', error);
    res.status(500).json({ error: 'Failed to register for semester units' });
  }
});

/**
 * POST /api/me/semester/register
 * Register for a semester
 */
router.post('/semester/register', authenticateStudent, async (req, res) => {
  try {
    const { admissionNumber, email } = req.student;
    const { semesterId } = req.body;
    const db = getFirestore();

    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required' });
    }

    // Find student first
    let studentId = null;
    let studentData = null;
    const studentsQuery = await db.collection('students').where('admissionNumber', '==', admissionNumber).limit(1).get();
    
    if (!studentsQuery.empty) {
      const studentDoc = studentsQuery.docs[0];
      studentId = studentDoc.id;
      studentData = studentDoc.data();
    } else {
      // Try by email as fallback
      const emailQuery = await db.collection('students').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        const studentDoc = emailQuery.docs[0];
        studentId = studentDoc.id;
        studentData = studentDoc.data();
      }
    }

    if (!studentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create semester registration record
    const registration = {
      studentId: studentId,
      semesterId: semesterId,
      status: 'registered',
      dateRegistered: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('semester_registrations').add(registration);

    res.json({
      success: true,
      registrationId: docRef.id,
      message: 'Semester registration successful'
    });

  } catch (error) {
    console.error('Failed to register semester:', error);
    res.status(500).json({ error: 'Failed to register semester' });
  }
});

/**
 * GET /api/me/semesters
 * Get available semesters
 */
router.get('/semesters', authenticateStudent, async (req, res) => {
  try {
    const db = getFirestore();

    // Fetch available semesters
    let semesters = [];
    const semestersQuery = await db.collection('semesters').get();
    semesters = semestersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      semesters: semesters
    });

  } catch (error) {
    console.error('Failed to fetch semesters:', error);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
});

export default router;
