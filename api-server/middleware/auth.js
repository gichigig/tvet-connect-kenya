import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

/**
 * Middleware to authenticate API keys
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Please provide an API key in the x-api-key header or Authorization Bearer token'
      });
    }

    // Check static API key from .env
    if (process.env.STATIC_API_KEY && apiKey === process.env.STATIC_API_KEY) {
      req.apiKey = {
        id: 'static',
        name: 'Static API Key',
        permissions: ['*'],
        createdBy: 'env',
        scope: 'admin'
      };
      return next();
    }

    // Get API key from database
    const apiKeysRef = db.collection('api_keys');
    const querySnapshot = await apiKeysRef.where('hashedKey', '==', await hashApiKey(apiKey)).get();
    if (querySnapshot.empty) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid or has been revoked'
      });
    }
    const apiKeyDoc = querySnapshot.docs[0];
    const apiKeyData = apiKeyDoc.data();
    // Check if API key is active
    if (!apiKeyData.isActive) {
      return res.status(401).json({ 
        error: 'API key inactive',
        message: 'This API key has been deactivated'
      });
    }
    // Check expiration
    if (apiKeyData.expiresAt && new Date() > apiKeyData.expiresAt.toDate()) {
      return res.status(401).json({ 
        error: 'API key expired',
        message: 'This API key has expired'
      });
    }
    // Update last used timestamp
    await apiKeyDoc.ref.update({
      lastUsed: new Date(),
      usageCount: (apiKeyData.usageCount || 0) + 1
    });
    // Add API key info to request
    req.apiKey = {
      id: apiKeyDoc.id,
      name: apiKeyData.name,
      permissions: apiKeyData.permissions || [],
      createdBy: apiKeyData.createdBy,
      scope: apiKeyData.scope || 'read'
    };
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      message: 'Failed to authenticate API key'
    });
  }
};

/**
 * Middleware to check specific permissions
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This API key does not have the required permission: ${permission}`
      });
    }
    next();
  };
};

/**
 * Middleware to check API key scope
 */
export const requireScope = (scope) => {
  return (req, res, next) => {
    if (!req.apiKey || req.apiKey.scope !== scope) {
      return res.status(403).json({ 
        error: 'Insufficient scope',
        message: `This operation requires ${scope} scope`
      });
    }
    next();
  };
};

/**
 * Hash API key for storage
 */
export const hashApiKey = async (apiKey) => {
  return bcrypt.hash(apiKey, 12);
};

/**
 * Generate a new API key
 */
export const generateApiKey = () => {
  return 'tvet_' + uuidv4().replace(/-/g, '');
};

/**
 * Middleware to authenticate admin users for API key management
 */
// BYPASS ADMIN AUTH FOR LOCAL DEVELOPMENT ONLY
export const authenticateAdmin = async (req, res, next) => {
  // WARNING: This bypasses admin authentication. Only use for local development!
  req.admin = {
    id: 'dev-admin',
    email: 'dev@localhost',
    role: 'admin'
  };
  next();
};
