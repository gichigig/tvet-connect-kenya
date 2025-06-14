
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Upload, FileText, Clock, GraduationCap } from "lucide-react";
import { AssignmentManager } from "@/components/lecturer/AssignmentManager";
import { NotesManager } from "@/components/lecturer/NotesManager";
import { AttendanceManager } from "@/components/lecturer/AttendanceManager";
import { ExamManager } from "@/components/lecturer/ExamManager";
import { QuizAttendance } from "@/components/lecturer/QuizAttendance";

export const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalCourses: 3,
    totalStudents: 89,
    pendingAssignments: 12,
    upcomingExams: 2
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
          <p className="text-gray-600">Manage your courses, assignments, and student activities</p>
        </div>
        <GraduationCap className="w-8 h-8 text-blue-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">To be graded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingExams}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="quiz-attendance">Quiz Attendance</TabsTrigger>
          <TabsTrigger value="exams">Exams & CATs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest course activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Assignment submitted - Math 101</span>
                  <Badge variant="secondary">2 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attendance taken - Physics Lab</span>
                  <Badge variant="secondary">1 day ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notes uploaded - Chemistry</span>
                  <Badge variant="secondary">2 days ago</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setActiveTab('assignments')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('attendance')}>
                  <Users className="w-4 h-4 mr-2" />
                  Take Attendance
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('notes')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentManager />
        </TabsContent>

        <TabsContent value="notes">
          <NotesManager />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceManager />
        </TabsContent>

        <TabsContent value="quiz-attendance">
          <QuizAttendance />
        </TabsContent>

        <TabsContent value="exams">
          <ExamManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
