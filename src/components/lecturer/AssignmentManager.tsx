import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  unit: string;
  totalMarks: number;
  submissions: number;
  status: 'draft' | 'published' | 'closed';
}

export const AssignmentManager = () => {
  const { user } = useAuth();
  const { getLecturerUnits } = useUnits();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Programming Assignment 1',
      description: 'Create a calculator application using JavaScript',
      dueDate: '2025-09-15',
      unit: 'CP101',
      totalMarks: 100,
      submissions: 12,
      status: 'published'
    },
    {
      id: '2',
      title: 'Database Design Project',
      description: 'Design and implement a library management system',
      dueDate: '2025-09-20',
      unit: 'CP201',
      totalMarks: 150,
      submissions: 0,
      status: 'draft'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    unit: '',
    totalMarks: 100
  });

  const lecturerUnits = getLecturerUnits(user?.id || '');

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.unit) return;

    const assignment: Assignment = {
      id: Date.now().toString(),
      ...newAssignment,
      submissions: 0,
      status: 'draft'
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({
      title: '',
      description: '',
      dueDate: '',
      unit: '',
      totalMarks: 100
    });
    setShowCreateForm(false);
  };

  const handlePublishAssignment = (id: string) => {
    setAssignments(assignments.map(assignment =>
      assignment.id === id ? { ...assignment, status: 'published' as const } : assignment
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Manager</h2>
          <p className="text-gray-600">Create and manage assignments for your units</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Fill in the details for the new assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select
                  value={newAssignment.unit}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.code}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  value={newAssignment.totalMarks}
                  onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Assignment description and instructions"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {assignment.title}
                  </CardTitle>
                  <CardDescription>{assignment.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Badge variant="outline">{assignment.unit}</Badge>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {assignment.submissions} submissions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {assignment.totalMarks} marks
                  </span>
                </div>
                <div className="flex gap-2">
                  {assignment.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublishAssignment(assignment.id)}
                    >
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
