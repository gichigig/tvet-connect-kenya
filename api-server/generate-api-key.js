// Script to generate an API key using the local API (bypassing admin auth)
// Usage: node generate-api-key.js

import fetch from 'node-fetch';

async function generateApiKey() {
  const response = await fetch('http://localhost:3001/api/admin/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'External Integration',
      permissions: [
        'students:read',
        'grades:read',
        'grades:write',
        'semester:read',
        'semester:write',
        'units:read',
        'units:write',
        'examcards:read'
      ],
      scope: 'read',
      expiresInDays: 365
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate API key: ${error}`);
  }

  const data = await response.json();
  console.log('API Key generated:', data.apiKey.key);
  console.log('Full response:', data);
}

generateApiKey().catch(err => {
  console.error(err);
  process.exit(1);
});
