import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Upload, FileText, Check, Clock, AlertCircle, Loader2, Download } from 'lucide-react';
import { fileStorageService, StoredDocument, UploadProgress } from '@/services/FileStorageService';
import { FallbackStorageIndicator } from '@/components/fallback/FallbackStorageIndicator';
import { format } from 'date-fns';

interface StudentAssignmentUploadProps {
  assignmentId: string;
  assignmentTitle: string;
  dueDate: Date;
  maxMarks: number;
  unitId: string;
  unitCode: string;
  lecturerId: string;
}

interface SubmissionData {
  id?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  unitId: string;
  unitCode: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'late';
  documents: StoredDocument[];
  comments?: string;
  wordCount?: number;
}

export const StudentAssignmentUpload: React.FC<StudentAssignmentUploadProps> = ({
  assignmentId,
  assignmentTitle,
  dueDate,
  maxMarks,
  unitId,
  unitCode,
  lecturerId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionComments, setSubmissionComments] = useState('');
  const [existingSubmission, setExistingSubmission] = useState<SubmissionData | null>(null);
  
  // Load existing submission on mount
  useEffect(() => {
    loadExistingSubmission();
  }, [assignmentId]);

  const loadExistingSubmission = async () => {
    if (!user) return;

    try {
      // Get documents for this assignment submission
      const documents = await fileStorageService.getDocuments(
        `${assignmentId}_${user.id}`,
        'student-submission',
        'submission'
      );

      if (documents.length > 0) {
        // Create submission from existing documents
        setExistingSubmission({
          id: `${user.id}_${assignmentId}`,
          assignmentId,
          studentId: user.id,
          studentName: user.name || user.email,
          unitId,
          unitCode,
          submittedAt: documents[0].uploadedAt,
          status: new Date() > dueDate ? 'late' : 'submitted',
          documents,
          comments: submissionComments
        });
      }
    } catch (error) {
      console.error('Failed to load existing submission:', error);
    }
  };

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
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile && !existingSubmission) {
      toast({
        title: "No File Selected",
        description: "Please select a file to submit",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit assignments",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(null);

      let submissionDocuments = existingSubmission?.documents || [];

      // Upload new file if selected
      if (selectedFile) {
        const submissionEntityId = `${assignmentId}_${user.id}`;
        
        try {
          const uploadedDocument = await fileStorageService.uploadDocument(
            selectedFile,
            {
              title: `${assignmentTitle} - Submission`,
              description: submissionComments || `Assignment submission by ${user.name || user.email}`,
              isVisible: true, // Always visible to lecturers
              uploadedBy: user.id,
              category: 'submission',
              entityId: submissionEntityId,
              entityType: 'student-submission'
            },
            (progress) => {
              setUploadProgress(progress);
            }
          );

          submissionDocuments = [...submissionDocuments, uploadedDocument];
          
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          
          // Handle specific upload errors with user-friendly messages
          let errorMessage = "Failed to upload assignment. Please try again.";
          
          if (uploadError instanceof Error) {
            if (uploadError.message.includes('Access Denied') || uploadError.message.includes('AccessDenied')) {
              errorMessage = "File upload temporarily unavailable. Please contact your instructor or try again later.";
            } else if (uploadError.message.includes('Quota exceeded') || uploadError.message.includes('RESOURCE_EXHAUSTED')) {
              errorMessage = "Upload service temporarily overloaded. Please wait a few minutes and try again.";
            } else if (uploadError.message.includes('too large')) {
              errorMessage = "File is too large. Please choose a file smaller than 10MB.";
            } else if (uploadError.message.includes('CORS') || uploadError.message.includes('Failed to fetch')) {
              errorMessage = "Network connection issue. Please check your internet connection and try again.";
            } else if (uploadError.message.includes('Invalid file type')) {
              errorMessage = "Invalid file type. Please choose a supported file format (PDF, DOC, DOCX, PPT, PPTX, TXT, MD).";
            } else {
              // Use the error message if it's already user-friendly
              errorMessage = uploadError.message;
            }
          }
          
          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive"
          });
          
          // Don't continue with submission if upload failed
          return;
        }
      }

      // Create submission record
      const submission: SubmissionData = {
        id: `${user.id}_${assignmentId}`,
        assignmentId,
        studentId: user.id,
        studentName: user.name || user.email,
        unitId,
        unitCode,
        submittedAt: new Date(),
        status: new Date() > dueDate ? 'late' : 'submitted',
        documents: submissionDocuments,
        comments: submissionComments,
        wordCount: submissionComments.split(/\s+/).length
      };

      // Save submission (you might want to save this to a submissions collection in Firestore)
      // For now, we'll just store it locally and notify
      setExistingSubmission(submission);

      toast({
        title: "Assignment Submitted",
        description: selectedFile 
          ? `${selectedFile.name} has been submitted successfully`
          : "Assignment submission updated successfully",
        variant: "default"
      });

      // Reset form
      setSelectedFile(null);
      setUploadProgress(null);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'late':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'late':
        return 'destructive';
      case 'draft':
      default:
        return 'secondary';
    }
  };

  const isOverdue = new Date() > dueDate;
  const canSubmit = !isOverdue || existingSubmission; // Allow resubmission if already submitted

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Your Submission</CardTitle>
            <CardDescription className="text-xs">
              Due: {format(dueDate, 'MMM dd, yyyy h:mm a')} • Max Marks: {maxMarks}
            </CardDescription>
          </div>
          
          {/* Submission Status */}
          {existingSubmission && (
            <Badge variant={getStatusColor(existingSubmission.status)}>
              {getStatusIcon(existingSubmission.status)}
              <span className="ml-1 capitalize">{existingSubmission.status}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Fallback Storage Indicator */}
        <FallbackStorageIndicator className="mb-4" showDetails={true} />
        
        {/* Existing Submission Display */}
        {existingSubmission && (
          <div className="mb-4 p-3 border rounded-lg bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-green-800">Submitted Documents</h4>
              <span className="text-xs text-green-600">
                {format(existingSubmission.submittedAt, 'MMM dd, yyyy h:mm a')}
              </span>
            </div>
            
            <div className="space-y-2">
              {existingSubmission.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white border rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.fileSize)} • {format(doc.uploadedAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.downloadUrl, '_blank')}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
            
            {existingSubmission.comments && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Comments:</strong> {existingSubmission.comments}
              </div>
            )}
          </div>
        )}

        {/* Upload New Submission */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!canSubmit}
              variant={existingSubmission ? "outline" : "default"}
            >
              <Upload className="w-4 h-4 mr-2" />
              {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Upload your assignment file for "{assignmentTitle}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Due Date Warning */}
              {isOverdue && !existingSubmission && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      This assignment is overdue. Late submissions may receive reduced marks.
                    </span>
                  </div>
                </div>
              )}
              
              {/* File Upload */}
              <div>
                <Label htmlFor="assignment-file">Assignment File</Label>
                <Input
                  id="assignment-file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, MD (max 10MB)
                </p>
              </div>
              
              {/* Comments */}
              <div>
                <Label htmlFor="submission-comments">Comments (Optional)</Label>
                <Textarea
                  id="submission-comments"
                  value={submissionComments}
                  onChange={(e) => setSubmissionComments(e.target.value)}
                  placeholder="Any comments about your submission..."
                  rows={3}
                />
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
                <Button onClick={handleSubmitAssignment} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {existingSubmission ? 'Update' : 'Submit'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {!canSubmit && !existingSubmission && (
          <p className="text-sm text-red-600 mt-2 text-center">
            This assignment is overdue and can no longer be submitted.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
