import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { AssignmentWorkplace } from "./AssignmentWorkplace";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  PenTool, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Target,
  Eye
} from "lucide-react";
import { format, isAfter, isBefore, differenceInDays } from "date-fns";
import { useAssignmentWorkflow } from "@/hooks/useAssignmentWorkflow";
import { useToast } from "@/hooks/use-toast";

interface SyncedAssignment {
  id: string;
  title: string;
  description: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  assignDate?: Date;
  dueDate?: Date;
  maxMarks?: number;
  instructions?: string;
  requiresAICheck?: boolean;
  isFromSemesterPlan?: boolean;
  weekNumber?: number;
  submissionType?: string;
}

export const StudentAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('available');
  const [selectedAssignment, setSelectedAssignment] = useState<SyncedAssignment | null>(null);
  
  // Get synced assignments from semester plans
  const { getContentByType } = useDashboardSync('student');
  const syncedAssignments = getContentByType('assignment') as SyncedAssignment[];

  // Grade-Vault workflow
  const { submissions, getSubmissionStatus, submitToGradeVault } = useAssignmentWorkflow();

  // Categorize assignments
  const now = new Date();
  
  const availableAssignments = syncedAssignments.filter(assignment => {
    if (!assignment.dueDate) return true;
    return isAfter(new Date(assignment.dueDate), now);
  });

  const overdueAssignments = syncedAssignments.filter(assignment => {
    if (!assignment.dueDate) return false;
    const hasSubmitted = !!getSubmissionStatus(assignment.id);
    return isBefore(new Date(assignment.dueDate), now) && !hasSubmitted;
  });

  const submittedAssignments = syncedAssignments.filter(assignment => !!getSubmissionStatus(assignment.id));

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No due date';
    return format(new Date(date), 'PPP');
  };

  const getDaysUntilDue = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null;
    return differenceInDays(new Date(dueDate), now);
  };

  const getUrgencyColor = (dueDate: Date | string | undefined) => {
    const days = getDaysUntilDue(dueDate);
    if (days === null) return 'bg-gray-100 text-gray-800';
    if (days < 0) return 'bg-red-100 text-red-800';
    if (days <= 1) return 'bg-orange-100 text-orange-800';
    if (days <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleWorkOnAssignment = (assignment: SyncedAssignment) => {
    // Prevent opening workplace for submitted or past due assignments
    const existing = getSubmissionStatus(assignment.id);
    const isSubmitted = !!existing;
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const isPastDue = daysUntilDue !== null && daysUntilDue < 0;
    
    if (isSubmitted || isPastDue) {
      toast({
        title: "Cannot access workplace",
        description: isSubmitted ? "This assignment has already been submitted." : "This assignment is past due.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedAssignment(assignment);
  };

  const convertToAssignmentFormat = (syncedAssignment: SyncedAssignment) => {
    return {
      id: syncedAssignment.id,
      title: syncedAssignment.title,
      description: syncedAssignment.description,
      type: (syncedAssignment.submissionType || 'document') as 'essay' | 'document',
      assignDate: syncedAssignment.assignDate || new Date(),
      dueDate: syncedAssignment.dueDate || new Date(),
      maxMarks: syncedAssignment.maxMarks || 100,
      instructions: syncedAssignment.instructions || '',
      requiresAICheck: syncedAssignment.requiresAICheck || false,
      unitId: syncedAssignment.unitId,
      unitCode: syncedAssignment.unitCode,
      unitName: syncedAssignment.unitName,
      documents: []
    };
  };

  const AssignmentCard = ({ assignment, showSubmission = false }: { assignment: SyncedAssignment, showSubmission?: boolean }) => {
    const existing = getSubmissionStatus(assignment.id);
    const isSubmitted = !!existing;
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const isPastDue = daysUntilDue !== null && daysUntilDue < 0;
    
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <CardDescription className="mt-1">
                {assignment.unitCode} - {assignment.unitName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {assignment.isFromSemesterPlan && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Week {assignment.weekNumber}
                </Badge>
              )}
              {assignment.requiresAICheck && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  AI Check Required
                </Badge>
              )}
              <Badge className={getUrgencyColor(assignment.dueDate)}>
                {daysUntilDue !== null && daysUntilDue >= 0 
                  ? `${daysUntilDue} days left`
                  : daysUntilDue !== null && daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : 'No due date'
                }
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4 line-clamp-2">{assignment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Due: {formatDate(assignment.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span>Max Marks: {assignment.maxMarks || 100}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Type: {assignment.submissionType || 'Document'}</span>
            </div>
          </div>

          {showSubmission && existing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Submitted</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Submitted on: {format(existing.submittedAt, 'PPP')}</p>
                {existing.gradingWorkflow?.lecturer?.marks && (
                  <p>Grade: {existing.gradingWorkflow.lecturer.marks}/{assignment.maxMarks || 100}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!showSubmission && (
              <Button 
                onClick={!(isSubmitted || isPastDue) ? () => handleWorkOnAssignment(assignment) : undefined}
                className="flex-1"
                disabled={isSubmitted || isPastDue}
                variant={isSubmitted || isPastDue ? "secondary" : "default"}
              >
                <PenTool className="w-4 h-4 mr-2" />
                {isSubmitted ? "Already Submitted" : isPastDue ? "Past Due" : "Work on Assignment"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selectedAssignment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedAssignment(null)}
          >
            ← Back to Assignments
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedAssignment.title}</h2>
            <p className="text-gray-600">{selectedAssignment.unitCode} - {selectedAssignment.unitName}</p>
          </div>
        </div>
        
        <AssignmentWorkplace
          assignment={convertToAssignmentFormat(selectedAssignment)}
          existingSubmission={getSubmissionStatus(selectedAssignment.id) || undefined}
          onSubmissionComplete={async (submission) => {
            try {
              await submitToGradeVault(submission);
              toast({
                title: 'Submitted to Grade-Vault',
                description: 'Your submission is now waiting for lecturer grading.'
              });
            } catch (e) {
              // Error toast handled in hook
            }
            setSelectedAssignment(null);
          }}
          onSaveDraft={(draft) => {
            // The workplace handles saving via its props; hook has its own draft API in other views
            console.log('Draft saved:', draft);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Assignments</h2>
          <p className="text-gray-600">
            View and complete your course assignments
            {syncedAssignments.length > 0 && (
              <span className="text-blue-600 ml-1">
                • {syncedAssignments.length} assignments from semester plans
              </span>
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">
            Available ({availableAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Assignments</h3>
                <p className="text-gray-600">
                  You're all caught up! Check back later for new assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Overdue Assignments</h3>
                <p className="text-gray-600">
                  Great job staying on top of your assignments!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {overdueAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submitted Assignments</h3>
                <p className="text-gray-600">
                  Start working on your assignments to see them here once submitted.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submittedAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} showSubmission />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
