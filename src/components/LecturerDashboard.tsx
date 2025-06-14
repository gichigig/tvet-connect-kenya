
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { AssignmentManager } from "@/components/lecturer/AssignmentManager";
import { NotesManager } from "@/components/lecturer/NotesManager";
import { AttendanceManager } from "@/components/lecturer/AttendanceManager";
import { ExamManager } from "@/components/lecturer/ExamManager";
import { QuizAttendance } from "@/components/lecturer/QuizAttendance";
import { UnitManagement } from "@/components/lecturer/UnitManagement";
import { LecturerDashboardStats } from "@/components/lecturer/LecturerDashboardStats";
import { LecturerDashboardOverview } from "@/components/lecturer/LecturerDashboardOverview";
import { useAuth } from "@/contexts/AuthContext";

export const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, createdUnits } = useAuth();

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);
  const totalStudents = assignedUnits.reduce((total, unit) => total + unit.enrolled, 0);

  const stats = {
    totalCourses: assignedUnits.length,
    totalStudents: totalStudents,
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

      <LecturerDashboardStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">My Units</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="quiz-attendance">Quiz Attendance</TabsTrigger>
          <TabsTrigger value="exams">Exams & CATs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <LecturerDashboardOverview onTabChange={setActiveTab} />
        </TabsContent>

        <TabsContent value="units">
          <UnitManagement />
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
