import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Get all available units
 * GET /api/units
 */
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get all units from Firestore
    const unitsSnapshot = await db.collection('units').get();
    
    const units = [];
    unitsSnapshot.forEach(doc => {
      const unitData = doc.data();
      units.push({
        id: doc.id,
        code: unitData.code || '',
        name: unitData.name || '',
        credits: unitData.credits || 3,
        semester: unitData.semester || '',
        department: unitData.department || '',
        level: unitData.level || '',
        description: unitData.description || '',
        prerequisites: unitData.prerequisites || []
      });
    });

    res.json({
      message: 'Units retrieved successfully',
      units: units
    });

  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

/**
 * Get units by department
 * GET /api/units/department/:department
 */
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const db = getFirestore();
    
    // Get units filtered by department
    const unitsSnapshot = await db.collection('units')
      .where('department', '==', department)
      .get();
    
    const units = [];
    unitsSnapshot.forEach(doc => {
      const unitData = doc.data();
      units.push({
        id: doc.id,
        code: unitData.code || '',
        name: unitData.name || '',
        credits: unitData.credits || 3,
        semester: unitData.semester || '',
        department: unitData.department || '',
        level: unitData.level || '',
        description: unitData.description || '',
        prerequisites: unitData.prerequisites || []
      });
    });

    res.json({
      message: `Units for ${department} retrieved successfully`,
      units: units
    });

  } catch (error) {
    console.error('Error fetching units by department:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

/**
 * Get units by semester and level
 * GET /api/units/semester/:semester/level/:level
 */
router.get('/semester/:semester/level/:level', async (req, res) => {
  try {
    const { semester, level } = req.params;
    const db = getFirestore();
    
    // Get units filtered by semester and level
    const unitsSnapshot = await db.collection('units')
      .where('semester', '==', semester)
      .where('level', '==', level)
      .get();
    
    const units = [];
    unitsSnapshot.forEach(doc => {
      const unitData = doc.data();
      units.push({
        id: doc.id,
        code: unitData.code || '',
        name: unitData.name || '',
        credits: unitData.credits || 3,
        semester: unitData.semester || '',
        department: unitData.department || '',
        level: unitData.level || '',
        description: unitData.description || '',
        prerequisites: unitData.prerequisites || []
      });
    });

    res.json({
      message: `Units for ${semester} semester, level ${level} retrieved successfully`,
      units: units
    });

  } catch (error) {
    console.error('Error fetching units by semester and level:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

export default router;
