// Test User Creation and Migration Flow
// Run this in browser console when logged in to test Supabase user creation

async function testUserMigration() {
  console.log('🧪 Testing User Migration Flow...');
  
  try {
    // Get current Firebase user
    const auth = window.firebase?.auth?.();
    if (!auth) {
      console.log('❌ Firebase auth not available');
      return;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log('✅ Firebase user found:', currentUser.email);
    
    // Get Firebase token
    const token = await currentUser.getIdToken();
    console.log('✅ Firebase token obtained');
    
    // Test the migration API
    const response = await fetch('http://localhost:3001/api/auth/migrate-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firebaseUid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        firebaseToken: token
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Migration API successful:', result);
    } else {
      const error = await response.text();
      console.log('❌ Migration API failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Alternative: Test HybridAuthService directly
async function testHybridAuth() {
  console.log('🧪 Testing HybridAuthService...');
  
  try {
    // Import the service (adjust path as needed)
    const { HybridAuthService } = await import('./src/services/HybridAuthService.ts');
    const hybridAuth = HybridAuthService.getInstance();
    
    // Test with a sample login (replace with actual credentials)
    const email = prompt('Enter email to test:');
    const password = prompt('Enter password:');
    
    if (email && password) {
      const result = await hybridAuth.signIn(email, password);
      console.log('✅ HybridAuth result:', result);
    }
    
  } catch (error) {
    console.error('❌ HybridAuth test failed:', error);
  }
}

// Instructions for testing
console.log(`
🧪 USER MIGRATION TEST SCRIPT LOADED

To test user migration:
1. Login to the app first
2. Open browser console
3. Run: testUserMigration()

To test hybrid auth directly:
1. Run: testHybridAuth()

Expected results:
- User should be created in Supabase auth
- User profile should be created in profiles table
- Console should show success messages
`);

window.testUserMigration = testUserMigration;
window.testHybridAuth = testHybridAuth;
