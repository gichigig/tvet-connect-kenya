const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

admin.initializeApp();

// Configure AWS S3 with environment variables (new approach)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || functions.config().aws?.region || "eu-north-1",
  credentials: {
    accessKeyId: process.env.***REMOVED*** || functions.config().aws?.access_key_id,
    secretAccessKey: process.env.***REMOVED*** || functions.config().aws?.secret_access_key,
  },
});

const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME || functions.config().aws?.bucket_name;

// Configure nodemailer with your email provider details
// You need to set these config variables in your Firebase environment:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.createStudentUser = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const studentData = snap.data();
    const { email, firstName, lastName, admissionNumber } = studentData;

    if (studentData.role !== "student") {
      console.log("Not a student, skipping auth creation.");
      return null;
    }

    try {
      // Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        emailVerified: false,
        displayName: `${firstName} ${lastName}`,
        disabled: false,
      });

      console.log("Successfully created new user:", userRecord.uid);

      // Generate a password reset link
      const link = await admin.auth().generatePasswordResetLink(email);

      // Email body
      const mailOptions = {
        from: `"TVET Connect Kenya" <${functions.config().gmail.email}>`,
        to: email,
        subject: "Welcome to TVET Connect Kenya - Set Your Password",
        html: `
          <h1>Welcome, ${firstName}!</h1>
          <p>Your student account has been created successfully.</p>
          <p>Your Admission Number is: <strong>${admissionNumber}</strong></p>
          <p>Please click the link below to set your password and log in:</p>
          <a href="${link}">Set Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log("Password reset email sent to:", email);

      // Update the Firestore document with the new UID
      return snap.ref.set({ uid: userRecord.uid }, { merge: true });
    } catch (error) {
      console.error("Error creating new user or sending email:", error);
      // Optionally, you could remove the Firestore document if auth creation fails
      // await snap.ref.delete();
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create user in Authentication or send email",
        error
      );
    }
  });

// Generate signed URL for S3 uploads
exports.generateSignedUrl = functions.https.onCall(async (data, context) => {
  // Verify that the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { fileName, fileType, folder = 'uploads' } = data;

  if (!fileName || !fileType) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'fileName and fileType are required.'
    );
  }

  try {
    // Generate a unique file key
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Create presigned POST URL
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // 10MB max
        ['starts-with', '$Content-Type', fileType.split('/')[0]], // Allow file type
      ],
      Fields: {
        'Content-Type': fileType,
        'acl': 'private',
      },
      Expires: 600, // 10 minutes
    });

    // Return the presigned URL and the final file URL
    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${s3Client.config.region}.amazonaws.com/${key}`;

    return {
      uploadUrl: url,
      uploadFields: fields,
      fileUrl: fileUrl,
      key: key,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate signed URL',
      error.message
    );
  }
});
