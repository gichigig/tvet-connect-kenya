import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Get essay submissions for a specific student and unit
router.get('/submissions/student/:studentId/unit/:unitId', async (req, res) => {
  try {
    const { studentId, unitId } = req.params;

    console.log(`Getting essay submissions for student ${studentId}, unit ${unitId}`);

    const db = getFirestore();
    const submissionsRef = db.collection('assignmentSubmissions')
      .where('studentId', '==', studentId)
      .where('unitId', '==', unitId)
      .where('submissionType', '==', 'essay');

    const snapshot = await submissionsRef.get();
    const submissions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        unitId: data.unitId,
        submissionType: data.submissionType,
        content: data.content,
        title: data.title,
        submittedAt: data.submittedAt,
        status: data.status,
        wordCount: data.wordCount,
        aiCheckResult: data.aiCheckResult,
        metadata: data.metadata
      });
    });

    console.log(`Found ${submissions.length} essay submissions for student ${studentId}`);
    res.json(submissions);

  } catch (error) {
    console.error('Error getting essay submissions:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve essay submissions',
      details: error.message 
    });
  }
});

// Create or update an essay submission
router.post('/submissions', async (req, res) => {
  try {
    const {
      assignmentId,
      studentId,
      unitId,
      submissionType,
      content,
      title,
      submittedAt,
      status,
      wordCount,
      aiCheckResult,
      metadata
    } = req.body;

    console.log(`Creating/updating essay submission for assignment ${assignmentId}, student ${studentId}`);

    // Validate required fields
    if (!assignmentId || !studentId || !unitId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['assignmentId', 'studentId', 'unitId']
      });
    }

    const db = getFirestore();
    // Check if submission already exists
    const existingSubmissionRef = db.collection('assignmentSubmissions')
      .where('assignmentId', '==', assignmentId)
      .where('studentId', '==', studentId)
      .limit(1);

    const existingSnapshot = await existingSubmissionRef.get();
    let submissionRef;
    let isUpdate = false;

    if (!existingSnapshot.empty) {
      // Update existing submission
      submissionRef = existingSnapshot.docs[0].ref;
      isUpdate = true;
      console.log(`Updating existing submission: ${submissionRef.id}`);
    } else {
      // Create new submission
      submissionRef = db.collection('assignmentSubmissions').doc();
      console.log(`Creating new submission: ${submissionRef.id}`);
    }

    const submissionData = {
      assignmentId,
      studentId,
      unitId,
      submissionType: submissionType || 'essay',
      content: content || '',
      title: title || '',
      submittedAt: submittedAt || new Date().toISOString(),
      status: status || 'submitted',
      wordCount: wordCount || 0,
      aiCheckResult: aiCheckResult || null,
      metadata: metadata || {},
      updatedAt: new Date().toISOString()
    };

    // Add createdAt only for new submissions
    if (!isUpdate) {
      submissionData.createdAt = new Date().toISOString();
    }

    await submissionRef.set(submissionData, { merge: true });

    const savedSubmission = {
      id: submissionRef.id,
      ...submissionData
    };

    console.log(`Essay submission ${isUpdate ? 'updated' : 'created'} successfully: ${submissionRef.id}`);
    
    res.status(isUpdate ? 200 : 201).json({
      message: `Essay submission ${isUpdate ? 'updated' : 'created'} successfully`,
      submission: savedSubmission
    });

  } catch (error) {
    console.error('Error saving essay submission:', error);
    res.status(500).json({ 
      error: 'Failed to save essay submission',
      details: error.message 
    });
  }
});

// Get a specific essay submission
router.get('/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const db = getFirestore();
    const submissionRef = db.collection('assignmentSubmissions').doc(submissionId);
    const doc = await submissionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Essay submission not found' });
    }

    const submission = {
      id: doc.id,
      ...doc.data()
    };

    res.json(submission);

  } catch (error) {
    console.error('Error getting essay submission:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve essay submission',
      details: error.message 
    });
  }
});

// Delete an essay submission
router.delete('/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const db = getFirestore();
    const submissionRef = db.collection('assignmentSubmissions').doc(submissionId);
    const doc = await submissionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Essay submission not found' });
    }

    await submissionRef.delete();

    console.log(`Essay submission deleted successfully: ${submissionId}`);
    res.json({ message: 'Essay submission deleted successfully' });

  } catch (error) {
    console.error('Error deleting essay submission:', error);
    res.status(500).json({ 
      error: 'Failed to delete essay submission',
      details: error.message 
    });
  }
});

// Get all submissions for a specific assignment (for lecturers)
router.get('/assignment/:assignmentId/submissions', async (req, res) => {
  try {
    const { assignmentId } = req.params;

    console.log(`Getting all submissions for assignment ${assignmentId}`);

    const db = getFirestore();
    const submissionsRef = db.collection('assignmentSubmissions')
      .where('assignmentId', '==', assignmentId);

    const snapshot = await submissionsRef.get();
    const submissions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        unitId: data.unitId,
        submissionType: data.submissionType,
        content: data.content,
        title: data.title,
        submittedAt: data.submittedAt,
        status: data.status,
        wordCount: data.wordCount,
        aiCheckResult: data.aiCheckResult,
        metadata: data.metadata,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    console.log(`Found ${submissions.length} submissions for assignment ${assignmentId}`);
    res.json(submissions);

  } catch (error) {
    console.error('Error getting assignment submissions:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve assignment submissions',
      details: error.message 
    });
  }
});

export default router;
