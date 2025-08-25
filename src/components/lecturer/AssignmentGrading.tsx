import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Eye,
  Edit3,
  Save,
  Shield,
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { format, isAfter } from 'date-fns';

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
  studentEmail: string;
  submissionType: 'document' | 'essay';
  content?: string;
  fileUrl?: string;
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

interface AssignmentGradingProps {
  assignment: Assignment;
  submissions: StudentSubmission[];
  onGradeSubmitted: (submissionId: string, marks: number, feedback: string) => void;
}

export const AssignmentGrading: React.FC<AssignmentGradingProps> = ({
  assignment,
  submissions,
  onGradeSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded' | 'late'>('all');

  const isLate = isAfter(new Date(), assignment.dueDate);
  
  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true;
    return submission.status === filterStatus;
  });

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted' || s.status === 'late').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.status === 'late').length,
    aiPassed: submissions.filter(s => s.aiCheckResult?.passed).length,
    aiFailed: submissions.filter(s => s.aiCheckResult && !s.aiCheckResult.passed).length
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    if (marks < 0 || marks > assignment.maxMarks) {
      toast({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${assignment.maxMarks}`,
        variant: "destructive"
      });
      return;
    }

    setIsGrading(true);

    try {
      onGradeSubmitted(selectedSubmission.id, marks, feedback);
      
      toast({
        title: "Grade Submitted",
        description: `${selectedSubmission.studentName}'s assignment has been graded successfully`
      });

      setSelectedSubmission(null);
      setMarks(0);
      setFeedback('');
    } catch (error) {
      toast({
        title: "Grading Failed",
        description: "Failed to submit grade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGrading(false);
    }
  };

  const openSubmissionForGrading = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks || 0);
    setFeedback(submission.feedback || '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const downloadSubmission = async (submission: StudentSubmission) => {
    if (submission.fileUrl) {
      try {
        // In a real app, this would download from S3 through the API
        const response = await fetch(`/api/download?url=${encodeURIComponent(submission.fileUrl)}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'assignment.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download the submission file",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Grade Assignment: {assignment.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {assignment.unitCode} - Due: {format(assignment.dueDate, 'PPP p')}
          </p>
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
          <Badge variant={isLate ? "destructive" : "secondary"}>
            <Calendar className="w-3 h-3 mr-1" />
            {isLate ? 'Past Due' : 'Active'}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
            <div className="text-sm text-gray-600">Graded</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{stats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </CardContent>
        </Card>
        
        {assignment.requiresAICheck && (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.aiPassed}</div>
                <div className="text-sm text-gray-600">AI Passed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{stats.aiFailed}</div>
                <div className="text-sm text-gray-600">AI Flagged</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Label>Filter by status:</Label>
        <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({stats.submitted})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({stats.graded})</TabsTrigger>
            <TabsTrigger value="late">Late ({stats.late})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Submissions Found</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'No students have submitted this assignment yet.' 
                  : `No submissions with status "${filterStatus}".`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{submission.studentName}</h3>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      {submission.aiCheckResult && (
                        <Badge variant={submission.aiCheckResult.passed ? "secondary" : "destructive"}>
                          AI: {submission.aiCheckResult.passed ? 'PASSED' : 'FLAGGED'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {submission.studentEmail}</p>
                      <p>Submitted: {format(submission.submittedAt, 'PPP p')}</p>
                      {submission.fileName && (
                        <p>File: {submission.fileName}</p>
                      )}
                      {submission.marks !== undefined && (
                        <p className={`font-medium ${getGradeColor(submission.marks, assignment.maxMarks)}`}>
                          Grade: {submission.marks}/{assignment.maxMarks} ({((submission.marks / assignment.maxMarks) * 100).toFixed(1)}%)
                        </p>
                      )}
                    </div>

                    {submission.aiCheckResult && (
                      <div className={`mt-2 p-2 rounded text-sm ${submission.aiCheckResult.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        AI Check: {submission.aiCheckResult.similarity}% similarity - {submission.aiCheckResult.passed ? 'Original content' : 'High similarity detected'}
                      </div>
                    )}

                    {submission.feedback && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Feedback: </span>
                        {submission.feedback}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {submission.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSubmission(submission)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubmissionForGrading(submission)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {submission.status === 'graded' ? 'View/Edit' : 'Grade'}
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}: {submission.studentName}
                          </DialogTitle>
                          <DialogDescription>
                            Assignment: {assignment.title} - Max Marks: {assignment.maxMarks}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedSubmission?.id === submission.id && (
                          <div className="space-y-6">
                            {/* Submission Content */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Submission Content:</h4>
                              
                              {submission.submissionType === 'essay' && submission.content ? (
                                <div className="p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-sm">{submission.content}</pre>
                                </div>
                              ) : submission.fileName ? (
                                <div className="p-4 border rounded-lg bg-gray-50">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium">{submission.fileName}</span>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => downloadSubmission(submission)}
                                      className="ml-auto"
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">No content available</p>
                              )}

                              {/* AI Check Results */}
                              {submission.aiCheckResult && (
                                <div className={`p-3 rounded-lg border ${submission.aiCheckResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                  <h5 className="font-medium mb-2">AI Detection Results:</h5>
                                  <div className="text-sm space-y-1">
                                    <p>Status: <span className={`font-medium ${submission.aiCheckResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                                      {submission.aiCheckResult.passed ? 'PASSED' : 'FLAGGED'}
                                    </span></p>
                                    <p>Similarity Score: {submission.aiCheckResult.similarity}%</p>
                                    <p className="text-gray-600">
                                      {submission.aiCheckResult.passed 
                                        ? 'Content appears to be original.' 
                                        : 'High similarity with existing sources detected.'
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Grading Form */}
                            <div className="space-y-4 border-t pt-4">
                              <h4 className="font-medium">Grade Assignment:</h4>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="marks">Marks (out of {assignment.maxMarks})</Label>
                                  <Input
                                    id="marks"
                                    type="number"
                                    min="0"
                                    max={assignment.maxMarks}
                                    value={marks}
                                    onChange={(e) => setMarks(Number(e.target.value))}
                                    placeholder="Enter marks"
                                  />
                                </div>
                                <div>
                                  <Label>Percentage</Label>
                                  <Input
                                    value={marks > 0 ? `${((marks / assignment.maxMarks) * 100).toFixed(1)}%` : '0%'}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="feedback">Feedback (Optional)</Label>
                                <Textarea
                                  id="feedback"
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Provide feedback for the student..."
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleGradeSubmission}
                                  disabled={isGrading}
                                >
                                  {isGrading ? (
                                    <>
                                      <Save className="w-4 h-4 mr-2 animate-pulse" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-2" />
                                      {submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
