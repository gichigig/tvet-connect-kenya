// Comprehensive TVET Connect Kenya API Server
// Supports all implemented features with in-memory storage

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage for all features
const semesterPlans = new Map();
const studentSyncStatus = new Map(); // Feature 1: Persistent Unit Syncing
const lecturerDashboardContent = new Map(); // Feature 2: Cross-Dashboard Sync
const studentDashboardContent = new Map(); // Feature 2: Cross-Dashboard Sync
const attendanceSessions = new Map(); // Feature 4: Attendance Management
const onlineClasses = new Map(); // Feature 5: Online Class Management
const unitStudents = new Map(); // Student-Unit relationships

// API Key middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'tvet_1fd0f562039f427aac9bf7bdf515b804') {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TVET Connect Kenya API (Local)',
    storedPlans: semesterPlans.size,
    syncStatuses: studentSyncStatus.size,
    lecturerContent: lecturerDashboardContent.size,
    studentContent: studentDashboardContent.size,
    attendanceSessions: attendanceSessions.size,
    onlineClasses: onlineClasses.size,
    unitStudents: unitStudents.size
  });
});

// ===== FEATURE 1: PERSISTENT UNIT SYNCING =====

// Save student sync status
app.post('/api/students/sync-status/:studentId', authenticateApiKey, (req, res) => {
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
app.get('/api/students/sync-status/:studentId', authenticateApiKey, (req, res) => {
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
app.post('/api/lecturer/dashboard-content', authenticateApiKey, (req, res) => {
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
app.get('/api/lecturer/:lecturerId/dashboard-content', authenticateApiKey, (req, res) => {
  const { lecturerId } = req.params;
  
  console.log(`Getting dashboard content for lecturer: ${lecturerId}`);
  
  const content = lecturerDashboardContent.get(lecturerId) || [];
  
  res.json({
    content,
    totalCount: content.length
  });
});

// Save student dashboard content
app.post('/api/students/:studentId/dashboard-content', authenticateApiKey, (req, res) => {
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
app.get('/api/students/:studentId/dashboard-content', authenticateApiKey, (req, res) => {
  const { studentId } = req.params;
  
  console.log(`Getting dashboard content for student: ${studentId}`);
  
  const content = studentDashboardContent.get(studentId) || [];
  
  res.json({
    content,
    totalCount: content.length
  });
});

// Get students for a unit (for cross-sync)
app.get('/api/units/:unitId/students', authenticateApiKey, (req, res) => {
  const { unitId } = req.params;
  
  console.log(`Getting students for unit: ${unitId}`);
  
  const students = unitStudents.get(unitId) || [];
  
  res.json({
    students,
    totalCount: students.length
  });
});

// Register student to unit (for testing)
app.post('/api/units/:unitId/students', authenticateApiKey, (req, res) => {
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
app.post('/api/semester-plans/:planId/attendance', authenticateApiKey, (req, res) => {
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
app.get('/api/semester-plans/:planId/attendance', authenticateApiKey, (req, res) => {
  const { planId } = req.params;
  
  console.log(`Getting attendance sessions for plan: ${planId}`);
  
  const sessions = attendanceSessions.get(planId) || [];
  
  res.json({
    sessions,
    totalCount: sessions.length
  });
});

// Sync attendance to lecturer dashboard
app.post('/api/lecturer/dashboard/attendance', authenticateApiKey, (req, res) => {
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
app.post('/api/students/:studentId/dashboard/attendance', authenticateApiKey, (req, res) => {
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

// ===== FEATURE 5: ONLINE CLASS MANAGEMENT =====

// Save online class to semester plan
app.post('/api/semester-plans/:planId/online-classes', authenticateApiKey, (req, res) => {
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
app.get('/api/semester-plans/:planId/online-classes', authenticateApiKey, (req, res) => {
  const { planId } = req.params;
  
  console.log(`Getting online classes for plan: ${planId}`);
  
  const classes = onlineClasses.get(planId) || [];
  
  res.json({
    classes,
    totalCount: classes.length
  });
});

// Sync online class to lecturer dashboard
app.post('/api/lecturer/dashboard/online-classes', authenticateApiKey, (req, res) => {
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
app.post('/api/students/:studentId/dashboard/online-classes', authenticateApiKey, (req, res) => {
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

// ===== EXISTING SEMESTER PLAN ENDPOINTS =====

// Get semester plan
app.get('/api/semester/plans/:unitId', authenticateApiKey, (req, res) => {
  const { unitId } = req.params;
  
  console.log(`Local API - Getting semester plan for unit: ${unitId}`);
  
  if (semesterPlans.has(unitId)) {
    const plan = semesterPlans.get(unitId);
    console.log(`Local API - Found plan for ${unitId} with ${plan.weekPlans.length} weeks`);
    
    res.json({
      message: 'Semester plan retrieved successfully',
      plan: plan
    });
  } else {
    console.log(`Local API - No plan found for unit: ${unitId}`);
    res.status(404).json({
      error: 'Semester plan not found',
      plan: {
        semesterStart: null,
        semesterWeeks: 15,
        weekPlans: []
      }
    });
  }
});

// Create/Update semester plan
app.post('/api/semester/plans/:unitId', authenticateApiKey, (req, res) => {
  const { unitId } = req.params;
  const planData = req.body;
  
  console.log(`Local API - Saving semester plan for unit: ${unitId}`);
  console.log(`Local API - Plan has ${planData.weekPlans?.length || 0} weeks`);
  
  // Store the plan
  semesterPlans.set(unitId, {
    unitId: unitId,
    ...planData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  console.log(`Local API - Successfully saved plan for ${unitId}`);
  console.log(`Local API - Total stored plans: ${semesterPlans.size}`);
  
  res.json({
    message: 'Semester plan saved successfully',
    planId: `${unitId}_${Date.now()}`,
    unitId: unitId
  });
});

// List all stored plans (for debugging)
app.get('/api/semester/plans', authenticateApiKey, (req, res) => {
  const plans = Array.from(semesterPlans.entries()).map(([unitId, plan]) => ({
    unitId: unitId,
    semesterStart: plan.semesterStart,
    semesterWeeks: plan.semesterWeeks,
    weekCount: plan.weekPlans?.length || 0,
    createdAt: plan.createdAt
  }));
  
  res.json({
    message: 'All semester plans',
    plans: plans,
    totalCount: plans.length
  });
});

const PORT = 3002; // Use different port to avoid conflicts

app.listen(PORT, () => {
  console.log(`🚀 TVET Connect Kenya API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💾 In-memory storage ready for all features:`);
  console.log(`   📚 Semester Plans`);
  console.log(`   🔄 Student Sync Status (Feature 1)`);
  console.log(`   📊 Cross-Dashboard Content (Feature 2)`);
  console.log(`   📈 Progress Tracking (Feature 3 - Frontend only)`);
  console.log(`   👥 Attendance Sessions (Feature 4)`);
  console.log(`   💻 Online Classes (Feature 5)`);
  console.log(`🎯 All 5 features integrated and ready for testing!`);
});

export default app;
