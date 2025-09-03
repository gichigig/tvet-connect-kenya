import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Send,
  Loader2,
  Shield,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { uploadCourseMaterialViaAPI } from '@/integrations/aws/apiUpload';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'essay';
  assignDate: Date;
  dueDate: Date;
  maxMarks: number;
  instructions: string;
  requiresAICheck: boolean;
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId: string;
  lecturerName: string;
}

interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionType: 'document' | 'essay';
  content?: string; // For essay submissions
  fileUrl?: string; // For document submissions
  fileName?: string;
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'late';
  marks?: number;
  feedback?: string;
  aiCheckResult?: {
    passed: boolean;
    similarity: number;
    report: string;
  };
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  existingSubmission?: StudentSubmission;
  onSubmissionComplete: (submission: StudentSubmission) => void;
}

export const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({
  assignment,
  existingSubmission,
  onSubmissionComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [essayContent, setEssayContent] = useState(existingSubmission?.content || '');
  const [isRunningAICheck, setIsRunningAICheck] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<any>(null);

  const isLate = isAfter(new Date(), assignment.dueDate);
  const canSubmit = !existingSubmission || existingSubmission.status !== 'submitted';
  const isEssay = assignment.type === 'essay';

  // Mock AI plagiarism checker
  const runAICheck = async (content: string): Promise<any> => {
    setIsRunningAICheck(true);
    
    // Simulate AI check delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI check result
    const similarity = Math.random() * 30; // Random similarity percentage
    const passed = similarity < 20; // Pass if less than 20% similarity
    
    const result = {
      passed,
      similarity: Math.round(similarity),
      report: `AI Detection Report:\n- Similarity Score: ${Math.round(similarity)}%\n- Status: ${passed ? 'PASSED' : 'FAILED'}\n- Analysis: ${passed ? 'Content appears to be original' : 'High similarity detected with existing sources'}`
    };
    
    setAiCheckResult(result);
    setIsRunningAICheck(false);
    
    return result;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit for assignments)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type for document assignments
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, Word document, or text file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) ready for upload`
      });
    }
  };

  const handlePrepareSubmission = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit assignments",
        variant: "destructive"
      });
      return;
    }

    if (isEssay && !essayContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please write your essay before submitting",
        variant: "destructive"
      });
      return;
    }

    if (!isEssay && !selectedFile) {
      toast({
        title: "Missing File",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    // If essay requires AI check, run it first
    if (isEssay && assignment.requiresAICheck && !aiCheckResult) {
      toast({
        title: "Running AI Check",
        description: "Checking your essay for originality..."
      });
      
      const aiResult = await runAICheck(essayContent);
      
      if (!aiResult.passed) {
        toast({
          title: "AI Check Failed",
          description: `High similarity detected (${aiResult.similarity}%). Please revise your essay.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleSubmission = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      let fileUrl = '';
      let fileName = '';

      // Handle document uploads
      if (!isEssay && selectedFile) {
        toast({
          title: "Uploading File",
          description: "Uploading your assignment to cloud storage..."
        });

        try {
          fileUrl = await uploadCourseMaterialViaAPI(selectedFile, assignment.unitId, assignment.unitCode);
          fileName = selectedFile.name;
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload your assignment. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Create submission record
      const submission: StudentSubmission = {
        id: `submission-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        assignmentId: assignment.id,
        studentId: user.id,
        studentName: `${user.firstName} ${user.lastName}`,
        submissionType: assignment.type,
        content: isEssay ? essayContent : undefined,
        fileUrl: !isEssay ? fileUrl : undefined,
        fileName: !isEssay ? fileName : undefined,
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
        aiCheckResult: aiCheckResult
      };

      // Store submission - now managed by backend context, not localStorage
      console.log('Assignment submission saved to backend context');

      onSubmissionComplete(submission);
      setIsDialogOpen(false);
      setShowConfirmation(false);

      toast({
        title: "Assignment Submitted",
        description: `Your ${assignment.type} has been submitted successfully${isLate ? ' (Late submission)' : ''}`,
        variant: "default"
      });

      // Reset form
      setSelectedFile(null);
      setEssayContent('');
      setAiCheckResult(null);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription>{assignment.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {assignment.type}
            </Badge>
            {assignment.requiresAICheck && (
              <Badge variant="secondary" className="text-blue-600">
                <Shield className="w-3 h-3 mr-1" />
                AI Check
              </Badge>
            )}
            {isLate && (
              <Badge variant="destructive">
                <Clock className="w-3 h-3 mr-1" />
                Late
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Assignment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Due Date:</span>
            <p className={`${isLate ? 'text-red-600' : 'text-gray-600'}`}>
              {format(assignment.dueDate, 'PPP p')}
            </p>
          </div>
          <div>
            <span className="font-medium">Max Marks:</span>
            <p className="text-gray-600">{assignment.maxMarks}</p>
          </div>
        </div>

        {/* Instructions */}
        {assignment.instructions && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Instructions:</h4>
            <p className="text-sm text-gray-600">{assignment.instructions}</p>
          </div>
        )}

        {/* Existing Submission Status */}
        {existingSubmission && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Your Submission</h4>
              <Badge className={getStatusColor(existingSubmission.status)}>
                {existingSubmission.status}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>Submitted: {format(existingSubmission.submittedAt, 'PPP p')}</p>
              {existingSubmission.fileName && (
                <p>File: {existingSubmission.fileName}</p>
              )}
              {existingSubmission.marks !== undefined && (
                <p className="text-green-600 font-medium">
                  Grade: {existingSubmission.marks}/{assignment.maxMarks}
                </p>
              )}
              {existingSubmission.feedback && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="font-medium">Feedback:</p>
                  <p>{existingSubmission.feedback}</p>
                </div>
              )}
              {existingSubmission.aiCheckResult && (
                <div className={`mt-2 p-2 rounded ${existingSubmission.aiCheckResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="font-medium">AI Check Result:</p>
                  <p className={existingSubmission.aiCheckResult.passed ? 'text-green-600' : 'text-red-600'}>
                    {existingSubmission.aiCheckResult.passed ? 'PASSED' : 'FAILED'} 
                    ({existingSubmission.aiCheckResult.similarity}% similarity)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submission Button */}
        {canSubmit && !isAfter(new Date(), assignment.dueDate) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
                <DialogDescription>
                  {isEssay 
                    ? 'Write your essay in the text area below'
                    : 'Upload your document file'
                  }
                  {assignment.requiresAICheck && (
                    <span className="block mt-1 text-blue-600 font-medium">
                      ⚠️ This assignment will be checked for originality using AI detection
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isEssay ? (
                  <div className="space-y-2">
                    <Label>Your Essay</Label>
                    <Textarea
                      value={essayContent}
                      onChange={(e) => setEssayContent(e.target.value)}
                      placeholder="Write your essay here..."
                      rows={12}
                      className="min-h-[300px]"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{essayContent.length} characters</span>
                      <span>{essayContent.split(' ').filter(word => word.length > 0).length} words</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Upload Document</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Check Result Display */}
                {isRunningAICheck && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm">Running AI originality check...</span>
                  </div>
                )}

                {aiCheckResult && (
                  <div className={`p-3 rounded-lg ${aiCheckResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <div className="flex items-center gap-2 mb-2">
                      {aiCheckResult.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-medium ${aiCheckResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        AI Check {aiCheckResult.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p>Similarity Score: {aiCheckResult.similarity}%</p>
                      <p className="mt-1 text-gray-600">
                        {aiCheckResult.passed 
                          ? 'Your content appears to be original.' 
                          : 'High similarity detected. Please revise your work.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setShowConfirmation(false);
                    setAiCheckResult(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePrepareSubmission} 
                    disabled={isSubmitting || isRunningAICheck || (aiCheckResult && !aiCheckResult.passed)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Confirm Submission
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this assignment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Submission Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Submission Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Assignment:</span> {assignment.title}</p>
                  <p><span className="font-medium">Type:</span> {assignment.type === 'essay' ? 'Essay' : 'Document Upload'}</p>
                  <p><span className="font-medium">Due Date:</span> {format(assignment.dueDate, 'PPP p')}</p>
                  {isEssay && (
                    <p><span className="font-medium">Word Count:</span> {essayContent.split(' ').filter(word => word.length > 0).length} words</p>
                  )}
                  {!isEssay && selectedFile && (
                    <p><span className="font-medium">File:</span> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                  )}
                  {aiCheckResult && (
                    <p><span className="font-medium">AI Check:</span> 
                      <span className={aiCheckResult.passed ? 'text-green-600' : 'text-red-600'}>
                        {aiCheckResult.passed ? ' PASSED' : ' FAILED'} ({aiCheckResult.similarity}% similarity)
                      </span>
                    </p>
                  )}
                  {isLate && (
                    <p className="text-red-600 font-medium">⚠️ This is a late submission</p>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>Once submitted, you cannot modify this assignment. Please review your work carefully.</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmission}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Yes, Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Late submission warning */}
        {canSubmit && isLate && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">
              This assignment is past due. Late submissions may receive reduced marks.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};