import React, { useEffect, useState } from 'react';
import { fetchApiKeys, createApiKey } from './services/apiKeyService';

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchApiKeys()
      .then(setApiKeys)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await createApiKey({ name: newKeyName });
      setApiKeys((prev) => [...prev, created]);
      setNewKeyName('');
    } catch (err: any) {
      setError(err.message);
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
          <li key={key.id || key._id}>{key.name} - {key.key}</li>
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
