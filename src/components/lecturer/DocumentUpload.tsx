import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, FileText, Calendar, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploadProps {
  unitId: string;
  unitCode: string;
  unitName: string;
  onDocumentUploaded?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  unitId,
  unitCode,
  unitName,
  onDocumentUploaded
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: 'notes',
    isVisible: true,
    dueDate: '',
    semester: '',
    academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${unitCode}/${formData.documentType}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title for the document');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileUrl = await uploadToStorage(selectedFile);

      // Save document metadata to database
      const { error } = await supabase
        .from('document_uploads')
        .insert([{
          title: formData.title,
          description: formData.description,
          file_url: fileUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          document_type: formData.documentType,
          unit_id: unitId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          is_visible: formData.isVisible,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          semester: formData.semester,
          academic_year: formData.academicYear
        }]);

      if (error) throw error;

      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        documentType: 'notes',
        isVisible: true,
        dueDate: '',
        semester: '',
        academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
      });
      setSelectedFile(null);
      
      onDocumentUploaded?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document - {unitCode} ({unitName})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.txt,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="mt-1"
          />
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter document title"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter document description"
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Document Type</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Lecture Notes</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="lecture_material">Lecture Material</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="syllabus">Syllabus</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Visibility</Label>
            <Select
              value={formData.isVisible ? 'visible' : 'hidden'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isVisible: value === 'visible' }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visible to Students
                  </div>
                </SelectItem>
                <SelectItem value="hidden">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Hidden from Students
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
              placeholder="e.g., 1, 2"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="academic-year">Academic Year</Label>
            <Input
              id="academic-year"
              value={formData.academicYear}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
              placeholder="e.g., 2024/2025"
              className="mt-1"
            />
          </div>

          {formData.documentType === 'assignment' && (
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading || !formData.title.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};