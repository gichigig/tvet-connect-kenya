import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import gradesRoutes from './routes/grades.js';
import semesterRoutes from './routes/semester.js';
import examCardsRoutes from './routes/examCards.js';
import apiKeyRoutes from './routes/apiKeys.js';

// Import middleware
import { authenticateApiKey } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env loaded above

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

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
    service: 'TVET Connect Kenya API'
  });
});

// API key management routes (admin only)
app.use('/api/admin/keys', apiKeyRoutes);

// Public auth routes (for login verification)
app.use('/api/auth', authRoutes);

// Protected API routes (require API key)
app.use('/api/students', authenticateApiKey, studentsRoutes);
app.use('/api/grades', authenticateApiKey, gradesRoutes);
app.use('/api/semester', authenticateApiKey, semesterRoutes);
app.use('/api/exam-cards', authenticateApiKey, examCardsRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 TVET Connect Kenya API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
