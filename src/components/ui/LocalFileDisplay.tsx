// Component for displaying locally stored files
import React from 'react';
import { getFileDataUrl } from '@/integrations/aws/localUpload';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface LocalFileDisplayProps {
  fileUrl: string;
  fileName: string;
  className?: string;
}

export const LocalFileDisplay: React.FC<LocalFileDisplayProps> = ({ 
  fileUrl, 
  fileName, 
  className = "" 
}) => {
  if (fileUrl.startsWith('local://files/')) {
    // Handle local files
    const dataUrl = getFileDataUrl(fileUrl);
    
    if (!dataUrl) {
      return <span className={className}>File not found</span>;
    }

    // For local files, create a download link using the data URL
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <button 
        onClick={handleDownload}
        className={`${className} text-blue-600 hover:text-blue-800 underline cursor-pointer`}
        title="Download file (stored locally)"
      >
        {fileName} 📁
      </button>
    );
  }
  
  // Handle S3 files through API server download endpoint
  if (fileUrl.includes('s3.') || fileUrl.includes('amazonaws.com')) {
    // Extract the S3 key from the URL
    const s3Key = extractS3KeyFromUrl(fileUrl);
    if (s3Key) {
      const downloadUrl = `${API_BASE_URL}/api/upload/download/${encodeURIComponent(s3Key)}`;
      return (
        <a 
          href={downloadUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${className} text-blue-600 hover:text-blue-800 underline`}
          title="Download file from cloud storage"
        >
          {fileName} ☁️
        </a>
      );
    }
  }

  // Default case for other URLs
  return (
    <a 
      href={fileUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
    >
      {fileName}
    </a>
  );
};

// Helper function to extract S3 key from S3 URL
function extractS3KeyFromUrl(s3Url: string): string | null {
  try {
    // Handle URLs like: https://bucket-name.s3.region.amazonaws.com/path/to/file
    // or: https://s3.region.amazonaws.com/bucket-name/path/to/file
    const url = new URL(s3Url);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (url.hostname.includes('.s3.')) {
      // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
      return pathParts.join('/');
    } else if (url.hostname.startsWith('s3.')) {
      // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
      return pathParts.slice(1).join('/'); // Skip bucket name
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
}

export default LocalFileDisplay;
