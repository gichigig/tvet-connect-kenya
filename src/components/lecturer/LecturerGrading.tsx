import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  GraduationCap, 
  Eye, 
  Edit3, 
  Save, 
  Send, 
  FileText, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Award,
  Shield,
  RotateCcw,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface LecturerGradingProps {
  assignments: any[];
  unitId: string;
  unitCode: string;
  unitName: string;
  onGradeSubmission: (assignmentId: string, gradeData: any) => void;
  onCreateMakeupAssignment?: (makeupData: any) => void;
}

interface GradeFormData {
  marks: number;
  feedback: string;
  rubricScores?: { [criteria: string]: number };
  gradingNotes?: string;
  recommendedActions?: string[];
}

export const LecturerGrading: React.FC<LecturerGradingProps> = ({
  assignments,
  unitId,
  unitCode,
  unitName,
  onGradeSubmission,
  onCreateMakeupAssignment
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showGradingDialog, setShowGradingDialog] = useState(false);
  const [showMakeupDialog, setShowMakeupDialog] = useState(false);
  const [gradeForm, setGradeForm] = useState<GradeFormData>({
    marks: 0,
    feedback: '',
    rubricScores: {},
    gradingNotes: '',
    recommendedActions: []
  });
  
  const [makeupForm, setMakeupForm] = useState({
    title: '',
    description: '',
    type: 'assignment' as 'assignment' | 'cat',
    dueDate: new Date(),
    maxMarks: 100,
    instructions: '',
    eligibleStudents: [] as string[],
    reason: ''
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded' | 'hod_review'>('all');

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleGradeAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setGradeForm({
      marks: assignment.gradingWorkflow?.lecturer?.marks || 0,
      feedback: assignment.gradingWorkflow?.lecturer?.feedback || '',
      rubricScores: {},
      gradingNotes: '',
      recommendedActions: []
    });
    setShowGradingDialog(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedAssignment || gradeForm.marks < 0 || gradeForm.marks > selectedAssignment.maxMarks) {
      toast({
        title: "Invalid Grade",
        description: `Please enter a valid score between 0 and ${selectedAssignment.maxMarks}`,
        variant: "destructive"
      });
      return;
    }

    const gradeData = {
      assignmentId: selectedAssignment.id,
      studentId: selectedAssignment.studentId,
      marks: gradeForm.marks,
      feedback: gradeForm.feedback,
      rubricScores: gradeForm.rubricScores,
      gradingNotes: gradeForm.gradingNotes,
      gradedBy: `${user?.firstName} ${user?.lastName}`,
      gradedAt: new Date(),
      hodApprovalRequired: selectedAssignment.maxMarks >= 50, // Major assignments need HOD approval
      gradingWorkflow: {
        stage: selectedAssignment.maxMarks >= 50 ? 'hod_review' : 'approved',
        lecturer: {
          graded: true,
          gradedAt: new Date(),
          gradedBy: `${user?.firstName} ${user?.lastName}`,
          marks: gradeForm.marks,
          feedback: gradeForm.feedback
        },
        hod: {
          approved: selectedAssignment.maxMarks < 50, // Auto-approve minor assignments
          approvedAt: selectedAssignment.maxMarks < 50 ? new Date() : null,
          approvedBy: selectedAssignment.maxMarks < 50 ? 'AUTO_APPROVED' : null,
          comments: null
        }
      }
    };

    try {
      await onGradeSubmission(selectedAssignment.id, gradeData);
      setShowGradingDialog(false);
      setSelectedAssignment(null);
      
      toast({
        title: "Grade Submitted",
        description: selectedAssignment.maxMarks >= 50 
          ? "Grade submitted for HOD approval" 
          : "Grade approved and available to student",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRunAICheck = async (submission: any) => {
    try {
      // Mock AI check - in real implementation, this would call an AI service
      const mockSimilarity = Math.floor(Math.random() * 30) + 5; // 5-35% similarity
      const passed = mockSimilarity <= 25; // Pass if under 25% similarity
      
      const aiCheckResult = {
        passed,
        similarity: mockSimilarity,
        checkedBy: `${user?.firstName} ${user?.lastName}`,
        checkedAt: new Date(),
        details: passed 
          ? "Content appears to be original with acceptable similarity levels."
          : "High similarity detected. Manual review recommended for potential plagiarism."
      };

      // Update the submission with AI check results
      const updatedSubmission = {
        ...submission,
        gradingWorkflow: {
          ...submission.gradingWorkflow,
          lecturer: {
            ...submission.gradingWorkflow?.lecturer,
            aiCheckPerformed: true,
            aiCheckResult
          }
        }
      };

      setSelectedAssignment(updatedSubmission);

      toast({
        title: "AI Check Completed",
        description: `Similarity: ${mockSimilarity}% - ${passed ? 'PASSED' : 'FAILED'}`,
        variant: passed ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "AI Check Failed",
        description: "Unable to perform AI check. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateMakeup = async () => {
    if (!makeupForm.title || !makeupForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const makeupData = {
      ...makeupForm,
      id: `makeup-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      createdBy: user?.id,
      createdAt: new Date(),
      unitId,
      unitCode,
      unitName,
      assignDate: new Date(),
      requiresAICheck: makeupForm.type === 'assignment',
      hodApprovalRequired: true // Makeup assignments always need HOD approval
    };

    try {
      await onCreateMakeupAssignment?.(makeupData);
      setShowMakeupDialog(false);
      setMakeupForm({
        title: '',
        description: '',
        type: 'assignment',
        dueDate: new Date(),
        maxMarks: 100,
        instructions: '',
        eligibleStudents: [],
        reason: ''
      });
      
      toast({
        title: "Makeup Assignment Created",
        description: "Makeup assignment created and sent for HOD approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create makeup assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter assignments based on status
  const filteredAssignments = assignments.filter(assignment => {
    switch (filterStatus) {
      case 'pending':
        return !assignment.gradingWorkflow?.lecturer?.graded;
      case 'graded':
        return assignment.gradingWorkflow?.lecturer?.graded && !assignment.gradingWorkflow?.hod?.approved;
      case 'hod_review':
        return assignment.gradingWorkflow?.lecturer?.graded && assignment.hodApprovalRequired && !assignment.gradingWorkflow?.hod?.approved;
      default:
        return true;
    }
  });

  const pendingCount = assignments.filter(a => !a.gradingWorkflow?.lecturer?.graded).length;
  const hodReviewCount = assignments.filter(a => 
    a.gradingWorkflow?.lecturer?.graded && a.hodApprovalRequired && !a.gradingWorkflow?.hod?.approved
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Lecturer Grading Interface
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {unitCode} - {unitName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {assignments.length} Submissions
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="destructive">
                  {pendingCount} Pending
                </Badge>
              )}
              {hodReviewCount > 0 && (
                <Badge className="bg-orange-500">
                  {hodReviewCount} HOD Review
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Filter:</Label>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="pending">Pending Grading</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="hod_review">HOD Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showMakeupDialog} onOpenChange={setShowMakeupDialog}>
          <DialogTrigger asChild>
            <Button>
              <RotateCcw className="w-4 h-4 mr-2" />
              Create Makeup Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Makeup Assignment</DialogTitle>
              <DialogDescription>
                Create makeup work for students who missed classwork
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={makeupForm.title}
                  onChange={(e) => setMakeupForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Makeup Assignment Title"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={makeupForm.type} onValueChange={(value: any) => setMakeupForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="cat">CAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={makeupForm.description}
                  onChange={(e) => setMakeupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Assignment description..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={makeupForm.maxMarks}
                  onChange={(e) => setMakeupForm(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Reason for Makeup</Label>
                <Textarea
                  value={makeupForm.reason}
                  onChange={(e) => setMakeupForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for creating makeup assignment..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowMakeupDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMakeup}>
                Create Makeup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No submissions found for the selected filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <Badge className={getSubmissionStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      {assignment.gradingWorkflow?.lecturer?.graded && (
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {assignment.gradingWorkflow.lecturer.marks}/{assignment.maxMarks || 100}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Student:</strong> {assignment.studentName}</p>
                        <p><strong>Type:</strong> {assignment.submissionType}</p>
                      </div>
                      <div>
                        <p><strong>Submitted:</strong> {format(new Date(assignment.submittedAt), 'MMM d, yyyy p')}</p>
                        {assignment.wordCount && (
                          <p><strong>Word Count:</strong> {assignment.wordCount} words</p>
                        )}
                      </div>
                    </div>

                    {assignment.aiCheckResult && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">AI Check:</span> {assignment.aiCheckResult.passed ? '✅' : '❌'} 
                        ({assignment.aiCheckResult.similarity}% similarity)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open submission preview
                        console.log('Preview submission:', assignment);
                        toast({
                          title: "Opening Submission",
                          description: "Submission preview would open here",
                        });
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleGradeAssignment(assignment)}
                      disabled={assignment.gradingWorkflow?.lecturer?.graded}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {assignment.gradingWorkflow?.lecturer?.graded ? 'Edit Grade' : 'Grade'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Grading Dialog */}
      <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Assignment</DialogTitle>
            <DialogDescription>
              Grading: {selectedAssignment?.title} by {selectedAssignment?.studentName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Assignment Preview */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Type:</strong> {selectedAssignment?.submissionType}</p>
                    <p><strong>Max Marks:</strong> {selectedAssignment?.maxMarks || 100}</p>
                  </div>
                  <div>
                    <p><strong>Submitted:</strong> {selectedAssignment && format(new Date(selectedAssignment.submittedAt), 'MMM d, yyyy p')}</p>
                    {selectedAssignment?.wordCount && (
                      <p><strong>Word Count:</strong> {selectedAssignment.wordCount} words</p>
                    )}
                  </div>
                </div>
                
                {selectedAssignment?.content && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium">Content Preview:</Label>
                    <div className="mt-1 p-3 bg-white rounded border text-sm max-h-32 overflow-y-auto">
                      {selectedAssignment.content.substring(0, 300)}
                      {selectedAssignment.content.length > 300 && '...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Check Section for Essays */}
            {selectedAssignment?.submissionType === 'essay' && selectedAssignment?.content && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    AI Originality Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAssignment.gradingWorkflow?.lecturer?.aiCheckPerformed ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Check Status:</span>
                        <Badge variant={selectedAssignment.gradingWorkflow.lecturer.aiCheckResult?.passed ? "default" : "destructive"}>
                          {selectedAssignment.gradingWorkflow.lecturer.aiCheckResult?.passed ? '✅ PASSED' : '❌ FAILED'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Similarity:</span>
                        <span className="text-sm">{selectedAssignment.gradingWorkflow.lecturer.aiCheckResult?.similarity}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Checked by:</span>
                        <span className="text-sm">{selectedAssignment.gradingWorkflow.lecturer.aiCheckResult?.checkedBy}</span>
                      </div>
                      {selectedAssignment.gradingWorkflow.lecturer.aiCheckResult?.details && (
                        <div className="mt-2 p-2 bg-white rounded border text-xs">
                          <strong>Details:</strong> {selectedAssignment.gradingWorkflow.lecturer.aiCheckResult.details}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-700">Run an AI check to detect potential plagiarism before grading.</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleRunAICheck(selectedAssignment)}
                        className="w-full"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Run AI Check
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Grading Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks (out of {selectedAssignment?.maxMarks || 100})</Label>
                  <Input
                    type="number"
                    value={gradeForm.marks}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max={selectedAssignment?.maxMarks || 100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade Percentage</Label>
                  <div className="p-2 bg-gray-100 rounded text-center font-medium">
                    {selectedAssignment ? ((gradeForm.marks / selectedAssignment.maxMarks) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide detailed feedback to the student..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Grading Notes (Internal)</Label>
                <Textarea
                  value={gradeForm.gradingNotes}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, gradingNotes: e.target.value }))}
                  placeholder="Internal notes for HOD review..."
                  rows={2}
                />
              </div>

              {selectedAssignment?.maxMarks >= 50 && (
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <Shield className="w-4 h-4 inline mr-1" />
                    This assignment requires HOD approval before grades are visible to students.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Submit Grade
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Grade Submission</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to submit a grade of <strong>{gradeForm.marks}/{selectedAssignment?.maxMarks || 100}</strong> for this assignment.
                    {selectedAssignment?.maxMarks >= 50 && (
                      <span className="block mt-2 text-orange-600">
                        This grade will be sent to the HOD for approval before being visible to the student.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSaveGrade}>
                    Submit Grade
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LecturerGrading;
