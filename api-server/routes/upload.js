// Server-side S3 upload endpoint
import express from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import cors from 'cors';

const router = express.Router();

// Configure AWS
AWS.config.update({
  region: 'eu-north-1',
  accessKeyId: '***REMOVED***WETSI3YJNMK4ILDU',
  secretAccessKey: 'MxS5xtrH+XeVVlKjrZPa4vLBE8Jum9cyHuCCgslE'
});

const s3 = new AWS.S3();
const BUCKET_NAME = 'tvet-kenya-uploads-2024';

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Enable CORS for this endpoint
router.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Upload endpoint
router.post('/upload-course-material', upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { unitId, unitCode, fileName: customFileName } = req.body;

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = customFileName || `${timestamp}_${randomString}.${fileExtension}`;

    // S3 upload parameters
    const key = `course-materials/${unitId || 'general'}/${uniqueFileName}`;
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        unitId: unitId || 'general',
        unitCode: unitCode || 'unknown'
      }
    };

    console.log('Uploading to S3:', {
      bucket: BUCKET_NAME,
      key,
      contentType: req.file.mimetype,
      size: req.file.size
    });

    // Upload to S3
    const result = await s3.upload(uploadParams).promise();
    
    console.log('S3 upload successful:', result.Location);

    res.json({
      success: true,
      fileUrl: result.Location,
      fileName: uniqueFileName,
      originalName: req.file.originalname,
      size: req.file.size,
      key: result.Key
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
      details: error.code || 'Unknown error'
    });
  }
});

// Download endpoint for secure file access
router.get('/download/:key(*)', async (req, res) => {
  try {
    console.log('File download request:', {
      key: req.params.key,
      fullPath: req.params[0]
    });

    // The key parameter contains the full S3 path
    const s3Key = req.params.key;
    
    // Get the object from S3
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key
    };

    console.log('Downloading from S3:', getObjectParams);

    try {
      // Get the file from S3
      const s3Object = await s3.getObject(getObjectParams).promise();
      
      // Set appropriate response headers
      res.setHeader('Content-Type', s3Object.ContentType || 'application/octet-stream');
      res.setHeader('Content-Length', s3Object.ContentLength);
      res.setHeader('Content-Disposition', `attachment; filename="${s3Object.Metadata?.originalName || s3Object.Metadata?.originalname || 'download'}"`);
      
      // Stream the file to the response
      res.send(s3Object.Body);
      
      console.log('File downloaded successfully:', s3Key);
    } catch (s3Error) {
      console.error('S3 Error:', s3Error);
      
      // Handle specific S3 errors
      if (s3Error.code === 'NoSuchKey') {
        return res.status(404).json({ 
          error: 'File not found',
          message: 'The requested file does not exist in the storage bucket.',
          key: s3Key
        });
      }
      
      if (s3Error.code === 'AccessDenied') {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Unable to access the requested file. Please contact support.',
          key: s3Key
        });
      }
      
      // Generic S3 error
      throw s3Error;
    }
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Download failed',
      message: 'An error occurred while downloading the file.',
      details: error.message,
      key: req.params.key
    });
  }
});

// Health check endpoint for upload service
router.get('/upload-health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'S3 Upload Service',
    bucket: BUCKET_NAME,
    region: 'eu-north-1'
  });
});

export default router;
