
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, FileText, PenTool, Calendar, Users, GraduationCap, Download, Clock, MessageSquare, ArrowLeft, ExternalLink, MessageCircle, BookOpen, Lock, Unlock, Monitor, Camera, Keyboard } from "lucide-react";
import { Unit } from './types';
import { useAuth } from "@/contexts/AuthContext";
import { useCourseContent } from "@/contexts/CourseContentContext";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import LocalFileDisplay from "@/components/ui/LocalFileDisplay";
import { AssignmentSubmission } from "@/components/student/AssignmentSubmission";
import { AssignmentWorkplace } from "@/components/student/AssignmentWorkplace";
import { CATWorkspace } from "@/components/student/CATWorkspace";
import { useAssignmentWorkflow } from "@/hooks/useAssignmentWorkflow";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, startOfWeek, endOfWeek } from "date-fns";

// Helper function to determine current week
const getCurrentWeek = (semesterStart: Date | undefined, weekPlans: any[]) => {
  if (!semesterStart || weekPlans.length === 0) return null;
  
  const now = new Date();
  return weekPlans.find(week => {
    const weekStart = startOfWeek(week.startDate);
    const weekEnd = endOfWeek(week.endDate);
    return isAfter(now, weekStart) && isBefore(now, weekEnd);
  });
};

interface UnitDetailsProps {
  unit: Unit;
  onBack: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const UnitDetails = ({ unit, onBack }: UnitDetailsProps) => {
  const { user } = useAuth();
  const { getContentForUnit } = useCourseContent();
  const { getStudentSemesterPlan, getSemesterProgress, isLoading } = useSemesterPlan();
  const { 
    getDraft, 
    saveDraft, 
    submitToGradeVault, 
    getSubmissionStatus, 
    syncWithGradeVault 
  } = useAssignmentWorkflow();
  const { toast } = useToast();

  // Semester plan state
  const [semesterPlan, setSemesterPlan] = useState<any>({
    semesterStart: undefined,
    semesterWeeks: 15,
    weekPlans: []
  });
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [showWeekDetails, setShowWeekDetails] = useState(false);
  
  // Assignment state - Enhanced with workplace functionality
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showAssignmentSubmission, setShowAssignmentSubmission] = useState(false);
  const [showAssignmentWorkplace, setShowAssignmentWorkplace] = useState(false);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  // CAT/Exam state
  const [selectedCATExam, setSelectedCATExam] = useState<any>(null);
  const [showCATWorkspace, setShowCATWorkspace] = useState(false);
  const [catSubmissions, setCatSubmissions] = useState<any[]>([]);

  // Helper function to check if content is accessible based on date
  const isContentAccessible = (contentDate: Date, type: 'material' | 'assignment' | 'exam') => {
    const now = new Date();
    
    switch (type) {
      case 'material':
        // Materials are accessible from their release date
        return now >= contentDate;
      case 'assignment':
        // Assignments are accessible from their assign date
        return now >= contentDate;
      case 'exam':
        // Exams are accessible 24 hours before exam date
        const examAccessDate = new Date(contentDate);
        examAccessDate.setHours(examAccessDate.getHours() - 24);
        return now >= examAccessDate;
      default:
        return false;
    }
  };

  // CAT-specific accessibility check
  const isCATAccessible = (exam: any) => {
    const now = new Date();
    const examDateTime = new Date(`${exam.examDate} ${exam.examTime}`);
    
    // CAT is accessible 1 hour before and during the exam duration
    const accessStartTime = new Date(examDateTime.getTime() - (60 * 60 * 1000)); // 1 hour before
    const accessEndTime = new Date(examDateTime.getTime() + (exam.duration * 60 * 1000)); // exam duration
    
    return now >= accessStartTime && now <= accessEndTime;
  };

  // Handle CAT submission
  const handleCATSubmit = async (examId: string, answers: Record<string, string>) => {
    try {
      // Here you would normally submit to your backend
      console.log('CAT Submission:', { examId, answers, unitId: unit.id, studentId: user?.id });
      
      // Add to local submissions for now
      const submission = {
        id: `cat-${Date.now()}`,
        examId,
        answers,
        submittedAt: new Date(),
        status: 'submitted'
      };
      
      setCatSubmissions(prev => [...prev, submission]);
      
      toast({
        title: "CAT Submitted Successfully",
        description: "Your answers have been submitted and recorded.",
        variant: "default"
      });
      
      setShowCATWorkspace(false);
      setSelectedCATExam(null);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your CAT. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if CAT has been submitted
  const isCATSubmitted = (examId: string) => {
    return catSubmissions.some(submission => submission.examId === examId);
  };

  // Helper function to check if a week is accessible
  const isWeekAccessible = (week: any) => {
    const now = new Date();
    return now >= week.startDate;
  };

  // Load semester plan on component mount
  useEffect(() => {
    const loadSemesterPlan = async () => {
      try {
        const plan = await getStudentSemesterPlan(unit.id, user?.id || '');
        setSemesterPlan(plan);
        const current = getCurrentWeek(plan.semesterStart, plan.weekPlans);
        setCurrentWeek(current);
      } catch (error) {
        console.error('Failed to load semester plan:', error);
      }
    };

    loadSemesterPlan();
  }, [unit.id, user?.id, getStudentSemesterPlan]);

  // Sync assignment submissions on component mount
  useEffect(() => {
    if (user) {
      syncWithGradeVault().catch(error => {
        console.error('Failed to sync assignment submissions:', error);
      });
    }
  }, [user, syncWithGradeVault]);

  // Get all content for this unit from the shared content context
  const unitContent = getContentForUnit(unit.id);
  
  console.log('UnitDetails Debug:', {
    unitId: unit.id,
    unitCode: unit.code,
    unitName: unit.name,
    totalContent: unitContent.length,
    contentTypes: unitContent.map(c => c.type)
  });

  // Get assignments for this unit
  const unitAssignments = unitContent.filter(
    content => content.type === 'assignment'
  );

  // Get notes and materials for this unit
  const unitNotes = unitContent.filter(
    content => content.type === 'notes' || content.type === 'material'
  );

  // Get exams and CATs for this unit
  const unitExams = unitContent.filter(
    content => content.type === 'exam' || content.type === 'cat'
  );

  const handleJoinWhatsApp = () => {
    if (unit.whatsappLink) {
      window.open(unit.whatsappLink, '_blank');
      toast({
        title: "Opening WhatsApp",
        description: `Joining ${unit.name} WhatsApp group`
      });
    }
  };

  // Assignment submission handlers
  const handleOpenAssignmentSubmission = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowAssignmentSubmission(true);
  };

  const handleSubmissionComplete = (submission: any) => {
    // Add the new submission to the local state
    setStudentSubmissions(prev => {
      const filtered = prev.filter(s => s.assignmentId !== submission.assignmentId);
      return [...filtered, submission];
    });
    
    setShowAssignmentSubmission(false);
    setSelectedAssignment(null);
    
    toast({
      title: "Assignment Submitted",
      description: "Your assignment has been submitted successfully!",
    });
  };

  // Get existing submission for an assignment
  const getExistingSubmission = (assignmentId: string) => {
    return studentSubmissions.find(s => s.assignmentId === assignmentId);
  };

  const handleJoinDiscussion = () => {
    if (unit.hasDiscussionGroup) {
      toast({
        title: "Discussion Group",
        description: `Opening discussion for ${unit.name}`
      });
      // In a real app, this would navigate to the discussion interface
    }
  };

  const handleWeekClick = (week: any) => {
    if (!isWeekAccessible(week)) {
      toast({
        variant: "destructive",
        title: "Week Not Available",
        description: `Week ${week.weekNumber} will be available on ${format(week.startDate, 'MMM d, yyyy')}`
      });
      return;
    }

    setSelectedWeek(week);
    setShowWeekDetails(true);
  };

  const closeWeekDetails = () => {
    setShowWeekDetails(false);
    setSelectedWeek(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{unit.code} - {unit.name}</h1>
          <p className="text-muted-foreground">
            {unit.lecturer} • {unit.semester} • {unit.credits} Credits
          </p>
        </div>
      </div>
      
      {/* Unit Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Unit Overview
              </CardTitle>
              <CardDescription>Your progress and unit information</CardDescription>
            </div>
            <Badge className={getStatusColor(unit.status)}>
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Semester Progress</span>
              <span className="text-sm text-muted-foreground">{getSemesterProgress(unit.id)}%</span>
            </div>
            <Progress value={getSemesterProgress(unit.id)} className="w-full" />
            <div className="text-xs text-gray-500 text-center">
              Based on current week in semester plan
            </div>
          </div>

          {/* Current Week Section */}
          {currentWeek && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Current Week</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Week {currentWeek.weekNumber}
                </Badge>
              </div>
              <div className="text-sm text-blue-700">
                {format(currentWeek.startDate, 'MMM d')} - {format(currentWeek.endDate, 'MMM d, yyyy')}
              </div>
              {currentWeek.weekMessage && (
                <div className="text-sm font-medium text-blue-800">
                  📝 {currentWeek.weekMessage}
                </div>
              )}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Lecturer</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{unit.lecturer}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Next Class</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{unit.nextClass}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Enrollment</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{unit.enrolled || 0}/{unit.capacity || 50} students</span>
              </div>
            </div>
          </div>

          {/* Communication Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Communication & Groups</h4>
            <div className="flex flex-wrap gap-2">
              {unit.whatsappLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleJoinWhatsApp}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Group
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
              {unit.hasDiscussionGroup && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleJoinDiscussion}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Discussion Group
                </Button>
              )}
              {!unit.whatsappLink && !unit.hasDiscussionGroup && (
                <p className="text-sm text-muted-foreground">No communication groups available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semester Plan Section - Primary Content Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semester Plan
          </CardTitle>
          <CardDescription>
            {semesterPlan.weekPlans.length > 0 
              ? "Click on a week to view detailed content (available weeks only)"
              : "No semester plan created yet. Additional materials may be available below."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {semesterPlan.weekPlans.length > 0 ? (
            <div className="space-y-4">
              {semesterPlan.weekPlans.map((week) => {
                const weekAccessible = isWeekAccessible(week);
                const isCurrentWeek = currentWeek?.weekNumber === week.weekNumber;
                
                return (
                  <Card 
                    key={week.weekNumber} 
                    className={`p-4 transition-all duration-200 ${
                      isCurrentWeek ? 'border-blue-500 bg-blue-50' : ''
                    } ${
                      weekAccessible 
                        ? 'cursor-pointer hover:shadow-md hover:border-gray-300' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => handleWeekClick(week)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCurrentWeek ? "default" : "outline"}>
                          Week {week.weekNumber}
                        </Badge>
                        {isCurrentWeek && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Current Week
                          </Badge>
                        )}
                        {weekAccessible ? (
                          <Unlock className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                      </span>
                    </div>
                    
                    {week.weekMessage && (
                      <div className="mb-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Week Message:</span>
                        </div>
                        <p className="text-blue-700 mt-1">{week.weekMessage}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span>{week.materials?.length || 0} Materials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-orange-600" />
                        <span>{week.assignments?.length || 0} Assignments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-red-600" />
                        <span>{week.exams?.length || 0} Exams</span>
                      </div>
                    </div>

                    {!weekAccessible && (
                      <div className="mt-3 text-sm text-gray-500 italic">
                        This week will be available on {format(week.startDate, 'MMM d, yyyy')}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Calendar className="w-16 h-16 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Semester Plan Available Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your lecturer hasn't created a semester plan for this unit yet. 
                    The weekly schedule, materials, and assignments will appear here once available.
                  </p>
                </div>
                {unit.whatsappLink && (
                  <div className="pt-4">
                    <Button 
                      variant="outline"
                      onClick={handleJoinWhatsApp}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join WhatsApp Group for Updates
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Course Materials Section */}
      {unitNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Course Materials ({unitNotes.length})
            </CardTitle>
            <CardDescription>
              Extra notes, handouts, and reference materials outside the semester plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unitNotes.map((note) => (
                <Card key={note.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-gray-600">{note.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {note.type}
                    </Badge>
                  </div>
                  
                  {note.instructions && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                      <strong>Instructions:</strong> {note.instructions}
                    </div>
                  )}
                  
                  {note.fileUrl && note.fileName && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{note.fileName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {note.fileUrl.includes('s3.') ? 'Cloud Storage' : 'Local'}
                        </Badge>
                      </div>
                      <LocalFileDisplay
                        fileUrl={note.fileUrl}
                        fileName={note.fileName}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span>Uploaded by: {note.lecturerName || 'Unknown'}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Assignments Section */}
      {unitAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Additional Assignments ({unitAssignments.length})
            </CardTitle>
            <CardDescription>
              Extra tasks and projects outside the semester plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unitAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                    </div>
                    <Badge variant="outline">
                      Assignment
                    </Badge>
                  </div>
                  
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                  
                  {assignment.fileUrl && assignment.fileName && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">{assignment.fileName}</span>
                      </div>
                      <LocalFileDisplay
                        fileUrl={assignment.fileUrl}
                        fileName={assignment.fileName}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    {/* Enhanced Assignment Actions */}
                    {(() => {
                      const existingSubmission = getSubmissionStatus(assignment.id);
                      const isSubmitted = !!existingSubmission;
                      
                      return isSubmitted ? (
                        <Button className="min-w-[140px]" disabled variant="secondary">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Already Submitted
                        </Button>
                      ) : (
                        <AssignmentWorkplace
                          assignment={{
                            ...assignment,
                            unitId: unit.id,
                            unitCode: unit.code,
                            unitName: unit.name,
                            assignDate: assignment.createdAt ? new Date(assignment.createdAt) : new Date(),
                            dueDate: assignment.dueDate ? new Date(assignment.dueDate) : new Date(),
                            requiresAICheck: true,
                            type: 'document' as const,
                            maxMarks: 100,
                            instructions: assignment.description || ''
                          }}
                          existingSubmission={existingSubmission}
                          savedDraft={getDraft(assignment.id)}
                          onSubmissionComplete={async (submission) => {
                            try {
                              await submitToGradeVault(submission);
                              setStudentSubmissions(prev => {
                                const filtered = prev.filter(s => s.assignmentId !== submission.assignmentId);
                                return [...filtered, submission];
                              });
                              
                              toast({
                                title: "Assignment Submitted to Grade-Vault",
                                description: "Your assignment has been sent for grading and HOD approval.",
                              });
                            } catch (error) {
                              console.error('Submission failed:', error);
                            }
                          }}
                          onSaveDraft={saveDraft}
                          trigger={
                            <Button className="min-w-[140px]">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Open Workplace
                            </Button>
                          }
                        />
                      );
                    })()}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Exams Section */}
      {unitExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Additional Exams & CATs ({unitExams.length})
            </CardTitle>
            <CardDescription>
              Extra tests and examinations outside the semester plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unitExams.map((exam) => (
                <Card key={exam.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{exam.title}</h4>
                      <p className="text-sm text-gray-600">{exam.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {exam.type}
                    </Badge>
                  </div>
                  
                  {exam.instructions && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                      <strong>Instructions:</strong> {exam.instructions}
                    </div>
                  )}
                  
                  {exam.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Due: {formatDate(exam.dueDate)}</span>
                    </div>
                  )}
                  
                  {exam.maxMarks && (
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Total Marks:</strong> {exam.maxMarks}
                    </div>
                  )}
                  
                  {exam.fileUrl && exam.fileName && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">{exam.fileName}</span>
                      </div>
                      <LocalFileDisplay
                        fileUrl={exam.fileUrl}
                        fileName={exam.fileName}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created by: {exam.lecturerName || 'Unknown'}</span>
                    <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Details Dialog */}
      <Dialog open={showWeekDetails} onOpenChange={setShowWeekDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Week {selectedWeek?.weekNumber} - {unit.code}
            </DialogTitle>
            <DialogDescription>
              {selectedWeek && (
                <span>
                  {format(selectedWeek.startDate, 'MMM d')} - {format(selectedWeek.endDate, 'MMM d, yyyy')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedWeek && (
            <div className="space-y-6">
              {/* Week Message */}
              {selectedWeek.weekMessage && (
                <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Week Message</span>
                  </div>
                  <p className="text-blue-700">{selectedWeek.weekMessage}</p>
                </div>
              )}

              {/* Materials Section */}
              {selectedWeek.materials && selectedWeek.materials.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Materials ({selectedWeek.materials.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedWeek.materials.map((material) => {
                      const accessible = isContentAccessible(new Date(material.releaseTime || selectedWeek.startDate), 'material');
                      
                      return (
                        <Card key={material.id} className={`p-4 ${!accessible ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-green-800">{material.title}</h5>
                                {accessible ? (
                                  <Unlock className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-green-700 mb-2">{material.description}</p>
                              {!accessible && (
                                <p className="text-xs text-gray-500 italic">
                                  Available on {format(new Date(material.releaseTime || selectedWeek.startDate), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                            {accessible && material.fileUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assignments Section */}
              {selectedWeek.assignments && selectedWeek.assignments.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Assignments ({selectedWeek.assignments.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedWeek.assignments.map((assignment) => {
                      const accessible = isContentAccessible(assignment.assignDate, 'assignment');
                      
                      return (
                        <Card key={assignment.id} className={`p-4 ${!accessible ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-orange-800">{assignment.title}</h5>
                                {accessible ? (
                                  <Unlock className="w-4 h-4 text-orange-600" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-orange-700 mb-2">{assignment.description}</p>
                              
                              {/* Show assignment documents if available */}
                              {assignment.documents && assignment.documents.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="text-xs font-medium text-orange-800 mb-2">Assignment Documents:</h6>
                                  <div className="space-y-1">
                                    {assignment.documents.map((doc, docIndex) => (
                                      <div key={docIndex} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3" />
                                          <span className="text-xs">{doc.fileName}</span>
                                          <span className="text-xs text-gray-500">
                                            ({(doc.fileSize / (1024 * 1024)).toFixed(1)} MB)
                                          </span>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => {
                                            if (doc.fileUrl) {
                                              // Create a temporary download link
                                              const link = document.createElement('a');
                                              link.href = doc.fileUrl;
                                              link.download = doc.fileName;
                                              link.target = '_blank';
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            } else {
                                              console.error('No file URL available for document:', doc);
                                            }
                                          }}
                                          className="h-6 px-2 text-xs"
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-xs text-orange-600">
                                <p>Assigned: {format(assignment.assignDate, 'MMM d, yyyy')}</p>
                                <p>Due: {format(assignment.dueDate, 'MMM d, yyyy')}</p>
                              </div>
                              {!accessible && (
                                <p className="text-xs text-gray-500 italic mt-2">
                                  Available on {format(assignment.assignDate, 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                            {accessible && (
                              <div className="flex gap-2">
                                {assignment.fileUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </a>
                                  </Button>
                                )}
                                
                                {/* Enhanced Assignment Workplace */}
                                {(() => {
                                  const existingSubmission = getSubmissionStatus(assignment.id);
                                  const isSubmitted = !!existingSubmission;
                                  
                                  return isSubmitted ? (
                                    <Button size="sm" disabled variant="secondary">
                                      <BookOpen className="w-4 h-4 mr-1" />
                                      Already Submitted
                                    </Button>
                                  ) : (
                                    <AssignmentWorkplace
                                      assignment={{
                                        ...assignment,
                                        unitId: unit.id,
                                        unitCode: unit.code,
                                        unitName: unit.name,
                                        assignDate: assignment.assignDate ? new Date(assignment.assignDate) : new Date(),
                                        dueDate: assignment.dueDate ? new Date(assignment.dueDate) : new Date(),
                                        requiresAICheck: true,
                                        type: 'document' as const,
                                        maxMarks: 100,
                                        instructions: assignment.description || ''
                                      }}
                                      existingSubmission={existingSubmission}
                                      savedDraft={getDraft(assignment.id)}
                                      onSubmissionComplete={async (submission) => {
                                        try {
                                          await submitToGradeVault(submission);
                                          setStudentSubmissions(prev => {
                                            const filtered = prev.filter(s => s.assignmentId !== submission.assignmentId);
                                            return [...filtered, submission];
                                          });
                                          
                                          toast({
                                            title: "Assignment Submitted to Grade-Vault",
                                            description: "Your assignment has been sent for grading and HOD approval.",
                                          });
                                        } catch (error) {
                                          console.error('Submission failed:', error);
                                        }
                                      }}
                                      onSaveDraft={saveDraft}
                                      trigger={
                                        <Button size="sm">
                                          <BookOpen className="w-4 h-4 mr-1" />
                                          Workplace
                                        </Button>
                                      }
                                    />
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exams Section */}
              {selectedWeek.exams && selectedWeek.exams.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Exams ({selectedWeek.exams.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedWeek.exams.map((exam) => {
                      const accessible = isContentAccessible(exam.examDate, 'exam');
                      const isCATType = exam.type === 'cat';
                      const catAccessible = isCATType ? isCATAccessible(exam) : false;
                      const submitted = isCATType ? isCATSubmitted(exam.id) : false;
                      
                      return (
                        <Card key={exam.id} className={`p-4 ${!accessible ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-red-800">{exam.title}</h5>
                                <Badge variant={isCATType ? "secondary" : "outline"} className="uppercase">
                                  {exam.type}
                                </Badge>
                                {isCATType && (
                                  <div className="flex items-center gap-1">
                                    <Monitor className="w-3 h-3 text-blue-500" />
                                    <Camera className="w-3 h-3 text-green-500" />
                                    <Keyboard className="w-3 h-3 text-orange-500" />
                                  </div>
                                )}
                                {accessible ? (
                                  <Unlock className="w-4 h-4 text-red-600" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-red-700 mb-2">{exam.description}</p>
                              <div className="text-xs text-red-600">
                                <p>Date: {format(exam.examDate, 'MMM d, yyyy')} at {exam.examTime}</p>
                                <p>Duration: {exam.duration} minutes</p>
                                <p>Max Marks: {exam.maxMarks}</p>
                                {isCATType && (
                                  <p>Questions: {exam.questions?.length || 0}</p>
                                )}
                              </div>
                              {isCATType && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-xs text-blue-700 font-medium mb-1">CAT Requirements:</p>
                                  <div className="flex items-center gap-4 text-xs text-blue-600">
                                    <span className="flex items-center gap-1">
                                      <Monitor className="w-3 h-3" />
                                      Screen Share
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Camera className="w-3 h-3" />
                                      Webcam
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Keyboard className="w-3 h-3" />
                                      Keyboard Monitor
                                    </span>
                                  </div>
                                </div>
                              )}
                              {!accessible && (
                                <p className="text-xs text-gray-500 italic mt-2">
                                  Available 24 hours before exam date
                                </p>
                              )}
                              {isCATType && accessible && !catAccessible && (
                                <p className="text-xs text-orange-500 italic mt-2">
                                  CAT will be available 1 hour before exam time
                                </p>
                              )}
                              {submitted && (
                                <Badge variant="default" className="mt-2 bg-green-600">
                                  Submitted
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {accessible && !isCATType && (
                                <Button size="sm">
                                  View Exam Details
                                </Button>
                              )}
                              {isCATType && catAccessible && !submitted && (
                                <Button 
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedCATExam(exam);
                                    setShowCATWorkspace(true);
                                  }}
                                >
                                  Start CAT
                                </Button>
                              )}
                              {isCATType && submitted && (
                                <Button size="sm" variant="outline" disabled>
                                  Completed
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state for week with no content */}
              {(!selectedWeek.materials || selectedWeek.materials.length === 0) &&
               (!selectedWeek.assignments || selectedWeek.assignments.length === 0) &&
               (!selectedWeek.exams || selectedWeek.exams.length === 0) && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                  <p className="text-gray-600">
                    No materials, assignments, or exams have been added to this week yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Submission Dialog */}
      {selectedAssignment && (
        <Dialog open={showAssignmentSubmission} onOpenChange={setShowAssignmentSubmission}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Complete and submit your assignment for {unit.name}
              </DialogDescription>
            </DialogHeader>
            <AssignmentSubmission
              assignment={selectedAssignment}
              existingSubmission={getExistingSubmission(selectedAssignment.id)}
              onSubmissionComplete={handleSubmissionComplete}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* CAT Workspace */}
      {showCATWorkspace && selectedCATExam && (
        <div className="fixed inset-0 z-50 bg-white">
          <CATWorkspace
            exam={selectedCATExam}
            unitId={unit.id}
            onSubmit={(answers) => handleCATSubmit(selectedCATExam.id, answers)}
            onExit={() => {
              setShowCATWorkspace(false);
              setSelectedCATExam(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
