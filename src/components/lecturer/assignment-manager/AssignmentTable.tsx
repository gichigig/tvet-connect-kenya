
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, BookOpen, ChevronDown, ChevronRight, Users } from "lucide-react";
import { CreatedContent } from "@/contexts/auth/types";
import { useToast } from "@/hooks/use-toast";
import { SubmissionViewer } from "./SubmissionViewer";
import { FallbackStorageIndicator } from "@/components/fallback/FallbackStorageIndicator";

interface AssignmentTableProps {
  assignments: (CreatedContent | any)[];
}

export const AssignmentTable = ({ assignments }: AssignmentTableProps) => {
  const { toast } = useToast();
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());
  
  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const isOverdue = due < now;
    
    if (isOverdue) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const toggleExpanded = (assignmentId: string) => {
    const newExpanded = new Set(expandedAssignments);
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId);
    } else {
      newExpanded.add(assignmentId);
    }
    setExpandedAssignments(newExpanded);
  };

  const handleEditAssignment = (assignment: any) => {
    if (assignment.isFromSemesterPlan) {
      toast({
        title: "Edit in Semester Planning",
        description: "This assignment was created through semester planning. Please edit it in the Semester Planning tab.",
        duration: 3000,
      });
    } else {
      // Handle editing manually created assignments
      toast({
        title: "Edit Assignment",
        description: "Assignment editing functionality will be implemented here.",
        duration: 3000,
      });
    }
  };

  const handleDeleteAssignment = (assignment: any) => {
    if (assignment.isFromSemesterPlan) {
      toast({
        title: "Cannot Delete",
        description: "Assignments from semester plans cannot be deleted here. Edit them in the Semester Planning tab.",
        variant: "destructive",
        duration: 3000,
      });
    } else {
      // Handle deleting manually created assignments
      toast({
        title: "Delete Assignment",
        description: "Assignment deletion functionality will be implemented here.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleViewAssignment = (assignment: any) => {
    toast({
      title: "View Assignment",
      description: "Assignment viewing functionality will be implemented here.",
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Assignments</CardTitle>
        <CardDescription>Manage your created assignments</CardDescription>
        <FallbackStorageIndicator className="mt-2" />
      </CardHeader>
      <CardContent>
        {assignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <>
                  <TableRow key={assignment.id} className="group">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(assignment.id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedAssignments.has(assignment.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.unitCode}</TableCell>
                    <TableCell>
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assignment.submissionType || assignment.assignmentType?.toUpperCase() || 'ASSIGNMENT'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.isFromSemesterPlan ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Week {assignment.weekNumber}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={assignment.dueDate ? getStatusColor(assignment.dueDate) : 'bg-gray-100 text-gray-800'}>
                        {assignment.dueDate && new Date(assignment.dueDate) < new Date() ? 'OVERDUE' : 'ACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAssignment(assignment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedAssignments.has(assignment.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="bg-gray-50 border-t">
                          <div className="p-4">
                            <SubmissionViewer
                              assignmentId={assignment.id}
                              assignmentTitle={assignment.title}
                              dueDate={new Date(assignment.dueDate || Date.now())}
                              unitId={assignment.unitId}
                              unitCode={assignment.unitCode}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No assignments created yet.</p>
            <p className="text-sm">Create your first assignment using the button above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
