
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { BookOpen, Pencil, Upload, RefreshCw, Send, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  type: string;
  studentType: 'essay' | 'document';
  assignDate: Date;
  dueDate: Date;
  maxMarks: number;
  instructions: string;
  requiresAICheck: boolean;
  unitId: string;
  unitCode?: string;
  unitName?: string;
  documents?: { fileName: string; fileUrl: string; }[];
}

interface AssignmentWorkplaceProps {
  assignment: Assignment;
  onSubmissionComplete: (submission: any) => void;
  onSaveDraft?: (draftData: any) => void;
  savedDraft?: any;
  trigger?: React.ReactNode;
}

export const AssignmentWorkplace: React.FC<AssignmentWorkplaceProps> = ({
  assignment,
  onSubmissionComplete,
  onSaveDraft,
  savedDraft,
  trigger
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null); // Placeholder for existing submission logic
  const [essayTitle, setEssayTitle] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && savedDraft && assignment.studentType === 'essay') {
      setEssayTitle(savedDraft.title || '');
      setEssayContent(savedDraft.content || '');
      if (savedDraft.lastSaved) {
        setLastSaved(new Date(savedDraft.lastSaved));
      }
    }
  }, [isOpen, savedDraft, assignment.studentType]);

  useEffect(() => {
    if (assignment.studentType === 'essay' && (essayContent || essayTitle)) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        if (onSaveDraft) {
          const draftData = {
            assignmentId: assignment.id,
            title: essayTitle,
            content: essayContent,
            lastSaved: new Date(),
          };
          onSaveDraft(draftData);
          setLastSaved(new Date());
          toast({ title: 'Draft Saved', description: `Auto-saved at ${format(new Date(), 'HH:mm:ss')}` });
        }
      }, 5000);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [essayContent, essayTitle, assignment.id, onSaveDraft, assignment.studentType]);

  const isLate = isAfter(new Date(), assignment.dueDate);
  const wordCount = essayContent.split(/\s+/).filter(Boolean).length;
  // Only show essay workspace if studentType is exactly 'essay'
  const isEssay = assignment.studentType === 'essay';

  const handlePrepareSubmission = () => {
    if (isEssay && !essayContent.trim()) {
      return toast({ title: 'Essay is empty', description: 'Please write your essay before submitting.', variant: 'destructive' });
    }
    if (!isEssay && !selectedFile) {
      return toast({ title: 'No file selected', description: 'Please select a file to upload.', variant: 'destructive' });
    }
    setShowConfirmation(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: 'Please select a file smaller than 10MB.', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      toast({ title: 'File Selected', description: `${file.name} is ready for upload.` });
    }
  };

  const handleFinalSubmission = async () => {
    if (!user) return toast({ title: 'Not Authenticated', variant: 'destructive' });
    setIsSubmitting(true);
    try {
      const submissionData = {
        assignmentId: assignment.id,
        studentId: user.id,
        submissionType: assignment.studentType,
        content: isEssay ? essayContent : undefined,
        title: isEssay ? essayTitle : undefined,
        file: !isEssay ? selectedFile : undefined,
        fileName: !isEssay ? selectedFile?.name : undefined,
        fileSize: !isEssay ? selectedFile?.size : undefined,
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
      };
      await onSubmissionComplete(submissionData);
      setIsOpen(false);
      setEssayContent('');
      setEssayTitle('');
      setSelectedFile(null);
      toast({ title: 'Submission Successful!', description: `Your ${assignment.studentType} has been submitted.` });
    } catch (error) {
      console.error('Submission failed:', error);
      toast({ title: 'Submission Failed', description: 'An error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTrigger = () => {
    if (trigger) return <div onClick={() => setIsOpen(true)}>{trigger}</div>;
    return <Button onClick={() => setIsOpen(true)}>Open Assignment</Button>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {assignment.title}
          </DialogTitle>
          <DialogDescription>
            Due: {format(assignment.dueDate, 'PPP p')}
            {isLate && <Badge variant="destructive" className="ml-2">Late</Badge>}
            <Badge variant="secondary" className="ml-2">{assignment.maxMarks} Marks</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {isEssay ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <Input placeholder="Essay Title" value={essayTitle} onChange={e => setEssayTitle(e.target.value)} />
                <Textarea placeholder="Start writing your masterpiece..." className="min-h-[40vh]" value={essayContent} onChange={e => setEssayContent(e.target.value)} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Word Count: {wordCount}</span>
                  {lastSaved && <span>Last saved: {format(lastSaved, 'HH:mm:ss')}</span>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                {existingSubmission && existingSubmission.submissionType === 'document' && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />Previously Submitted</CardTitle></CardHeader>
                    <CardContent><p>{existingSubmission.fileName}</p></CardContent>
                  </Card>
                )}
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Document</Label>
                  <Input id="file-upload" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileSelect} disabled={!!existingSubmission} />
                  <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
                </div>
                {selectedFile && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="p-6 border-t bg-background flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {existingSubmission ? `Submitted on ${format(existingSubmission.submittedAt, 'PPp')}` : 'Ready to submit'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <AlertDialogTrigger asChild>
                <Button onClick={handlePrepareSubmission} disabled={isSubmitting || !!existingSubmission}>
                  {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Submit Assignment</>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />Confirm Submission</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3 pt-2">
                    <p>You are about to submit this assignment. This action cannot be undone.</p>
                    {isLate && <p className="text-red-600 font-bold">This is a LATE submission.</p>}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinalSubmission}>Proceed</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentWorkplace;
