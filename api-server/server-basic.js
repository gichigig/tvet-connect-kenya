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

console.log('✅ Express and middleware imported successfully');

// Test basic server setup first
const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API Server is running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API Server is running',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Health check: http://localhost:${PORT}/api/health`);
});

console.log('✅ Basic server setup complete');
