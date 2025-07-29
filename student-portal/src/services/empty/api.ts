// Simple API client for admin authentication and API key management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function adminLogin(email: string, password: string) {
  // Hardcoded admin credentials for local testing
  if (email === 'admin@example.com' && password === 'admin123') {
    return Promise.resolve({ success: true, user: { email: 'admin@example.com', role: 'admin' } });
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function fetchApiKeys() {
  const response = await fetch(`${API_BASE_URL}/api/admin/keys`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch API keys');
  return response.json();
}

export async function createApiKey(name: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, permissions: [], scope: 'read' })
  });
  if (!response.ok) throw new Error('Failed to create API key');
  return response.json();
}
