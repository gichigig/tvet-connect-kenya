// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, FileText, Users, Calendar, Clock, Download, ExternalLink, User } from "lucide-react";
import { Unit, UnitMaterial, Assignment } from './types';

interface UnitDetailsProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
}

export const UnitDetails: React.FC<UnitDetailsProps> = ({ unit, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for materials and assignments
  const materials: UnitMaterial[] = [
    {
      id: '1',
      unitId: unit.id,
      title: 'Introduction to Programming Concepts',
      description: 'Basic programming fundamentals and theory',
      type: 'document',
      url: '/materials/intro-programming.pdf',
      uploadDate: '2025-09-01',
      lecturer: 'Dr. Smith'
    },
    {
      id: '2',
      unitId: unit.id,
      title: 'Variables and Data Types Video',
      description: 'Comprehensive video tutorial on programming variables',
      type: 'video',
      url: '/materials/variables-tutorial.mp4',
      uploadDate: '2025-09-03',
      lecturer: 'Dr. Smith'
    }
  ];

  const assignments: Assignment[] = [
    {
      id: '1',
      unitId: unit.id,
      title: 'Programming Assignment 1',
      description: 'Create a simple calculator application',
      dueDate: '2025-09-15',
      totalMarks: 100,
      submissionStatus: 'pending'
    },
    {
      id: '2',
      unitId: unit.id,
      title: 'Code Review Exercise',
      description: 'Review and improve provided code samples',
      dueDate: '2025-09-22',
      totalMarks: 50,
      submissionStatus: 'submitted',
      grade: 42,
      feedback: 'Good work! Consider optimizing the algorithm for better performance.'
    }
  ];

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <Calendar className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      case 'assignment': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {unit.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unit Code</label>
                    <p className="font-semibold">{unit.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course</label>
                    <p className="font-semibold">{unit.course}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Credits</label>
                    <p className="font-semibold">{unit.credits}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year & Semester</label>
                    <p className="font-semibold">Year {unit.year}, Semester {unit.semester}</p>
                  </div>
                </div>
                
                {unit.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="mt-1">{unit.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{unit.enrolled}/{unit.capacity} Students</span>
                  </div>
                  {unit.attendance !== undefined && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{unit.attendance}% Attendance</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="grid gap-4">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        {getFileTypeIcon(material.type)}
                        <div>
                          <h4 className="font-semibold">{material.title}</h4>
                          <p className="text-sm text-gray-600">{material.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {material.lecturer}
                            </span>
                            <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <Badge className={getSubmissionStatusColor(assignment.submissionStatus || 'pending')}>
                          {assignment.submissionStatus?.charAt(0).toUpperCase() + assignment.submissionStatus?.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {assignment.totalMarks} marks
                        </span>
                      </div>

                      {assignment.grade !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Grade:</span>
                            <span className="font-semibold">{assignment.grade}/{assignment.totalMarks}</span>
                          </div>
                          {assignment.feedback && (
                            <p className="text-sm text-gray-600 mt-2">{assignment.feedback}</p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {assignment.submissionStatus === 'pending' && (
                          <Button size="sm">Submit Assignment</Button>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Current Grade</label>
                    <div className="text-2xl font-bold">
                      {unit.grade || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Attendance</label>
                    <div className="text-2xl font-bold">
                      {unit.attendance || 0}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Assignment Progress</label>
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{assignment.title}</span>
                        <div className="flex items-center gap-2">
                          {assignment.grade !== undefined ? (
                            <span className="text-sm font-medium">{assignment.grade}/{assignment.totalMarks}</span>
                          ) : (
                            <Badge variant="outline">{assignment.submissionStatus}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
