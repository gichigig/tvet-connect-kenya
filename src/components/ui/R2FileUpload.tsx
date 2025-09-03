/**
 * R2 File Upload Component
 * Provides a drag-and-drop file upload interface with progress tracking
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Download,
  FileText,
  Image,
  Archive
} from 'lucide-react';
import { useR2Storage } from '@/hooks/useR2Storage';
import { cn } from '@/lib/utils';

interface R2FileUploadProps {
  /** Unit ID for categorizing uploads */
  unitId?: string;
  /** Unit code for categorizing uploads */
  unitCode?: string;
  /** Upload category */
  category?: 'assignment' | 'material' | 'submission' | 'notes';
  /** Accept specific file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allow multiple file uploads */
  multiple?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Callback when upload completes */
  onUploadComplete?: (results: Array<{ fileUrl: string; fileName: string; originalName: string; size: number; key: string }>) => void;
  /** Custom styling */
  className?: string;
}

export const R2FileUpload: React.FC<R2FileUploadProps> = ({
  unitId,
  unitCode,
  category = 'material',
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.jpg,.png,.gif,.zip',
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = false,
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to select files',
  onUploadComplete,
  className
}) => {
  const {
    isUploading,
    uploadProgress,
    uploadFile,
    error,
    resetState,
    formatFileSize,
    getFileTypeIcon
  } = useR2Storage({
    autoShowToasts: true
  });

  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<Array<{ fileUrl: string; fileName: string; originalName: string; size: number; key: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, [multiple]);

  // Handle file selection
  const handleFileSelection = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds maximum size`);
        return false;
      }
      
      // Check file type if accept is specified
      if (accept) {
        const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedExtensions.includes(fileExtension)) {
          console.warn(`File ${file.name} type not accepted`);
          return false;
        }
      }
      
      return true;
    });

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
  }, [accept, maxSize, multiple]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    }
  }, [handleFileSelection]);

  // Remove selected file
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Upload files
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      resetState();
      const results = [];
      setCurrentFileIndex(0);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFileIndex(i + 1);

        const result = await uploadFile({
          file,
          unitId,
          unitCode,
          category
        });

        results.push({
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          originalName: result.originalName,
          size: result.size,
          key: result.key
        });
      }

      setUploadResults(results);
      setSelectedFiles([]);
      onUploadComplete?.(results);

    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [selectedFiles, unitId, unitCode, category, uploadFile, onUploadComplete, resetState]);

  // Reset everything
  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setUploadResults([]);
    setCurrentFileIndex(0);
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetState]);

  // Get file type icon
  const getFileIcon = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (file.type.includes('zip')) {
      return <Archive className="w-4 h-4 text-yellow-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {dragOver ? 'Drop files here' : 'Choose files or drag them here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: {accept}
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({selectedFiles.length})</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {multiple && selectedFiles.length > 1 
                  ? `Uploading file ${currentFileIndex} of ${selectedFiles.length}...`
                  : 'Uploading...'
                }
              </span>
              <span>{uploadProgress?.percentage || 0}%</span>
            </div>
            <Progress value={uploadProgress?.percentage || 0} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="space-y-2">
            <Label>Upload Results ({uploadResults.length} files)</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{result.originalName}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(result.size)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(result.fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}` : 'Files'}
              </>
            )}
          </Button>

          {(selectedFiles.length > 0 || uploadResults.length > 0) && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isUploading}
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
