import React, { useState } from 'react';
import { uploadFileToS3 } from '../integrations/aws/storage';

export const S3TestUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await uploadFileToS3(file, 'STUDENT_DOCUMENTS');
      if (result.success) {
        setResult(`✅ SUCCESS: ${result.url}`);
      } else {
        setResult(`❌ FAILED: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ ERROR: ${error}`);
    }
    setUploading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>S3 Upload Test</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        style={{ marginLeft: '10px', padding: '5px 10px' }}
      >
        {uploading ? 'Uploading...' : 'Test Upload'}
      </button>
      {result && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          {result}
        </div>
      )}
    </div>
  );
};
