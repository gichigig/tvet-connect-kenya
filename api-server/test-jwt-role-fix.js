// Test the JWT role fix
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-jwt-key-minimum-32-characters';

// Test token creation with student role
const testToken = jwt.sign(
  { 
    userId: 'test123', 
    email: 'test@student.tveta.ac.ke',
    role: 'student',
    admissionNumber: 'ADM001'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('✅ Test JWT token created');
console.log('Token:', testToken.substring(0, 50) + '...');

// Test token verification
try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ JWT verification successful');
  console.log('Decoded payload:', decoded);
  console.log('Role check:', decoded.role === 'student' ? '✅ PASS' : '❌ FAIL');
} catch (error) {
  console.error('❌ JWT verification failed:', error.message);
}

// Test the authenticateStudent middleware logic
function testAuthenticateStudent(authHeader) {
  console.log(`\n🔒 Testing middleware with: ${authHeader}`);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Authentication token is required.');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'student') {
      console.log('❌ Access denied. Student role required.');
      console.log('   Role found:', decoded.role);
      return;
    }

    console.log('✅ Authentication successful');
    console.log('   Student data:', { userId: decoded.userId, email: decoded.email });
  } catch (error) {
    console.log('❌ Invalid or expired token:', error.message);
  }
}

// Test with valid token
testAuthenticateStudent(`Bearer ${testToken}`);

// Test with invalid role
const invalidRoleToken = jwt.sign(
  { 
    userId: 'test123', 
    email: 'test@student.tveta.ac.ke',
    role: 'admin'  // Wrong role
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

testAuthenticateStudent(`Bearer ${invalidRoleToken}`);
