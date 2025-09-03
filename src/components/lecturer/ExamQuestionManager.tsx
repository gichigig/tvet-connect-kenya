import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSemesterPlan, ExamQuestion, WeeklyExam } from '@/contexts/SemesterPlanContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Plus, Edit3, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Send } from 'lucide-react';

interface ExamQuestionManagerProps {
  unitId: string;
  weekNumber: number;
  exam: WeeklyExam;
  onQuestionsChange?: (questions: ExamQuestion[]) => void; // Add callback for creation mode
  isCreationMode?: boolean; // Flag to indicate creation mode
}

export const ExamQuestionManager: React.FC<ExamQuestionManagerProps> = ({
  unitId,
  weekNumber,
  exam,
  onQuestionsChange,
  isCreationMode = false
}) => {
  const { user } = useAuth();
  const {
    addExamQuestion,
    updateExamQuestion,
    removeExamQuestion,
    submitExamForApproval,
    approveExam,
    rejectExam
  } = useSemesterPlan();
  const { toast } = useToast();
  
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [hodComments, setHodComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [questionForm, setQuestionForm] = useState<Partial<ExamQuestion>>({
    questionText: '',
    questionType: 'essay',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    difficulty: 'medium',
    bloomLevel: 'understanding'
  });

  const isHOD = user?.role === 'hod' || user?.role === 'admin';
  const isLecturer = user?.role === 'lecturer' || user?.role === 'admin';

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: '',
      questionType: 'essay',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      difficulty: 'medium',
      bloomLevel: 'understanding'
    });
    setEditingQuestion(null);
  };

  const handleQuestionSubmit = async () => {
    if (!questionForm.questionText?.trim()) {
      toast({
        title: "Missing Question",
        description: "Please enter the question text",
        variant: "destructive"
      });
      return;
    }

    if (questionForm.questionType === 'multiple_choice' && 
        (!questionForm.options?.some(opt => opt.trim()) || !questionForm.correctAnswer)) {
      toast({
        title: "Incomplete Multiple Choice",
        description: "Please provide options and select the correct answer",
        variant: "destructive"
      });
      return;
    }

    try {
      const questionData = {
        id: editingQuestion?.id || `question-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        questionText: questionForm.questionText!,
        questionType: questionForm.questionType!,
        options: questionForm.questionType === 'multiple_choice' ? questionForm.options : undefined,
        correctAnswer: questionForm.questionType === 'multiple_choice' || questionForm.questionType === 'true_false' 
          ? questionForm.correctAnswer : undefined,
        marks: questionForm.marks!,
        difficulty: questionForm.difficulty!,
        bloomLevel: questionForm.bloomLevel!
      };

      if (isCreationMode && onQuestionsChange) {
        // Creation mode - update local state
        if (editingQuestion) {
          const updatedQuestions = exam.questions.map(q => 
            q.id === editingQuestion.id ? questionData : q
          );
          onQuestionsChange(updatedQuestions);
        } else {
          const updatedQuestions = [...exam.questions, questionData];
          onQuestionsChange(updatedQuestions);
        }
        
        toast({
          title: editingQuestion ? "Question Updated" : "Question Added",
          description: editingQuestion 
            ? "The question has been updated successfully"
            : "The question has been added successfully"
        });
      } else {
        // Normal mode - save to backend
        if (editingQuestion) {
          await updateExamQuestion(unitId, weekNumber, exam.id, editingQuestion.id, questionData);
          toast({
            title: "Question Updated",
            description: "The question has been updated successfully"
          });
        } else {
          await addExamQuestion(unitId, weekNumber, exam.id, questionData);
          toast({
            title: "Question Added",
            description: "The question has been added successfully"
          });
        }
      }

      resetQuestionForm();
      setIsQuestionDialogOpen(false);
    } catch (error) {
      console.error('Question operation failed:', error);
      toast({
        title: "Operation Failed",
        description: "Failed to save question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditQuestion = (question: ExamQuestion) => {
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer?.toString() || '',
      marks: question.marks,
      difficulty: question.difficulty,
      bloomLevel: question.bloomLevel
    });
    setEditingQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await removeExamQuestion(unitId, weekNumber, exam.id, questionId);
      toast({
        title: "Question Deleted",
        description: "The question has been deleted successfully"
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForApproval = async () => {
    if (exam.questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question before submitting for approval",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitExamForApproval(unitId, weekNumber, exam.id);
      toast({
        title: "Submitted for Approval",
        description: "The exam has been submitted to HOD for approval"
      });
    } catch (error) {
      console.error('Submit failed:', error);
      toast({
        title: "Submit Failed",
        description: "Failed to submit for approval. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApprovalAction = async () => {
    try {
      if (approvalAction === 'approve') {
        await approveExam(unitId, weekNumber, exam.id, hodComments);
        toast({
          title: "Exam Approved",
          description: "The exam has been approved successfully"
        });
      } else {
        if (!rejectionReason.trim()) {
          toast({
            title: "Missing Reason",
            description: "Please provide a reason for rejection",
            variant: "destructive"
          });
          return;
        }
        await rejectExam(unitId, weekNumber, exam.id, rejectionReason, hodComments);
        toast({
          title: "Exam Rejected",
          description: "The exam has been rejected"
        });
      }

      setIsApprovalDialogOpen(false);
      setHodComments('');
      setRejectionReason('');
    } catch (error) {
      console.error('Approval action failed:', error);
      toast({
        title: "Action Failed",
        description: "Failed to process approval action. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getApprovalStatusBadge = () => {
    switch (exam.approvalStatus) {
      case 'draft':
        return <Badge variant="secondary"><Edit3 className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'pending_approval':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="destructive" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Exam Questions
              {getApprovalStatusBadge()}
            </CardTitle>
            <CardDescription className="text-xs">
              {exam.questions.length} questions • Total: {totalMarks} marks
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {isLecturer && exam.approvalStatus === 'draft' && (
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={resetQuestionForm}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Question
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
            
            {isLecturer && exam.approvalStatus === 'draft' && exam.questions.length > 0 && (
              <Button size="sm" onClick={handleSubmitForApproval}>
                <Send className="w-3 h-3 mr-1" />
                Submit for Approval
              </Button>
            )}
            
            {isHOD && exam.approvalStatus === 'pending_approval' && (
              <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      {exam.questions.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Q{index + 1}.</span>
                      <Badge variant="outline" className="text-xs">
                        {question.questionType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{question.questionText}</p>
                    
                    {question.questionType === 'multiple_choice' && question.options && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className={`text-xs p-2 rounded border ${
                            question.correctAnswer === idx.toString() ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}>
                            {String.fromCharCode(65 + idx)}. {option}
                            {question.correctAnswer === idx.toString() && (
                              <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.questionType === 'true_false' && (
                      <p className="text-xs text-green-600">
                        Correct Answer: {question.correctAnswer === 'true' ? 'True' : 'False'}
                      </p>
                    )}
                  </div>
                  
                  {isLecturer && exam.approvalStatus === 'draft' && (
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {exam.approvalStatus === 'rejected' && (
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Exam Rejected</span>
            </div>
            <p className="text-sm text-red-700 mb-2">{exam.rejectionReason}</p>
            {exam.hodComments && (
              <p className="text-xs text-red-600">HOD Comments: {exam.hodComments}</p>
            )}
          </div>
        </CardContent>
      )}

      {/* Question Dialog */}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          <DialogDescription>
            Create or modify an exam question
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              value={questionForm.questionText || ''}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
              placeholder="Enter the question text"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={questionForm.questionType}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, questionType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                min="1"
                value={questionForm.marks}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          
          {questionForm.questionType === 'multiple_choice' && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {questionForm.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm w-6">{String.fromCharCode(65 + idx)}.</span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(questionForm.options || [])];
                        newOptions[idx] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={questionForm.correctAnswer === idx.toString()}
                      onChange={() => setQuestionForm(prev => ({ ...prev, correctAnswer: idx.toString() }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {questionForm.questionType === 'true_false' && (
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={String(questionForm.correctAnswer)}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, correctAnswer: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={questionForm.difficulty}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, difficulty: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bloom-level">Bloom's Level</Label>
              <Select
                value={questionForm.bloomLevel}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, bloomLevel: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remembering">Remembering</SelectItem>
                  <SelectItem value="understanding">Understanding</SelectItem>
                  <SelectItem value="applying">Applying</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="evaluating">Evaluating</SelectItem>
                  <SelectItem value="creating">Creating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuestionSubmit}>
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Exam</DialogTitle>
            <DialogDescription>
              Review and approve or reject this exam
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Exam:</strong> {exam.title}</p>
              <p className="text-sm"><strong>Questions:</strong> {exam.questions.length}</p>
              <p className="text-sm"><strong>Total Marks:</strong> {totalMarks}</p>
            </div>
            
            <div>
              <Label>Action</Label>
              <Select
                value={approvalAction}
                onValueChange={(value) => setApprovalAction(value as 'approve' | 'reject')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {approvalAction === 'reject' && (
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this exam is being rejected"
                  rows={3}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="hod-comments">Comments (Optional)</Label>
              <Textarea
                id="hod-comments"
                value={hodComments}
                onChange={(e) => setHodComments(e.target.value)}
                placeholder="Additional comments for the lecturer"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprovalAction}>
                {approvalAction === 'approve' ? 'Approve Exam' : 'Reject Exam'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
