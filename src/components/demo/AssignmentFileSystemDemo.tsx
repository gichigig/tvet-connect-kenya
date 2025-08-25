/**
 * Assignment File System Demo Component
 * Demonstrates lecturer file upload and student download functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { fileStorageService } from '@/services/FileStorageService';
import { FallbackUploadService } from '@/services/FallbackUploadService';
import { FallbackStorageIndicator } from '@/components/fallback/FallbackStorageIndicator';
import AssignmentFileSystemTester from '@/utils/AssignmentFileSystemTester';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export const AssignmentFileSystemDemo: React.FC = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!assignmentTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an assignment title.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const assignmentId = `demo-assignment-${Date.now()}`;
      const uploadResults: UploadedFile[] = [];

      for (const file of files) {
        try {
          const uploadedDoc = await fileStorageService.uploadDocument(file, {
            title: `${assignmentTitle} - ${file.name}`,
            description: assignmentDescription || 'Demo assignment file',
            isVisible: true,
            uploadedBy: 'demo-lecturer@tvet.edu',
            category: 'assignment',
            entityId: assignmentId,
            entityType: 'semester-plan-assignment'
          });

          uploadResults.push({
            id: uploadedDoc.id,
            name: uploadedDoc.fileName,
            url: uploadedDoc.downloadUrl,
            size: uploadedDoc.fileSize,
            uploadedAt: uploadedDoc.uploadedAt
          });

          toast({
            title: "File Uploaded",
            description: `${file.name} uploaded successfully!`,
          });

        } catch (error) {
          console.error('Upload failed for file:', file.name, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      setUploadedFiles(prev => [...prev, ...uploadResults]);
      setFiles([]);
      setAssignmentTitle('');
      setAssignmentDescription('');

      toast({
        title: "Upload Complete",
        description: `${uploadResults.length} of ${files.length} files uploaded successfully.`,
      });

    } catch (error) {
      toast({
        title: "Upload Error",
        description: `Upload process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      // Simulate student download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${file.name}...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${file.name}.`,
        variant: "destructive",
      });
    }
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      const tester = new AssignmentFileSystemTester();
      const results = await tester.runAllTests();
      setTestResults(results);

      const passed = results.filter(r => r.success).length;
      const total = results.length;

      toast({
        title: "Tests Complete",
        description: `${passed} of ${total} tests passed.`,
        variant: passed === total ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: `Failed to run tests: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const clearFallbackStorage = () => {
    FallbackUploadService.clearFallbackStorage();
    toast({
      title: "Storage Cleared",
      description: "All fallback storage has been cleared.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Assignment File System Demo</h1>
        <p className="text-gray-600 mt-2">
          Test lecturer file uploads and student downloads with S3 integration and fallback support
        </p>
      </div>

      {/* Fallback Storage Indicator */}
      <FallbackStorageIndicator showDetails={true} />

      {/* Lecturer Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Lecturer File Upload Demo
          </CardTitle>
          <CardDescription>
            Upload assignment files as a lecturer (files go to S3 or fallback storage)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="Enter assignment title..."
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="description">Assignment Description</Label>
            <Textarea
              id="description"
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              placeholder="Enter assignment description (optional)..."
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="files">Select Files</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={isUploading || files.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading Files...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Assignment Files
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Student Download Section */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Student Download Demo
            </CardTitle>
            <CardDescription>
              Download assignment files as a student (from S3 or fallback storage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • 
                        Uploaded: {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            System Tests
          </CardTitle>
          <CardDescription>
            Run comprehensive tests on the assignment file system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunningTests}
              variant="outline"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>

            <Button 
              onClick={clearFallbackStorage} 
              variant="destructive"
              size="sm"
            >
              Clear Fallback Storage
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results:</h4>
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                      {result.testName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {result.duration}ms
                    </Badge>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">
                  Summary: {testResults.filter(r => r.success).length} passed, {' '}
                  {testResults.filter(r => !r.success).length} failed, {' '}
                  {testResults.length} total
                </p>
                <p className="text-sm text-gray-600">
                  Success Rate: {((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>1. Lecturer Upload:</strong> Enter an assignment title, optionally add a description, 
              select files, and click upload. Files will be stored in AWS S3 or fallback storage if S3 is unavailable.
            </div>
            <div>
              <strong>2. Student Download:</strong> Once files are uploaded, they appear in the download section. 
              Click download to get the file (simulates student experience).
            </div>
            <div>
              <strong>3. System Tests:</strong> Click "Run All Tests" to verify all components are working correctly. 
              This tests upload, download, fallback storage, error handling, and performance.
            </div>
            <div>
              <strong>4. Fallback Storage:</strong> If AWS S3 is unavailable, files are stored locally in your browser. 
              The indicator shows when fallback storage is being used.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentFileSystemDemo;
