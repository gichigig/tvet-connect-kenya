import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { uploadStudentDocument, uploadProfilePicture } from '@/integrations/aws';
import { Upload, FileText, User } from 'lucide-react';

export const S3FileUploadExample: React.FC = () => {
  const { uploadFile, isUploading, progress, error, url } = useFileUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    
    try {
      // Using the direct function
      const documentUrl = await uploadStudentDocument(selectedFile, 'student123');
      console.log('Document uploaded:', documentUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleUploadProfile = async () => {
    if (!selectedFile) return;
    
    try {
      // Using the hook
      const uploadedUrl = await uploadFile(selectedFile, 'PROFILE_PICTURES', 'user123_profile');
      console.log('Profile picture uploaded:', uploadedUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          S3 File Upload Demo
        </CardTitle>
        <CardDescription>
          Test the AWS S3 integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <p className="text-sm text-center mt-1">Uploading... {progress}%</p>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}

        {url && (
          <div className="text-green-600 text-sm">
            ✅ Upload successful! 
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline ml-1">
              View file
            </a>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUploadDocument}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload as Document
          </Button>
          
          <Button 
            onClick={handleUploadProfile}
            disabled={!selectedFile || isUploading}
            variant="outline"
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            Upload as Profile
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>Supported file types: Images, PDF, Word documents</p>
          <p>Max file size: 10MB (configurable)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default S3FileUploadExample;
