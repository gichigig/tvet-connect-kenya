import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(fileURLToPath(import.meta.url), '..');

dotenv.config({ path: join(__dirname, '.env') });

console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT SET');

// Test JWT generation
if (process.env.JWT_SECRET) {
  const testToken = jwt.sign(
    { 
      userId: 'test123', 
      email: 'test@example.com',
      role: 'student' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log('Test JWT token generated successfully');
  console.log('Token (first 50 chars):', testToken.substring(0, 50) + '...');

  // Test JWT verification
  try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('JWT verification successful');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('JWT verification failed:', error.message);
  }
} else {
  console.error('Cannot test JWT - JWT_SECRET not found');
}
