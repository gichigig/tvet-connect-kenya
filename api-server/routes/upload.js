// Server-side Cloudflare R2 upload endpoint
import express from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import cors from 'cors';

const router = express.Router();

// Configure Cloudflare R2 client
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'tvet-connect-kenya-r2';

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

    // R2 upload parameters
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

    console.log('Uploading to R2:', {
      bucket: BUCKET_NAME,
      key,
      contentType: req.file.mimetype,
      size: req.file.size
    });

    // Upload to R2
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    // Generate public URL
    const fileUrl = process.env.R2_CUSTOM_DOMAIN 
      ? `${process.env.R2_CUSTOM_DOMAIN}/${key}`
      : `https://${BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    console.log('R2 upload successful:', fileUrl);

    res.json({
      success: true,
      fileUrl,
      fileName: uniqueFileName,
      originalName: req.file.originalname,
      size: req.file.size,
      key
    });

  } catch (error) {
    console.error('R2 upload error:', error);
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

    // The key parameter contains the full R2 path
    const r2Key = req.params.key;
    
    // Get the object from R2
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: r2Key
    };

    console.log('Downloading from R2:', getObjectParams);

    try {
      // Get the file from R2 using AWS SDK v3
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new GetObjectCommand(getObjectParams);
      const r2Object = await s3Client.send(command);
      
      // Set appropriate response headers
      res.setHeader('Content-Type', r2Object.ContentType || 'application/octet-stream');
      res.setHeader('Content-Length', r2Object.ContentLength || 0);
      res.setHeader('Content-Disposition', `attachment; filename="${r2Object.Metadata?.originalName || r2Object.Metadata?.originalname || 'download'}"`);
      
      // Stream the file to the response
      if (r2Object.Body) {
        const stream = r2Object.Body;
        if (stream instanceof ReadableStream) {
          const reader = stream.getReader();
          const chunks = [];
          let done, value;
          
          while (!done) {
            ({ done, value } = await reader.read());
            if (value) chunks.push(value);
          }
          
          const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
          }
          
          res.send(Buffer.from(buffer));
        } else {
          res.send(r2Object.Body);
        }
      }
      
      console.log('File downloaded successfully:', r2Key);
    } catch (r2Error) {
      console.error('R2 Error:', r2Error);
      
      // Handle specific R2 errors
      if (r2Error.name === 'NoSuchKey') {
        return res.status(404).json({ 
          error: 'File not found',
          message: 'The requested file does not exist in the storage bucket.',
          key: r2Key
        });
      }
      
      if (r2Error.name === 'AccessDenied') {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Unable to access the requested file. Please contact support.',
          key: r2Key
        });
      }
      
      // Generic R2 error
      throw r2Error;
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
    service: 'Cloudflare R2 Upload Service',
    bucket: BUCKET_NAME,
    region: 'auto'
  });
});

export default router;
