const AWS = require('aws-sdk');
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.***REMOVED***,
    secretAccessKey: process.env.***REMOVED***,
  },
});

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Parse request body
    const { token, fileName, fileSize, fileType, folder } = JSON.parse(event.body);

    if (!token || !fileName || !fileSize || !fileType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing required fields: token, fileName, fileSize, fileType'
        }),
      };
    }

    // Verify Firebase Auth token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid or expired authentication token'
        }),
      };
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxSize) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'File size exceeds 50MB limit'
        }),
      };
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(fileType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid file type. Allowed: PDF, Word, PowerPoint, Text, Images'
        }),
      };
    }

    // Generate unique file name
    const timestamp = Date.now();
    const userId = decodedToken.uid;
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${userId}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Determine S3 key based on folder type
    let s3Key;
    switch (folder) {
      case 'profile-pictures':
        s3Key = `profile-pictures/${userId}/${uniqueFileName}`;
        break;
      case 'course-materials':
        s3Key = `course-materials/${folder}/${uniqueFileName}`;
        break;
      case 'student-documents':
        s3Key = `student-documents/${userId}/${uniqueFileName}`;
        break;
      default:
        s3Key = `uploads/${folder || 'general'}/${uniqueFileName}`;
    }

    // Generate presigned POST URL
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Fields: {
        'Content-Type': fileType,
        'x-amz-meta-user-id': userId,
        'x-amz-meta-original-name': fileName,
      },
      Expires: 600, // 10 minutes
      Conditions: [
        ['content-length-range', 0, maxSize],
        ['eq', '$Content-Type', fileType],
      ],
    });

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadUrl: presignedPost.url,
        formData: presignedPost.fields,
        fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        expiresIn: 600,
      }),
    };

  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};
