// Routes for semester plan enhanced features
// Includes: sync status, dashboard content, attendance, online classes

import express from 'express';

const router = express.Router();

// In-memory storage for enhanced features (in production, use a database)
const studentSyncStatus = new Map(); // Feature 1: Persistent Unit Syncing
const lecturerDashboardContent = new Map(); // Feature 2: Cross-Dashboard Sync
const studentDashboardContent = new Map(); // Feature 2: Cross-Dashboard Sync  
const attendanceSessions = new Map(); // Feature 4: Attendance Management
const onlineClasses = new Map(); // Feature 5: Online Class Management
const unitStudents = new Map(); // Student-Unit relationships

// ===== FEATURE 1: PERSISTENT UNIT SYNCING =====

// Save student sync status
router.post('/sync-status/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { lastSyncTime } = req.body;
  
  console.log(`Saving sync status for student: ${studentId}, lastSyncTime: ${lastSyncTime}`);
  
  studentSyncStatus.set(studentId, {
    studentId,
    lastSyncTime,
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Sync status saved successfully',
    studentId,
    lastSyncTime
  });
});

// Get student sync status
router.get('/sync-status/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  console.log(`Getting sync status for student: ${studentId}`);
  
  if (studentSyncStatus.has(studentId)) {
    const syncData = studentSyncStatus.get(studentId);
    res.json({
      lastSyncTime: syncData.lastSyncTime
    });
  } else {
    res.status(404).json({
      error: 'Sync status not found',
      lastSyncTime: null
    });
  }
});

// ===== FEATURE 2: CROSS-DASHBOARD SYNCHRONIZATION =====

// Save lecturer dashboard content
router.post('/dashboard-content', (req, res) => {
  const contentData = req.body;
  const { lecturerId, unitId } = contentData;
  
  console.log(`Saving lecturer dashboard content for lecturer: ${lecturerId}, unit: ${unitId}`);
  
  const contentId = `${lecturerId}_${unitId}_${Date.now()}`;
  const content = {
    id: contentId,
    ...contentData,
    createdAt: new Date().toISOString()
  };
  
  if (!lecturerDashboardContent.has(lecturerId)) {
    lecturerDashboardContent.set(lecturerId, []);
  }
  
  lecturerDashboardContent.get(lecturerId).push(content);
  
  // Also sync to all students registered for this unit
  if (unitStudents.has(unitId)) {
    const students = unitStudents.get(unitId);
    students.forEach(student => {
      if (!studentDashboardContent.has(student.id)) {
        studentDashboardContent.set(student.id, []);
      }
      studentDashboardContent.get(student.id).push({
        ...content,
        studentId: student.id,
        isFromSemesterPlan: true
      });
    });
  }
  
  res.json({
    message: 'Dashboard content saved and synced successfully',
    contentId,
    syncedToStudents: unitStudents.get(unitId)?.length || 0
  });
});

// Get lecturer dashboard content
router.get('/:lecturerId/dashboard-content', (req, res) => {
  const { lecturerId } = req.params;
  
  console.log(`Getting dashboard content for lecturer: ${lecturerId}`);
  
  const content = lecturerDashboardContent.get(lecturerId) || [];
  
  res.json({
    content,
    totalCount: content.length
  });
});

// Save student dashboard content
router.post('/:studentId/dashboard-content', (req, res) => {
  const { studentId } = req.params;
  const contentData = req.body;
  
  console.log(`Saving student dashboard content for student: ${studentId}`);
  
  const contentId = `${studentId}_${Date.now()}`;
  const content = {
    id: contentId,
    ...contentData,
    studentId,
    createdAt: new Date().toISOString()
  };
  
  if (!studentDashboardContent.has(studentId)) {
    studentDashboardContent.set(studentId, []);
  }
  
  studentDashboardContent.get(studentId).push(content);
  
  res.json({
    message: 'Student dashboard content saved successfully',
    contentId
  });
});

// Get student dashboard content
router.get('/:studentId/dashboard-content', (req, res) => {
  const { studentId } = req.params;
  
  console.log(`Getting dashboard content for student: ${studentId}`);
  
  const content = studentDashboardContent.get(studentId) || [];
  
  res.json({
    content,
    totalCount: content.length
  });
});

// Get students for a unit (for cross-sync)
router.get('/:unitId/students', (req, res) => {
  const { unitId } = req.params;
  
  console.log(`Getting students for unit: ${unitId}`);
  
  const students = unitStudents.get(unitId) || [];
  
  res.json({
    students,
    totalCount: students.length
  });
});

// Register student to unit (for testing)
router.post('/:unitId/students', (req, res) => {
  const { unitId } = req.params;
  const { studentId, name, email } = req.body;
  
  console.log(`Registering student ${studentId} to unit ${unitId}`);
  
  if (!unitStudents.has(unitId)) {
    unitStudents.set(unitId, []);
  }
  
  const students = unitStudents.get(unitId);
  if (!students.find(s => s.id === studentId)) {
    students.push({ id: studentId, name, email });
  }
  
  res.json({
    message: 'Student registered to unit successfully',
    studentId,
    unitId
  });
});

// ===== FEATURE 4: ATTENDANCE SESSION MANAGEMENT =====

// Save attendance session to semester plan
router.post('/semester-plans/:planId/attendance', (req, res) => {
  const { planId } = req.params;
  const attendanceData = req.body;
  
  console.log(`Saving attendance session for plan: ${planId}`);
  
  const sessionId = `attendance_${planId}_${Date.now()}`;
  const session = {
    id: sessionId,
    planId,
    ...attendanceData,
    createdAt: new Date().toISOString()
  };
  
  if (!attendanceSessions.has(planId)) {
    attendanceSessions.set(planId, []);
  }
  
  attendanceSessions.get(planId).push(session);
  
  res.json({
    message: 'Attendance session saved successfully',
    sessionId,
    session
  });
});

// Get attendance sessions for semester plan
router.get('/semester-plans/:planId/attendance', (req, res) => {
  const { planId } = req.params;
  
  console.log(`Getting attendance sessions for plan: ${planId}`);
  
  const sessions = attendanceSessions.get(planId) || [];
  
  res.json({
    sessions,
    totalCount: sessions.length
  });
});

// Sync attendance to lecturer dashboard
router.post('/dashboard/attendance', (req, res) => {
  const { attendanceSessionId, unitId, lecturerId } = req.body;
  
  console.log(`Syncing attendance session ${attendanceSessionId} to lecturer dashboard`);
  
  // Find the attendance session
  let session = null;
  for (const [planId, sessions] of attendanceSessions.entries()) {
    session = sessions.find(s => s.id === attendanceSessionId);
    if (session) break;
  }
  
  if (!session) {
    return res.status(404).json({ error: 'Attendance session not found' });
  }
  
  // Add to lecturer dashboard
  if (!lecturerDashboardContent.has(lecturerId)) {
    lecturerDashboardContent.set(lecturerId, []);
  }
  
  lecturerDashboardContent.get(lecturerId).push({
    id: `lecturer_attendance_${Date.now()}`,
    type: 'attendance',
    attendanceSession: session,
    unitId,
    lecturerId,
    isFromSemesterPlan: true,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Attendance session synced to lecturer dashboard',
    sessionId: attendanceSessionId
  });
});

// Sync attendance to student dashboard
router.post('/:studentId/dashboard/attendance', (req, res) => {
  const { studentId } = req.params;
  const { attendanceSessionId, unitId } = req.body;
  
  console.log(`Syncing attendance session ${attendanceSessionId} to student dashboard`);
  
  // Find the attendance session
  let session = null;
  for (const [planId, sessions] of attendanceSessions.entries()) {
    session = sessions.find(s => s.id === attendanceSessionId);
    if (session) break;
  }
  
  if (!session) {
    return res.status(404).json({ error: 'Attendance session not found' });
  }
  
  // Add to student dashboard
  if (!studentDashboardContent.has(studentId)) {
    studentDashboardContent.set(studentId, []);
  }
  
  studentDashboardContent.get(studentId).push({
    id: `student_attendance_${Date.now()}`,
    type: 'attendance',
    attendanceSession: session,
    unitId,
    studentId,
    isFromSemesterPlan: true,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Attendance session synced to student dashboard',
    sessionId: attendanceSessionId
  });
});

// Get active attendance sessions for a student (based on enrolled units)
router.get('/:studentId/attendance-sessions', (req, res) => {
  const { studentId } = req.params;
  
  console.log(`Getting active attendance sessions for student: ${studentId}`);
  
  // Get student's content to find attendance sessions
  const studentContent = studentDashboardContent.get(studentId) || [];
  const studentAttendanceSessions = studentContent
    .filter(content => content.type === 'attendance')
    .map(content => ({
      id: content.attendanceSession.id,
      unitCode: content.attendanceSession.unitCode || 'Unknown',
      unitName: content.attendanceSession.unitName || 'Unknown Unit',
      lecturer: content.attendanceSession.lecturer || 'Unknown',
      date: content.attendanceSession.date,
      startTime: content.attendanceSession.startTime,
      endTime: content.attendanceSession.endTime,
      type: 'manual',
      isActive: true,
      attendanceCode: content.attendanceSession.attendanceCode,
      description: content.attendanceSession.description || content.attendanceSession.title
    }));
  
  // Also get all attendance sessions and filter by student's units
  const allActiveSessions = [];
  for (const [planId, sessions] of attendanceSessions.entries()) {
    const activeSessions = sessions.filter(session => {
      // Check if this session is for today and still active
      const sessionDateStr = session.date; // YYYY-MM-DD format
      const todayStr = new Date().toISOString().split('T')[0]; // Also YYYY-MM-DD
      const isToday = sessionDateStr === todayStr;
      
      return isToday && session.isActive !== false;
    });
    allActiveSessions.push(...activeSessions);
  }
  
  res.json({
    sessions: [...studentAttendanceSessions, ...allActiveSessions],
    totalCount: studentAttendanceSessions.length + allActiveSessions.length
  });
});

// ===== FEATURE 5: ONLINE CLASS MANAGEMENT =====

// Save online class to semester plan
router.post('/semester-plans/:planId/online-classes', (req, res) => {
  const { planId } = req.params;
  const classData = req.body;
  
  console.log(`Saving online class for plan: ${planId}`);
  
  const classId = `online_class_${planId}_${Date.now()}`;
  const onlineClass = {
    id: classId,
    planId,
    ...classData,
    createdAt: new Date().toISOString()
  };
  
  if (!onlineClasses.has(planId)) {
    onlineClasses.set(planId, []);
  }
  
  onlineClasses.get(planId).push(onlineClass);
  
  res.json({
    message: 'Online class saved successfully',
    classId,
    onlineClass
  });
});

// Get online classes for semester plan
router.get('/semester-plans/:planId/online-classes', (req, res) => {
  const { planId } = req.params;
  
  console.log(`Getting online classes for plan: ${planId}`);
  
  const classes = onlineClasses.get(planId) || [];
  
  res.json({
    classes,
    totalCount: classes.length
  });
});

// Sync online class to lecturer dashboard
router.post('/dashboard/online-classes', (req, res) => {
  const { onlineClassId, unitId, lecturerId } = req.body;
  
  console.log(`Syncing online class ${onlineClassId} to lecturer dashboard`);
  
  // Find the online class
  let onlineClass = null;
  for (const [planId, classes] of onlineClasses.entries()) {
    onlineClass = classes.find(c => c.id === onlineClassId);
    if (onlineClass) break;
  }
  
  if (!onlineClass) {
    return res.status(404).json({ error: 'Online class not found' });
  }
  
  // Add to lecturer dashboard
  if (!lecturerDashboardContent.has(lecturerId)) {
    lecturerDashboardContent.set(lecturerId, []);
  }
  
  lecturerDashboardContent.get(lecturerId).push({
    id: `lecturer_online_class_${Date.now()}`,
    type: 'online-class',
    onlineClass: onlineClass,
    unitId,
    lecturerId,
    isFromSemesterPlan: true,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Online class synced to lecturer dashboard',
    classId: onlineClassId
  });
});

// Sync online class to student dashboard
router.post('/:studentId/dashboard/online-classes', (req, res) => {
  const { studentId } = req.params;
  const { onlineClassId, unitId } = req.body;
  
  console.log(`Syncing online class ${onlineClassId} to student dashboard`);
  
  // Find the online class
  let onlineClass = null;
  for (const [planId, classes] of onlineClasses.entries()) {
    onlineClass = classes.find(c => c.id === onlineClassId);
    if (onlineClass) break;
  }
  
  if (!onlineClass) {
    return res.status(404).json({ error: 'Online class not found' });
  }
  
  // Add to student dashboard
  if (!studentDashboardContent.has(studentId)) {
    studentDashboardContent.set(studentId, []);
  }
  
  studentDashboardContent.get(studentId).push({
    id: `student_online_class_${Date.now()}`,
    type: 'online-class',
    onlineClass: onlineClass,
    unitId,
    studentId,
    isFromSemesterPlan: true,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Online class synced to student dashboard',
    classId: onlineClassId
  });
});

export default router;
