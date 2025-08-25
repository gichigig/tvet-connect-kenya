import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  MessageSquare,
  ExternalLink,
  Eye,
  FileText,
  Award,
  UserCheck,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface GradeDisplayProps {
  assignmentId: string;
  submissionData?: any;
  unitId: string;
  unitCode: string;
  unitName: string;
}

interface GradeStatus {
  stage: 'submitted' | 'grading' | 'graded' | 'hod_review' | 'approved' | 'returned';
  lecturer: {
    graded: boolean;
    gradedAt: Date | null;
    gradedBy: string | null;
    marks: number | null;
    feedback: string | null;
  };
  hod: {
    approved: boolean;
    approvedAt: Date | null;
    approvedBy: string | null;
    comments: string | null;
    requiresRevision?: boolean;
  };
}

export const GradeDisplay: React.FC<GradeDisplayProps> = ({
  assignmentId,
  submissionData,
  unitId,
  unitCode,
  unitName
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gradeStatus, setGradeStatus] = useState<GradeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGradeDetails, setShowGradeDetails] = useState(false);

  useEffect(() => {
    if (submissionData?.gradingWorkflow) {
      setGradeStatus(submissionData.gradingWorkflow);
    }
  }, [submissionData]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'grading':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-purple-100 text-purple-800';
      case 'hod_review':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageDescription = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return 'Assignment submitted, waiting for lecturer review';
      case 'grading':
        return 'Lecturer is currently grading your assignment';
      case 'graded':
        return 'Assignment graded by lecturer, pending HOD approval';
      case 'hod_review':
        return 'HOD is reviewing the grades for approval';
      case 'approved':
        return 'Grades approved and visible in Grade-Vault-TVET';
      case 'returned':
        return 'Assignment returned for revision';
      default:
        return 'Status unknown';
    }
  };

  const getMarksColor = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openGradeVault = () => {
    // Open grade-vault-tvet in new window/tab
    const gradeVaultUrl = `http://localhost:3002/grades?student=${user?.id}&unit=${unitCode}`;
    window.open(gradeVaultUrl, '_blank');
    
    toast({
      title: "Opening Grade-Vault-TVET",
      description: "Your grades will open in a new tab",
    });
  };

  if (!gradeStatus || !submissionData) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No submission found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Grading Status
          </CardTitle>
          <Badge className={getStageColor(gradeStatus.stage)}>
            {gradeStatus.stage.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">{getStageDescription(gradeStatus.stage)}</p>
          {submissionData.submittedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Submitted: {format(new Date(submissionData.submittedAt), 'MMM d, yyyy p')}
            </p>
          )}
        </div>

        {/* Grading Workflow */}
        <div className="space-y-3">
          {/* Step 1: Submission */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Assignment Submitted</p>
              <p className="text-xs text-gray-500">
                {format(new Date(submissionData.submittedAt), 'MMM d, yyyy p')}
              </p>
            </div>
          </div>

          {/* Step 2: Lecturer Grading */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              gradeStatus.lecturer.graded 
                ? 'bg-green-500' 
                : gradeStatus.stage === 'grading' 
                ? 'bg-yellow-500' 
                : 'bg-gray-300'
            }`}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Lecturer Grading</p>
              {gradeStatus.lecturer.graded ? (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    Graded by {gradeStatus.lecturer.gradedBy} on{' '}
                    {gradeStatus.lecturer.gradedAt && format(new Date(gradeStatus.lecturer.gradedAt), 'MMM d, yyyy')}
                  </p>
                  {gradeStatus.lecturer.marks !== null && (
                    <p className={`text-sm font-semibold ${getMarksColor(gradeStatus.lecturer.marks, submissionData.maxMarks || 100)}`}>
                      Score: {gradeStatus.lecturer.marks}/{submissionData.maxMarks || 100} marks
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {gradeStatus.stage === 'grading' ? 'In progress...' : 'Pending'}
                </p>
              )}
            </div>
          </div>

          {/* Step 3: HOD Approval (if required) */}
          {submissionData.hodApprovalRequired && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                gradeStatus.hod.approved 
                  ? 'bg-green-500' 
                  : gradeStatus.stage === 'hod_review' 
                  ? 'bg-orange-500' 
                  : 'bg-gray-300'
              }`}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">HOD Approval</p>
                {gradeStatus.hod.approved ? (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Approved by {gradeStatus.hod.approvedBy} on{' '}
                      {gradeStatus.hod.approvedAt && format(new Date(gradeStatus.hod.approvedAt), 'MMM d, yyyy')}
                    </p>
                    {gradeStatus.hod.comments && (
                      <p className="text-xs text-green-600">"{gradeStatus.hod.comments}"</p>
                    )}
                  </div>
                ) : gradeStatus.hod.requiresRevision ? (
                  <div className="space-y-1">
                    <p className="text-xs text-red-600">Requires revision</p>
                    {gradeStatus.hod.comments && (
                      <p className="text-xs text-red-600">"{gradeStatus.hod.comments}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    {gradeStatus.stage === 'hod_review' ? 'Under review...' : 'Pending lecturer grading'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex gap-2">
            {gradeStatus.lecturer.feedback && (
              <Dialog open={showGradeDetails} onOpenChange={setShowGradeDetails}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    View Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lecturer Feedback</DialogTitle>
                    <DialogDescription>
                      Feedback from {gradeStatus.lecturer.gradedBy}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{gradeStatus.lecturer.feedback}</p>
                    </div>
                    {gradeStatus.lecturer.marks !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Final Score:</span>
                        <span className={`text-lg font-bold ${getMarksColor(gradeStatus.lecturer.marks, submissionData.maxMarks || 100)}`}>
                          {gradeStatus.lecturer.marks}/{submissionData.maxMarks || 100}
                        </span>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {gradeStatus.stage === 'approved' && (
              <Button variant="outline" size="sm" onClick={openGradeVault}>
                <ExternalLink className="w-4 h-4 mr-1" />
                View in Grade-Vault
              </Button>
            )}
          </div>

          {/* Status indicator */}
          <div className="text-right">
            {gradeStatus.stage === 'approved' ? (
              <div className="flex items-center gap-1 text-green-600">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Grades Available</span>
              </div>
            ) : gradeStatus.stage === 'returned' ? (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Revision Required</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">In Progress</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeDisplay;
