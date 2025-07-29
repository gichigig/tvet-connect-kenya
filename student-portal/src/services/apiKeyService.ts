const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all API keys from backend
export async function fetchApiKeys(): Promise<{ id: string; name: string; key: string }[]> {
  // Mock data for development/testing
  return [
    { id: '1', name: 'Key 1', key: 'abc123' },
    { id: '2', name: 'Key 2', key: 'def456' },
  ];
}

// Create a new API key via backend
export async function createApiKey({ name }: { name: string }): Promise<{ id: string; name: string; key: string }> {
  // Mock creation for development/testing
  return { id: Math.random().toString(), name, key: Math.random().toString(36).substring(2, 15) };
}
