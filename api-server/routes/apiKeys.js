import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateAdmin, generateApiKey, hashApiKey } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const db = getFirestore();

/**
 * Create a new API key
 * POST /api/admin/keys
 */
router.post('/', 
  authenticateAdmin,
  [
    body('name').isLength({ min: 1 }).withMessage('API key name is required'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('scope').isIn(['read', 'write', 'admin']).withMessage('Invalid scope'),
    body('expiresInDays').optional().isInt({ min: 1, max: 365 }).withMessage('Expiration must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, permissions, scope, expiresInDays, description } = req.body;
      
      // Generate new API key
      const apiKey = generateApiKey();
      const hashedKey = await hashApiKey(apiKey);

      // Calculate expiration date
      let expiresAt = null;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      // Store API key in database
      const apiKeyData = {
        name,
        hashedKey,
        permissions,
        scope: scope || 'read',
        description: description || '',
        isActive: true,
        createdBy: req.admin.id,
        createdAt: new Date(),
        expiresAt,
        lastUsed: null,
        usageCount: 0
      };

      const docRef = await db.collection('api_keys').add(apiKeyData);

      res.status(201).json({
        message: 'API key created successfully',
        apiKey: {
          id: docRef.id,
          key: apiKey, // Only shown once during creation
          name,
          permissions,
          scope,
          expiresAt,
          createdAt: apiKeyData.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  }
);

/**
 * List all API keys
 * GET /api/admin/keys
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const apiKeysSnapshot = await db.collection('api_keys').orderBy('createdAt', 'desc').get();
    
    const apiKeys = apiKeysSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        permissions: data.permissions,
        scope: data.scope,
        description: data.description,
        isActive: data.isActive,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        lastUsed: data.lastUsed,
        usageCount: data.usageCount || 0,
        // Never return the actual key or hash
        hasKey: !!data.hashedKey
      };
    });

    res.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

/**
 * Update API key status
 * PATCH /api/admin/keys/:id
 */
router.patch('/:id', 
  authenticateAdmin,
  [
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('description').optional().isString().withMessage('Description must be string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = {};

      // Only allow certain fields to be updated
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
      if (req.body.permissions) updates.permissions = req.body.permissions;
      if (req.body.description !== undefined) updates.description = req.body.description;

      updates.updatedAt = new Date();
      updates.updatedBy = req.admin.id;

      await db.collection('api_keys').doc(id).update(updates);

      res.json({ 
        message: 'API key updated successfully',
        updates 
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({ error: 'Failed to update API key' });
    }
  }
);

/**
 * Delete API key
 * DELETE /api/admin/keys/:id
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.collection('api_keys').doc(id).delete();

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * Get API key usage statistics
 * GET /api/admin/keys/:id/stats
 */
router.get('/:id/stats', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKeyDoc = await db.collection('api_keys').doc(id).get();
    if (!apiKeyDoc.exists) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const data = apiKeyDoc.data();
    
    // Get usage logs if you implement logging
    // const usageLogs = await db.collection('api_usage_logs')
    //   .where('apiKeyId', '==', id)
    //   .orderBy('timestamp', 'desc')
    //   .limit(100)
    //   .get();

    res.json({
      id,
      name: data.name,
      usageCount: data.usageCount || 0,
      lastUsed: data.lastUsed,
      createdAt: data.createdAt,
      isActive: data.isActive
      // recentUsage: usageLogs.docs.map(doc => doc.data())
    });
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    res.status(500).json({ error: 'Failed to fetch API key statistics' });
  }
});

export default router;
