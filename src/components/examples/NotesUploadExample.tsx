/**
 * Example: Lecturer Notes Upload Component using R2 Storage
 * Demonstrates how to integrate R2 file upload into existing components
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { R2FileUpload } from '@/components/ui/R2FileUpload';
import { R2FileManager } from '@/components/ui/R2FileManager';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus } from 'lucide-react';

interface NotesUploadExampleProps {
  unitId: string;
  unitCode: string;
  unitName: string;
}

export const NotesUploadExample: React.FC<NotesUploadExampleProps> = ({
  unitId,
  unitCode,
  unitName
}) => {
  const { toast } = useToast();
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [notesMetadata, setNotesMetadata] = useState({
    title: '',
    topic: '',
    description: ''
  });

  // Handle successful upload
  const handleUploadComplete = (results: any[]) => {
    // Add metadata to uploaded files
    const filesWithMetadata = results.map(file => ({
      ...file,
      ...notesMetadata,
      uploadedAt: new Date(),
      category: 'notes' as const,
      unitId,
      unitCode,
      mimeType: 'application/pdf' // You would detect this from the actual file
    }));

    setUploadedFiles(prev => [...prev, ...filesWithMetadata]);
    setNotesMetadata({ title: '', topic: '', description: '' });
    setShowUploader(false);

    toast({
      title: "Notes Uploaded Successfully",
      description: `${results.length} file(s) uploaded for ${unitCode}`,
    });
  };

  // Handle file deletion
  const handleFileDelete = (fileKey: string) => {
    setUploadedFiles(prev => prev.filter(file => file.key !== fileKey));
    toast({
      title: "File Deleted",
      description: "The file has been removed successfully.",
    });
  };

  // Handle file sharing
  const handleFileShare = (file: any) => {
    // Copy share link to clipboard
    navigator.clipboard.writeText(file.fileUrl);
    toast({
      title: "Share Link Copied",
      description: "The file link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Course Notes - {unitName}
          </CardTitle>
          <CardDescription>
            Upload and manage course materials for {unitCode}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowUploader(true)}
            disabled={showUploader}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload New Notes
          </Button>
        </CardContent>
      </Card>

      {/* Upload Form */}
      {showUploader && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Course Notes</CardTitle>
            <CardDescription>
              Add title and description for your notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notesMetadata.title}
                  onChange={(e) => setNotesMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Week 1 - Introduction to Programming"
                />
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={notesMetadata.topic}
                  onChange={(e) => setNotesMetadata(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Variables and Data Types"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={notesMetadata.description}
                onChange={(e) => setNotesMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the content..."
                rows={3}
              />
            </div>

            <R2FileUpload
              unitId={unitId}
              unitCode={unitCode}
              category="notes"
              title="Select Files"
              description="Upload PDF, DOC, PPT or other course materials"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
              multiple={true}
              onUploadComplete={handleUploadComplete}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUploader(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Manager */}
      {uploadedFiles.length > 0 && (
        <R2FileManager
          files={uploadedFiles}
          title={`Uploaded Notes (${uploadedFiles.length})`}
          description="Manage your course materials"
          allowDelete={true}
          allowShare={true}
          allowPreview={true}
          onFileDelete={handleFileDelete}
          onFileShare={handleFileShare}
          onFilePreview={(file) => {
            // Open in new tab for preview
            window.open(file.fileUrl, '_blank');
          }}
        />
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && !showUploader && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes uploaded yet</h3>
            <p className="text-gray-500 mb-4">
              Start by uploading course materials for {unitCode}
            </p>
            <Button onClick={() => setShowUploader(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Notes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
