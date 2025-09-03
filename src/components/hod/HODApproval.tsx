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
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  User, 
  Clock,
  MessageSquare,
  Award,
  Edit3,
  RotateCcw,
  Star,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface HODApprovalProps {
  pendingGrades: any[];
  pendingMakeups: any[];
  unitId: string;
  unitCode: string;
  unitName: string;
  onApproveGrade: (gradeId: string, approvalData: any) => void;
  onRejectGrade: (gradeId: string, rejectionData: any) => void;
  onApproveMakeup: (makeupId: string, approvalData: any) => void;
  onRejectMakeup: (makeupId: string, rejectionData: any) => void;
}

interface ApprovalFormData {
  comments: string;
  requiresRevision?: boolean;
  revisedMarks?: number;
  approvalType: 'approve' | 'reject' | 'revise';
}

export const HODApproval: React.FC<HODApprovalProps> = ({
  pendingGrades,
  pendingMakeups,
  unitId,
  unitCode,
  unitName,
  onApproveGrade,
  onRejectGrade,
  onApproveMakeup,
  onRejectMakeup
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'grades' | 'makeups'>('grades');
  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    comments: '',
    requiresRevision: false,
    revisedMarks: undefined,
    approvalType: 'approve'
  });
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'urgent' | 'recent'>('all');

  const getGradeColor = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityLevel = (item: any) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(item.gradingWorkflow?.lecturer?.gradedAt || item.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceSubmission > 7) return 'urgent';
    if (daysSinceSubmission > 3) return 'medium';
    return 'normal';
  };

  const handleOpenApproval = (item: any, type: 'grade' | 'makeup') => {
    setSelectedItem({ ...item, type });
    setApprovalForm({
      comments: '',
      requiresRevision: false,
      revisedMarks: item.gradingWorkflow?.lecturer?.marks,
      approvalType: 'approve'
    });
    setShowApprovalDialog(true);
  };

  const handleApprovalAction = async () => {
    if (!selectedItem) return;

    const approvalData = {
      approvedBy: `${user?.firstName} ${user?.lastName}`,
      approvedAt: new Date(),
      comments: approvalForm.comments,
      hodId: user?.id,
      revisedMarks: approvalForm.revisedMarks,
      requiresRevision: approvalForm.requiresRevision,
      actionType: approvalForm.approvalType
    };

    try {
      if (selectedItem.type === 'grade') {
        if (approvalForm.approvalType === 'approve') {
          await onApproveGrade(selectedItem.id, approvalData);
          toast({
            title: "Grade Approved",
            description: "Grade has been approved and is now visible to the student",
          });
        } else {
          await onRejectGrade(selectedItem.id, { ...approvalData, requiresRevision: true });
          toast({
            title: "Grade Returned",
            description: "Grade has been returned to lecturer for revision",
          });
        }
      } else {
        if (approvalForm.approvalType === 'approve') {
          await onApproveMakeup(selectedItem.id, approvalData);
          toast({
            title: "Makeup Assignment Approved",
            description: "Makeup assignment has been approved and published",
          });
        } else {
          await onRejectMakeup(selectedItem.id, approvalData);
          toast({
            title: "Makeup Assignment Rejected",
            description: "Makeup assignment has been rejected",
          });
        }
      }
      
      setShowApprovalDialog(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter items based on priority
  const filterItems = (items: any[]) => {
    switch (filterStatus) {
      case 'urgent':
        return items.filter(item => getPriorityLevel(item) === 'urgent');
      case 'recent':
        return items.filter(item => {
          const daysSince = Math.floor(
            (new Date().getTime() - new Date(item.gradingWorkflow?.lecturer?.gradedAt || item.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince <= 1;
        });
      default:
        return items;
    }
  };

  const filteredGrades = filterItems(pendingGrades);
  const filteredMakeups = filterItems(pendingMakeups);
  
  const urgentGradesCount = pendingGrades.filter(g => getPriorityLevel(g) === 'urgent').length;
  const urgentMakeupsCount = pendingMakeups.filter(m => getPriorityLevel(m) === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                HOD Approval Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {unitCode} - {unitName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {pendingGrades.length} Grades
              </Badge>
              <Badge variant="outline" className="text-purple-600">
                {pendingMakeups.length} Makeups
              </Badge>
              {(urgentGradesCount + urgentMakeupsCount) > 0 && (
                <Badge variant="destructive">
                  {urgentGradesCount + urgentMakeupsCount} Urgent
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Filter:</Label>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="urgent">Urgent (7+ days)</SelectItem>
              <SelectItem value="recent">Recent (24h)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Grade Approvals ({filteredGrades.length})
          </TabsTrigger>
          <TabsTrigger value="makeups" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Makeup Assignments ({filteredMakeups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          {filteredGrades.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No grades pending approval</p>
              </CardContent>
            </Card>
          ) : (
            filteredGrades.map((grade) => (
              <Card key={grade.id} className={getPriorityLevel(grade) === 'urgent' ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{grade.title}</h4>
                        <Badge className={`${getGradeColor(grade.gradingWorkflow.lecturer.marks, grade.maxMarks)} bg-opacity-10`}>
                          {grade.gradingWorkflow.lecturer.marks}/{grade.maxMarks}
                        </Badge>
                        {getPriorityLevel(grade) === 'urgent' && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Student:</strong> {grade.studentName}</p>
                          <p><strong>Lecturer:</strong> {grade.gradingWorkflow.lecturer.gradedBy}</p>
                        </div>
                        <div>
                          <p><strong>Graded:</strong> {format(new Date(grade.gradingWorkflow.lecturer.gradedAt), 'MMM d, yyyy')}</p>
                          <p><strong>Type:</strong> {grade.submissionType}</p>
                        </div>
                      </div>

                      {grade.gradingWorkflow.lecturer.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <strong>Lecturer Feedback:</strong>
                          <p className="mt-1">{grade.gradingWorkflow.lecturer.feedback.substring(0, 150)}
                            {grade.gradingWorkflow.lecturer.feedback.length > 150 && '...'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Preview submission:', grade);
                          toast({
                            title: "Opening Submission",
                            description: "Submission preview would open here",
                          });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleOpenApproval(grade, 'grade')}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="makeups" className="space-y-4">
          {filteredMakeups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No makeup assignments pending approval</p>
              </CardContent>
            </Card>
          ) : (
            filteredMakeups.map((makeup) => (
              <Card key={makeup.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{makeup.title}</h4>
                        <Badge variant="outline" className="capitalize">
                          {makeup.type}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {makeup.maxMarks} marks
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Created by:</strong> {makeup.createdBy}</p>
                          <p><strong>Due Date:</strong> {format(new Date(makeup.dueDate), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p><strong>Created:</strong> {format(new Date(makeup.createdAt), 'MMM d, yyyy')}</p>
                          <p><strong>Eligible Students:</strong> {makeup.eligibleStudents?.length || 'All'}</p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-gray-50 rounded text-sm">
                          <strong>Description:</strong>
                          <p className="mt-1">{makeup.description}</p>
                        </div>
                        
                        {makeup.reason && (
                          <div className="p-3 bg-blue-50 rounded text-sm">
                            <strong>Reason for Makeup:</strong>
                            <p className="mt-1">{makeup.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenApproval(makeup, 'makeup')}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'grade' ? 'Review Grade' : 'Review Makeup Assignment'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'grade' 
                ? `Grade for ${selectedItem?.studentName}: ${selectedItem?.title}`
                : `Makeup assignment: ${selectedItem?.title}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Item Details */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                {selectedItem?.type === 'grade' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Student:</strong> {selectedItem?.studentName}</p>
                        <p><strong>Assignment:</strong> {selectedItem?.title}</p>
                        <p><strong>Type:</strong> {selectedItem?.submissionType}</p>
                      </div>
                      <div>
                        <p><strong>Max Marks:</strong> {selectedItem?.maxMarks}</p>
                        <p><strong>Awarded:</strong> <span className={getGradeColor(selectedItem?.gradingWorkflow?.lecturer?.marks, selectedItem?.maxMarks)}>
                          {selectedItem?.gradingWorkflow?.lecturer?.marks}
                        </span></p>
                        <p><strong>Percentage:</strong> {((selectedItem?.gradingWorkflow?.lecturer?.marks / selectedItem?.maxMarks) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    {selectedItem?.gradingWorkflow?.lecturer?.feedback && (
                      <div>
                        <Label className="text-sm font-medium">Lecturer Feedback:</Label>
                        <div className="mt-1 p-3 bg-white rounded border text-sm">
                          {selectedItem.gradingWorkflow.lecturer.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Title:</strong> {selectedItem?.title}</p>
                        <p><strong>Type:</strong> {selectedItem?.type}</p>
                        <p><strong>Max Marks:</strong> {selectedItem?.maxMarks}</p>
                      </div>
                      <div>
                        <p><strong>Due Date:</strong> {selectedItem && format(new Date(selectedItem.dueDate), 'MMM d, yyyy')}</p>
                        <p><strong>Created by:</strong> {selectedItem?.createdBy}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Description:</Label>
                      <div className="mt-1 p-3 bg-white rounded border text-sm">
                        {selectedItem?.description}
                      </div>
                    </div>
                    
                    {selectedItem?.reason && (
                      <div>
                        <Label className="text-sm font-medium">Reason:</Label>
                        <div className="mt-1 p-3 bg-white rounded border text-sm">
                          {selectedItem.reason}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={approvalForm.approvalType} onValueChange={(value: any) => setApprovalForm(prev => ({ ...prev, approvalType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        {selectedItem?.type === 'grade' ? 'Return for Revision' : 'Reject'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedItem?.type === 'grade' && approvalForm.approvalType === 'approve' && (
                <div className="space-y-2">
                  <Label>Revised Marks (Optional)</Label>
                  <Input
                    type="number"
                    value={approvalForm.revisedMarks}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, revisedMarks: parseInt(e.target.value) || prev.revisedMarks }))}
                    min="0"
                    max={selectedItem?.maxMarks || 100}
                    placeholder="Leave blank to keep original marks"
                  />
                  <p className="text-xs text-gray-500">
                    Original: {selectedItem?.gradingWorkflow?.lecturer?.marks}/{selectedItem?.maxMarks}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>HOD Comments</Label>
                <Textarea
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder={approvalForm.approvalType === 'approve' 
                    ? "Optional comments for approval..." 
                    : "Required: Explain reason for rejection/revision..."
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className={approvalForm.approvalType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                  {approvalForm.approvalType === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      {selectedItem?.type === 'grade' ? 'Return' : 'Reject'}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm {approvalForm.approvalType === 'approve' ? 'Approval' : 'Rejection'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {approvalForm.approvalType === 'approve' ? (
                      selectedItem?.type === 'grade' 
                        ? "This grade will be approved and visible to the student immediately."
                        : "This makeup assignment will be published and available to students."
                    ) : (
                      selectedItem?.type === 'grade'
                        ? "This grade will be returned to the lecturer for revision."
                        : "This makeup assignment will be rejected and not published."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprovalAction}>
                    Confirm {approvalForm.approvalType === 'approve' ? 'Approval' : 'Rejection'}
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

export default HODApproval;
