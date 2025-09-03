// Load environment variables first
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

// Initialize Firebase immediately after env loading
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import serviceAccount from './serviceAccountKey.js';

if (!getApps().length) {
  console.log('Server: Initializing Firebase with Database URL:', process.env.FIREBASE_DATABASE_URL);
  
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('Server: Firebase initialized successfully');
}

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes AFTER Firebase is initialized
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import gradesRoutes from './routes/grades.js';
import semesterRoutes from './routes/semester.js';
import examCardsRoutes from './routes/examCards.js';
import apiKeyRoutes from './routes/apiKeys.js';
import myDetailsRoutes from './routes/myDetails.js';
import unitsRoutes from './routes/units.js';
import feesRoutes from './routes/fees.js';
import unitRegistrationRoutes from './routes/unitRegistration.js';
import adminRoutes from './routes/admin.js';
import hodRoutes from './routes/hod.js';
import financeRoutes from './routes/finance.js';
import uploadRoutes from './routes/upload.js';
import enhancedRoutes from './routes/enhanced.js';
import assignmentsRoutes from './routes/assignments.js';
import authMigrationRoutes from './routes/auth-migration.js';

// Import middleware
import { authenticateApiKey } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// .env loaded above

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - Allow grade-vault-tvet to access this backend
app.use(cors({
  origin: [
    'http://localhost:5173', // tvet-connect-kenya frontend
    'http://localhost:5174', // tvet-connect-kenya frontend (Vite default)
    'http://localhost:8081', // grade-vault-tvet frontend  
    'http://localhost:8080', // grade-vault-tvet frontend (alternative port)
    'http://localhost:3000', // alternative ports
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8080',
    'http://172.20.208.1:5173',
    'http://172.20.208.1:8081',
    'http://172.20.208.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');
  res.status(200).send();
});

// Debug middleware to log CORS requests
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log(`🔍 CORS Preflight: ${req.method} ${req.url}`);
    console.log(`   Origin: ${req.headers.origin}`);
    console.log(`   Headers: ${req.headers['access-control-request-headers']}`);
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TVET Connect Kenya API (Enhanced)',
    features: [
      'Student Management',
      'Grades & Transcripts', 
      'Semester Plans',
      'Exam Cards',
      'Unit Management',
      'Enhanced: Persistent Unit Syncing',
      'Enhanced: Cross-Dashboard Sync', 
      'Enhanced: Real-time Progress Tracking',
      'Enhanced: Attendance Management',
      'Enhanced: Online Class Management'
    ]
  });
});

// API key management routes (admin only)
app.use('/api/admin/keys', apiKeyRoutes);



// Public auth routes (for login verification)
app.use('/api/auth', authRoutes);
app.use('/api/auth', authMigrationRoutes);

// Student-specific routes (requires student JWT)
app.use('/api/me', myDetailsRoutes);
app.use('/api/me', feesRoutes);
app.use('/api/me', unitRegistrationRoutes);

// Admin routes for managing applications
app.use('/api/admin', adminRoutes);

// HOD routes for deferment and academic clearance
app.use('/api/hod', hodRoutes);

// Finance routes for financial clearance
app.use('/api/finance', financeRoutes);

// Upload routes (no authentication required for now)
app.use('/api/upload', uploadRoutes);

// Protected API routes (require API key)
app.use('/api/students', authenticateApiKey, studentsRoutes);
app.use('/api/grades', authenticateApiKey, gradesRoutes);
app.use('/api/semester', authenticateApiKey, semesterRoutes);
app.use('/api/exam-cards', authenticateApiKey, examCardsRoutes);
app.use('/api/units', authenticateApiKey, unitsRoutes);
app.use('/api/assignments', authenticateApiKey, assignmentsRoutes);

// Enhanced features routes (require API key)
app.use('/api/students', authenticateApiKey, enhancedRoutes);
app.use('/api/lecturer', authenticateApiKey, enhancedRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 TVET Connect Kenya API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Base URL: http://localhost:${PORT}/api`);
});



export default app;
