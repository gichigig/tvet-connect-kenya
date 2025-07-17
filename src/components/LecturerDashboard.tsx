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
import { LocationRestrictionManager } from "@/components/lecturer/LocationRestrictionManager";
import { useAuth } from "@/contexts/AuthContext";
import { ResponsiveTabsMenu } from "@/components/ResponsiveTabsMenu";

export const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, createdUnits, createdContent } = useAuth();

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);
  const totalStudents = assignedUnits.reduce((total, unit) => total + unit.enrolled, 0);

  // Get content created by current lecturer
  const lecturerContent = createdContent.filter(content => content.lecturerId === user?.id);
  const assignments = lecturerContent.filter(content => content.type === 'assignment');
  const notes = lecturerContent.filter(content => content.type === 'notes');
  const exams = lecturerContent.filter(content => content.type === 'exam' || content.type === 'cat');

  const stats = {
    totalCourses: assignedUnits.length,
    totalStudents: totalStudents,
    pendingAssignments: assignments.length,
    upcomingExams: exams.length
  };

  // Hamburger tab menu config
  const tabItems = [
    { value: "overview", label: "Overview" },
    { value: "units", label: `My Units (${assignedUnits.length})` },
    { value: "assignments", label: `Assignments (${assignments.length})` },
    { value: "notes", label: `Notes (${notes.length})` },
    { value: "attendance", label: "Attendance" },
    { value: "quiz-attendance", label: "Quiz Attendance" },
    { value: "exams", label: `Exams & CATs (${exams.length})` },
    { value: "location-restrictions", label: "Location Restrictions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
          <p className="text-gray-600">
            Welcome {user?.firstName} {user?.lastName} - Manage your courses, assignments, and student activities
          </p>
        </div>
        <GraduationCap className="w-8 h-8 text-blue-600" />
      </div>

      <LecturerDashboardStats stats={stats} />

      {/* Responsive hamburger for mobile; triggers on md+ */}
      <div className="mb-3">
        <ResponsiveTabsMenu tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="hidden md:block mb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            {tabItems.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
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
        <TabsContent value="location-restrictions">
          <LocationRestrictionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
