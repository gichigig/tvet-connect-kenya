
import 'dotenv/config';
import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 3001;

// Firebase Admin SDK initialization
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

// Middleware

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
}));
app.use(express.json());

// /login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    // Get user data from Realtime Database (adjust path as needed)
    const db = admin.database();
    const snapshot = await db.ref(`users/${userRecord.uid}`).once('value');
    const userData = snapshot.val();

    if (!userData) {
      return res.status(401).json({ message: 'User not found in database.' });
    }

    // Only allow students to log in
    if (userData.role !== 'student') {
      return res.status(403).json({ message: 'Only students are allowed to log in.' });
    }

    // Compare password (assuming hashed in DB)
    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
        // add any other student details needed
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed.', error: err.message });
  }
});

// Example protected route
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Protected data', user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
