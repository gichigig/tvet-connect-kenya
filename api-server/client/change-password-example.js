// change-password-example.js
// Example: Change a student's password using TVETApiClient

const fetch = require('node-fetch');
const TVETApiClient = require('./tvet-api-client');

const client = new TVETApiClient('http://localhost:3001', 'YOUR_API_KEY_HERE'); // Replace with your API key

async function changePassword(email, oldPassword, newPassword) {
  try {
    const res = await fetch('http://localhost:3001/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY_HERE' // Replace with your API key
      },
      body: JSON.stringify({ email, oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    console.log('Password changed successfully!');
  } catch (err) {
    console.error('Error changing password:', err.message);
  }
}

// Example usage:
changePassword('student@example.com', 'oldpassword', 'newsecurepassword');
