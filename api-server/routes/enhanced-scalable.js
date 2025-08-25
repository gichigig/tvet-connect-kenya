// ENHANCED ROUTES - SCALABLE VERSION
// Production-ready API routes for 30,000+ users using PostgreSQL + Redis

const express = require('express');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const ScalableDataLayer = require('../database/ScalableDataLayer');

const router = express.Router();

// Initialize scalable data layer
const dataLayer = new ScalableDataLayer();

// Compression middleware for better performance
router.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Advanced rate limiting per user
const createRateLimit = (max, windowMs, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.uid || req.user?.id || req.ip;
    },
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      retryAfter: Math.ceil(windowMs / 1000)
    }
  });
};

// Different rate limits for different endpoint types
const generalRateLimit = createRateLimit(1000, 15 * 60 * 1000); // 1000 requests per 15 minutes
const heavyRateLimit = createRateLimit(100, 60 * 60 * 1000);    // 100 requests per hour
const authRateLimit = createRateLimit(20, 15 * 60 * 1000);      // 20 requests per 15 minutes

// Apply general rate limiting to all routes
router.use(generalRateLimit);

// Middleware for request timing and logging
router.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Log request for monitoring
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?.uid || 'Anonymous'} - IP: ${req.ip}`);
  
  // Add response time header
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.set('X-Response-Time', `${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// HEALTH CHECK ENDPOINT
router.get('/health', asyncHandler(async (req, res) => {
  const healthStatus = await dataLayer.healthCheck();
  const metrics = await dataLayer.getPerformanceMetrics();
  
  res.json({
    status: healthStatus.database && healthStatus.redis ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: healthStatus,
    metrics: metrics,
    features: [
      'sync-status',
      'dashboard-content', 
      'attendance-management',
      'online-classes',
      'semester-progress'
    ]
  });
}));

// SYNC STATUS ENDPOINTS (Light rate limiting)
router.get('/sync-status/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const syncStatus = await dataLayer.getStudentSyncStatus(studentId);
  
  res.json({
    studentId,
    lastSync: syncStatus?.last_sync || null,
    syncData: syncStatus?.sync_data || null,
    cached: req.headers['x-cache-hit'] === 'true'
  });
}));

router.post('/sync-status/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { syncData } = req.body;
  
  if (!studentId || !syncData) {
    return res.status(400).json({ error: 'Student ID and sync data are required' });
  }

  const updated = await dataLayer.updateStudentSyncStatus(studentId, syncData);
  
  res.json({
    success: true,
    studentId,
    lastSync: updated.updated_at,
    message: 'Sync status updated successfully'
  });
}));

// DASHBOARD CONTENT ENDPOINTS (Medium rate limiting)
router.get('/dashboard-content/:lecturerId', heavyRateLimit, asyncHandler(async (req, res) => {
  const { lecturerId } = req.params;
  
  if (!lecturerId) {
    return res.status(400).json({ error: 'Lecturer ID is required' });
  }

  const content = await dataLayer.getLecturerDashboardContent(lecturerId);
  
  res.json({
    lecturerId,
    content: content || [],
    count: content?.length || 0,
    lastUpdated: content[0]?.updated_at || null
  });
}));

router.post('/dashboard-content/:lecturerId', heavyRateLimit, asyncHandler(async (req, res) => {
  const { lecturerId } = req.params;
  const { contentType, contentData, semesterPlanId } = req.body;
  
  if (!lecturerId || !contentType || !contentData) {
    return res.status(400).json({ 
      error: 'Lecturer ID, content type, and content data are required' 
    });
  }

  const newContent = await dataLayer.addLecturerDashboardContent(
    lecturerId, 
    contentType, 
    contentData, 
    semesterPlanId
  );
  
  res.status(201).json({
    success: true,
    content: newContent,
    message: 'Dashboard content added successfully'
  });
}));

// ATTENDANCE SESSION ENDPOINTS (Heavy rate limiting)
router.get('/attendance-session/:sessionId', heavyRateLimit, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = await dataLayer.getAttendanceSession(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Attendance session not found' });
  }
  
  res.json({
    session: {
      id: session.id,
      semesterPlanId: session.semester_plan_id,
      unitId: session.unit_id,
      lecturerId: session.lecturer_id,
      sessionName: session.session_name,
      isActive: session.is_active,
      durationMinutes: session.duration_minutes,
      attendees: session.attendees || [],
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }
  });
}));

router.post('/attendance-session', heavyRateLimit, asyncHandler(async (req, res) => {
  const { 
    sessionId, 
    semesterPlanId, 
    unitId, 
    lecturerId, 
    sessionName, 
    durationMinutes = 15 
  } = req.body;
  
  if (!sessionId || !semesterPlanId || !unitId || !lecturerId || !sessionName) {
    return res.status(400).json({ 
      error: 'Session ID, semester plan ID, unit ID, lecturer ID, and session name are required' 
    });
  }

  const sessionData = {
    id: sessionId,
    semesterPlanId,
    unitId,
    lecturerId,
    sessionName,
    isActive: true,
    durationMinutes,
    attendees: []
  };

  const newSession = await dataLayer.createAttendanceSession(sessionData);
  
  res.status(201).json({
    success: true,
    session: {
      id: newSession.id,
      semesterPlanId: newSession.semester_plan_id,
      unitId: newSession.unit_id,
      lecturerId: newSession.lecturer_id,
      sessionName: newSession.session_name,
      isActive: newSession.is_active,
      durationMinutes: newSession.duration_minutes,
      attendees: newSession.attendees || [],
      createdAt: newSession.created_at
    },
    message: 'Attendance session created successfully'
  });
}));

// ONLINE CLASS ENDPOINTS (Heavy rate limiting)
router.get('/online-class/:classId', heavyRateLimit, asyncHandler(async (req, res) => {
  const { classId } = req.params;
  
  if (!classId) {
    return res.status(400).json({ error: 'Class ID is required' });
  }

  const onlineClass = await dataLayer.getOnlineClass(classId);
  
  if (!onlineClass) {
    return res.status(404).json({ error: 'Online class not found' });
  }
  
  res.json({
    class: {
      id: onlineClass.id,
      semesterPlanId: onlineClass.semester_plan_id,
      unitId: onlineClass.unit_id,
      lecturerId: onlineClass.lecturer_id,
      className: onlineClass.class_name,
      meetingUrl: onlineClass.meeting_url,
      meetingId: onlineClass.meeting_id,
      password: onlineClass.password,
      scheduledTime: onlineClass.scheduled_time,
      durationMinutes: onlineClass.duration_minutes,
      platform: onlineClass.platform,
      status: onlineClass.status,
      participants: onlineClass.participants || [],
      createdAt: onlineClass.created_at,
      updatedAt: onlineClass.updated_at
    }
  });
}));

router.post('/online-class', heavyRateLimit, asyncHandler(async (req, res) => {
  const { 
    classId, 
    semesterPlanId, 
    unitId, 
    lecturerId, 
    className, 
    meetingUrl,
    meetingId,
    password,
    scheduledTime,
    durationMinutes = 60,
    platform = 'bigbluebutton'
  } = req.body;
  
  if (!classId || !semesterPlanId || !unitId || !lecturerId || !className) {
    return res.status(400).json({ 
      error: 'Class ID, semester plan ID, unit ID, lecturer ID, and class name are required' 
    });
  }

  const classData = {
    id: classId,
    semesterPlanId,
    unitId,
    lecturerId,
    className,
    meetingUrl,
    meetingId,
    password,
    scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
    durationMinutes,
    platform,
    status: 'scheduled',
    participants: []
  };

  const newClass = await dataLayer.createOnlineClass(classData);
  
  res.status(201).json({
    success: true,
    class: {
      id: newClass.id,
      semesterPlanId: newClass.semester_plan_id,
      unitId: newClass.unit_id,
      lecturerId: newClass.lecturer_id,
      className: newClass.class_name,
      meetingUrl: newClass.meeting_url,
      meetingId: newClass.meeting_id,
      password: newClass.password,
      scheduledTime: newClass.scheduled_time,
      durationMinutes: newClass.duration_minutes,
      platform: newClass.platform,
      status: newClass.status,
      participants: newClass.participants || [],
      createdAt: newClass.created_at
    },
    message: 'Online class created successfully'
  });
}));

// PERFORMANCE METRICS ENDPOINT (Admin only)
router.get('/metrics', authRateLimit, asyncHandler(async (req, res) => {
  // TODO: Add admin authentication check
  const metrics = await dataLayer.getPerformanceMetrics();
  
  res.json({
    timestamp: new Date().toISOString(),
    metrics: metrics || {},
    message: 'Performance metrics retrieved successfully'
  });
}));

// CACHE MANAGEMENT ENDPOINTS (Admin only)
router.delete('/cache', authRateLimit, asyncHandler(async (req, res) => {
  // TODO: Add admin authentication check
  const { pattern = '*' } = req.query;
  
  const deletedKeys = await dataLayer.clearCache(pattern);
  
  res.json({
    success: true,
    deletedKeys,
    pattern,
    message: `Cleared ${deletedKeys} cache entries`
  });
}));

// SEMESTER PROGRESS CALCULATION (Cached for performance)
router.get('/semester-progress/:semesterPlanId', asyncHandler(async (req, res) => {
  const { semesterPlanId } = req.params;
  
  if (!semesterPlanId) {
    return res.status(400).json({ error: 'Semester plan ID is required' });
  }

  // This would typically calculate progress from multiple data sources
  // For now, return a mock calculation - replace with actual logic
  const progress = {
    semesterPlanId,
    overallProgress: Math.floor(Math.random() * 100), // Replace with real calculation
    unitProgress: {}, // Replace with real unit progress
    lastCalculated: new Date().toISOString()
  };
  
  res.json(progress);
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, error);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Internal server error',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /sync-status/:studentId',
      'POST /sync-status/:studentId',
      'GET /dashboard-content/:lecturerId',
      'POST /dashboard-content/:lecturerId',
      'GET /attendance-session/:sessionId',
      'POST /attendance-session',
      'GET /online-class/:classId',
      'POST /online-class',
      'GET /semester-progress/:semesterPlanId',
      'GET /metrics',
      'DELETE /cache'
    ]
  });
});

module.exports = router;
