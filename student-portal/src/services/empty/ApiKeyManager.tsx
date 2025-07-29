import React, { useEffect, useState } from 'react';
import { fetchApiKeys, createApiKey } from './api';

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApiKeys();
      setApiKeys(data.apiKeys || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await createApiKey(newKeyName);
      setNewKeyName('');
      await loadKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>API Key Manager</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {apiKeys.map((key) => (
          <li key={key.id}>{key.name} - {key.scope} - {key.isActive ? 'Active' : 'Inactive'}</li>
        ))}
      </ul>
      <input
        value={newKeyName}
        onChange={e => setNewKeyName(e.target.value)}
        placeholder="New API Key Name"
      />
      <button onClick={handleCreate} disabled={loading || !newKeyName}>
        Create API Key
      </button>
    </div>
  );
}
