
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, PenTool, Award, AlertCircle, CheckCircle, GraduationCap, Lock } from "lucide-react";

interface SyncedExam {
  id: string;
  type: string;
  title: string;
  description: string;
  unitCode: string;
  unitName: string;
  examDate: string;
  examTime?: string;
  duration?: number;
  venue?: string;
  maxMarks?: number;
  instructions?: string;
  isFromSemesterPlan?: boolean;
  status?: string;
}

interface ExamsQuizzesProps {
  syncedExams?: SyncedExam[];
}

export const ExamsQuizzes = ({ syncedExams = [] }: ExamsQuizzesProps) => {
  const { user, pendingUnitRegistrations, createdContent } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'graded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exam' | 'quiz' | 'cat' | 'assignment'>('all');

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Get unit IDs that the student is registered for
  const registeredUnitIds = approvedRegistrations.map(reg => reg.unitId);

  // Get exams and CATs for registered units with enrollment type filtering
  const availableExams = createdContent.filter(content => {
    // Basic filters: registered units and visibility
    const isRegistered = registeredUnitIds.includes(content.unitId);
    const isVisible = content.isVisible;
    
    if (!isRegistered || !isVisible) return false;
    
    // Enrollment type filtering: Online students can see exams, others only see CATs and assignments
    if (user?.enrollmentType === 'online') {
      // Online students can see all types: exams, CATs, and assignments
      return content.type === 'exam' || content.type === 'cat' || content.type === 'assignment';
    } else {
      // Full-time and part-time students only see CATs and assignments, not exams
      return content.type === 'cat' || content.type === 'assignment';
    }
  });

  // Combine original exams with synced exams from semester plans
  const allExams = [
    ...availableExams,
    ...syncedExams.map(exam => ({
      ...exam,
      scheduledDate: exam.examDate,
      lecturerName: 'Semester Plan',
      isVisible: true,
      unitId: exam.unitCode // Map unitCode to unitId for compatibility
    }))
  ];

  console.log('Student ExamsQuizzes Debug:', {
    userId: user?.id,
    registeredUnitIds,
    originalExamsCount: availableExams.length,
    syncedExamsCount: syncedExams.length,
    totalExamsCount: allExams.length,
    syncedExams: syncedExams.slice(0, 3) // First 3 synced items for debugging
  });

  const isExamAccessible = (exam: any) => {
    const now = new Date();
    const examDate = new Date(exam.scheduledDate);
    return now >= examDate && exam.status === 'approved';
  };

  const getStatusBadge = (exam: any) => {
    if (exam.status === 'pending_approval') {
      return <Badge variant="outline" className="text-yellow-600">Pending Approval</Badge>;
    }
    if (!isExamAccessible(exam)) {
      return <Badge variant="outline" className="text-gray-600">Not Yet Available</Badge>;
    }
    return <Badge variant="outline" className="text-green-600">Available</Badge>;
  };

  const filteredExams = allExams.filter(exam => {
    if (typeFilter !== 'all' && exam.type !== typeFilter) return false;
    
    switch (filter) {
      case 'upcoming':
        return !isExamAccessible(exam) && exam.status !== 'pending_approval';
      case 'active':
        return isExamAccessible(exam);
      case 'completed':
        return exam.status === 'completed';
      case 'graded':
        return exam.status === 'graded';
      default:
        return true;
    }
  });

  if (approvedRegistrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <PenTool className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams or Quizzes Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have approved unit registrations to access exams and quizzes.
          </p>
          <div className="text-sm text-gray-500">
            <p>Register for units and wait for approval to see assessments here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'upcoming', 'active', 'completed', 'graded'].map((status) => (
              <Button 
                key={status}
                variant={filter === status ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'exam', 'cat'].map((type) => (
              <Button 
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter(type as any)}
              >
                {type === 'cat' ? 'CAT' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Exams List */}
      {filteredExams.length > 0 ? (
        <div className="grid gap-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {exam.type === 'exam' ? <GraduationCap className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                      {exam.title}
                    </CardTitle>
                    <CardDescription>{exam.unitCode} - {exam.unitName}</CardDescription>
                  </div>
                  {getStatusBadge(exam)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-gray-600">{exam.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p className="text-sm text-gray-600">{exam.questions?.length || 0}</p>
                  </div>
                </div>
                
                {exam.venue && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-gray-600">{exam.venue}</p>
                  </div>
                )}

                {exam.description && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Instructions</p>
                    <p className="text-sm text-gray-600">{exam.description}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Total Marks: {exam.totalMarks || exam.questions?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0}
                  </div>
                  
                  {isExamAccessible(exam) ? (
                    <Button>
                      Start {exam.type === 'exam' ? 'Exam' : 'CAT'}
                    </Button>
                  ) : (
                    <Button disabled variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      {exam.status === 'pending_approval' ? 'Pending Approval' : 'Not Available Yet'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your lecturers haven't created any exams or CATs yet for your registered units.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Registered Units:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {approvedRegistrations.map((reg) => (
                <Badge key={reg.id} variant="outline">
                  {reg.unitCode} - {reg.unitName}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
