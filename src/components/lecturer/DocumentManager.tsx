import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSemesterPlan, WeeklyDocument } from '@/contexts/SemesterPlanContext';
import { Upload, FileText, Download, Trash2, Eye, EyeOff, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fileStorageService, UploadProgress } from '@/services/FileStorageService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface DocumentManagerProps {
  unitId: string;
  weekNumber: number;
  itemId: string;
  itemType: 'material' | 'assignment';
  documents?: WeeklyDocument[];
  title: string;
  onDocumentsChange?: (documents: WeeklyDocument[]) => void; // Add callback for creation mode
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  unitId,
  weekNumber,
  itemId,
  itemType,
  documents = [],
  title,
  onDocumentsChange
}) => {
  const { addDocumentToMaterial, addDocumentToAssignment, removeDocument } = useSemesterPlan();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isVisible: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and select a file",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(null);

      // Determine entity type based on item type
      const entityType = itemType === 'material' 
        ? 'semester-plan-material' as const
        : 'semester-plan-assignment' as const;

      // Upload to persistent storage
      const uploadedDocument = await fileStorageService.uploadDocument(
        selectedFile,
        {
          title: formData.title,
          description: formData.description,
          isVisible: formData.isVisible,
          uploadedBy: user.id,
          category: itemType,
          entityId: itemId,
          entityType
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Convert to WeeklyDocument format for compatibility
      const documentData: WeeklyDocument = {
        id: uploadedDocument.id,
        title: uploadedDocument.title,
        description: uploadedDocument.description,
        fileName: uploadedDocument.fileName,
        fileUrl: uploadedDocument.downloadUrl,
        fileSize: uploadedDocument.fileSize,
        isVisible: uploadedDocument.isVisible,
        uploadDate: uploadedDocument.uploadedAt,
        uploadedBy: uploadedDocument.uploadedBy
      };

      // If in creation mode (onDocumentsChange provided), update local state
      if (onDocumentsChange) {
        const updatedDocuments = [...documents, documentData];
        onDocumentsChange(updatedDocuments);
      } else {
        // Normal mode - save to context/backend
        if (itemType === 'material') {
          await addDocumentToMaterial(unitId, weekNumber, itemId, documentData);
        } else {
          await addDocumentToAssignment(unitId, weekNumber, itemId, documentData);
        }
      }

      toast({
        title: "Document Uploaded",
        description: `${selectedFile.name} has been uploaded successfully to AWS S3 storage`
      });

      // Reset form
      setFormData({ title: '', description: '', isVisible: true });
      setSelectedFile(null);
      setUploadProgress(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await removeDocument(unitId, weekNumber, itemId, documentId, itemType);
      toast({
        title: "Document Removed",
        description: "Document has been removed successfully"
      });
    } catch (error) {
      console.error('Remove failed:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <CardDescription className="text-xs">
              Additional documents for {title}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-3 h-3 mr-1" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a document to {title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doc-title">Title</Label>
                  <Input
                    id="doc-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Document title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="doc-description">Description</Label>
                  <Textarea
                    id="doc-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Document description (optional)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="doc-file">File</Label>
                  <Input
                    id="doc-file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="doc-visible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                  />
                  <Label htmlFor="doc-visible">Visible to students</Label>
                </div>

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      {documents.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {doc.fileName} • {formatFileSize(doc.fileSize)} • {format(doc.uploadDate, 'MMM dd, yyyy')}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={doc.isVisible ? "default" : "secondary"}>
                    {doc.isVisible ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hidden
                      </>
                    )}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
