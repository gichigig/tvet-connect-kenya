
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const AssignmentManager = () => {
  const { toast } = useToast();
  const { user, createdUnits, createdContent, addCreatedContent } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);
  
  // Get assignments created by current lecturer
  const assignments = createdContent.filter(content => 
    content.type === 'assignment' && content.lecturerId === user?.id
  );

  const [formData, setFormData] = useState({
    title: '',
    unitCode: '',
    description: '',
    dueDate: '',
    assignmentType: 'practical',
    acceptedFormats: [] as string[],
    attachments: null as File[] | null
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedUnit = assignedUnits.find(unit => unit.code === formData.unitCode);
    if (!selectedUnit) {
      toast({
        title: "Error",
        description: "Please select a valid unit.",
        variant: "destructive",
      });
      return;
    }

    const newAssignment = {
      id: Date.now().toString(),
      type: 'assignment' as const,
      title: formData.title,
      description: formData.description,
      unitId: selectedUnit.id,
      unitCode: formData.unitCode,
      unitName: selectedUnit.name,
      lecturerId: user?.id || '',
      isVisible: true,
      createdAt: new Date().toISOString(),
      dueDate: formData.dueDate,
      assignmentType: formData.assignmentType as 'practical' | 'theory' | 'project',
      acceptedFormats: formData.acceptedFormats,
      questionFileName: formData.attachments?.[0]?.name || ''
    };

    addCreatedContent(newAssignment);
    setFormData({
      title: '',
      unitCode: '',
      description: '',
      dueDate: '',
      assignmentType: 'practical',
      acceptedFormats: [],
      attachments: null
    });
    setShowCreateForm(false);

    toast({
      title: "Assignment Created",
      description: `${newAssignment.title} has been created successfully.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, acceptedFormats: [...formData.acceptedFormats, format] });
    } else {
      setFormData({ 
        ...formData, 
        acceptedFormats: formData.acceptedFormats.filter(f => f !== format) 
      });
    }
  };

  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const isOverdue = due < now;
    
    if (isOverdue) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-gray-600">Create and manage course assignments</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Fill in the details to create a new assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCode">Unit</Label>
                  <Select value={formData.unitCode} onValueChange={(value) => setFormData({ ...formData, unitCode: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter assignment description and requirements"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignmentType">Assignment Type</Label>
                  <Select value={formData.assignmentType} onValueChange={(value) => setFormData({ ...formData, assignmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accepted Submission Formats</Label>
                <div className="flex gap-4">
                  {['pdf', 'doc', 'docx', 'txt'].map((format) => (
                    <label key={format} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.acceptedFormats.includes(format)}
                        onChange={(e) => handleFormatChange(format, e.target.checked)}
                      />
                      <span className="text-sm">{format.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Question File (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
                {formData.attachments && (
                  <p className="text-sm text-gray-600">
                    {formData.attachments.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Assignment</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};
