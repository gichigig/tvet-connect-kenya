import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { StorageService, getStorageConfig } from '@/integrations/storage';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  /**
   * Callback function to be called when a file is uploaded successfully
   */
  onUpload?: (url: string, file: File) => void;
  /**
   * Accepted file types (e.g., '.pdf,.doc,.docx')
   */
  accept?: string;
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  /**
   * Path prefix for the uploaded file
   */
  pathPrefix?: string;
  /**
   * Label for the file input
   */
  label?: string;
  /**
   * Allow multiple file uploads
   */
  multiple?: boolean;
  /**
   * Custom metadata to be added to the uploaded file
   */
  metadata?: Record<string, string>;
}

export const FileUploader = ({
  onUpload,
  accept = '*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  pathPrefix = 'uploads',
  label = 'Upload File',
  multiple = false,
  metadata = {}
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const storageService = new StorageService(getStorageConfig());

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        }

        // Create unique file key
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const key = `${pathPrefix}/${timestamp}-${randomString}-${file.name}`;

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const next = prev + 10;
            return next > 90 ? 90 : next;
          });
        }, 500);

        // Upload file
        const { url } = await storageService.uploadFile({
          file,
          key,
          contentType: file.type,
          metadata: {
            originalName: file.name,
            size: file.size.toString(),
            lastModified: file.lastModified.toString(),
            ...metadata
          }
        });

        clearInterval(progressInterval);
        setProgress(100);

        onUpload?.(url, file);

        toast({
          title: 'Upload Complete',
          description: `${file.name} has been uploaded successfully.`
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Upload Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">{label}</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={uploading}
          className="mt-1"
        />
        {accept !== '*' && (
          <p className="mt-1 text-sm text-gray-600">
            Accepted formats: {accept.split(',').join(', ')}
          </p>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
