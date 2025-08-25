import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore;

/**
 * Middleware to authenticate API keys
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please provide an API key in the x-api-key header or Authorization Bearer token'
      });
    }

    // Check static API key first (for development/testing)
    if (process.env.STATIC_API_KEY && apiKey === process.env.STATIC_API_KEY) {
      req.user = {
        id: 'static-api-user',
        type: 'static'
      };
      req.apiKey = {
        id: 'static-api-key',
        permissions: [
          'hod:units:read', 
          'hod:units:approve', 
          'hod:deferment:read', 
          'hod:deferment:approve', 
          'students:read',
          'semester:read',
          'semester:write'
        ],
        scope: 'full'
      };
      return next();
    }

    // Check dynamic API keys in Firestore
    const apiKeysRef = db().collection('api_keys');
    const snapshot = await apiKeysRef.where('isActive', '==', true).get();

    let validKey = null;
    for (const doc of snapshot.docs) {
      const keyData = doc.data();
      const isValid = await bcrypt.compare(apiKey, keyData.hashedKey);
      if (isValid) {
        validKey = {
          id: doc.id,
          ...keyData
        };
        break;
      }
    }

    if (!validKey) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    // Update last used timestamp
    await apiKeysRef.doc(validKey.id).update({
      lastUsed: new Date()
    });

    req.apiKey = validKey;
    req.user = {
      id: validKey.id,
      type: 'api-key'
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
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
