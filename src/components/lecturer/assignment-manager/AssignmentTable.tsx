
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { CreatedContent } from "@/contexts/auth/types";

interface AssignmentTableProps {
  assignments: CreatedContent[];
}

export const AssignmentTable = ({ assignments }: AssignmentTableProps) => {
  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const isOverdue = due < now;
    
    if (isOverdue) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Assignments</CardTitle>
        <CardDescription>Manage your created assignments</CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.unitCode}</TableCell>
                  <TableCell>
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {assignment.assignmentType?.toUpperCase() || 'ASSIGNMENT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={assignment.dueDate ? getStatusColor(assignment.dueDate) : 'bg-gray-100 text-gray-800'}>
                      {assignment.dueDate && new Date(assignment.dueDate) < new Date() ? 'OVERDUE' : 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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
