import { useState, useEffect } from "react";
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
import { AIEssayDetector } from "@/components/lecturer/AIEssayDetector";
import { ManualMarksInput } from "@/components/lecturer/ManualMarksInput";
import { AvailableCourses } from "@/components/courses/AvailableCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { ResponsiveTabsMenu } from "@/components/ResponsiveTabsMenu";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { LecturerCourseContainer } from "@/components/lecturer/LecturerCourseContainer";
import { UnitDetailManager } from "@/components/lecturer/UnitDetailManager";
import { useDashboardSync } from "@/hooks/useDashboardSync";

export const LecturerDashboard = () => {
  return <LecturerDashboardContent />;
};

const LecturerDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const { user, createdContent } = useAuth();
  const { getLecturerUnits } = useUnits();
  const { courses } = useCoursesContext();
  
  // Use dashboard sync hook for real-time semester plan integration
  const { syncedContent, getContentByType } = useDashboardSync('lecturer');

  // Get units assigned to current lecturer
  const assignedUnits = getLecturerUnits(user?.id || '');
  const totalStudents = assignedUnits.reduce((total, unit) => total + unit.enrolled, 0);

  // Get courses that have units assigned to this lecturer
  const lecturerCourses = courses.filter(course => 
    assignedUnits.some(unit => unit.course === course.name || unit.course === course.code)
  );

  // Combine manual created content with semester plan synced content
  const lecturerContent = createdContent.filter(content => content.lecturerId === user?.id);
  const semesterPlanContent = syncedContent.filter(content => content.isFromSemesterPlan);
  
  // Merge and deduplicate content
  const allAssignments = [
    ...lecturerContent.filter(content => content.type === 'assignment'),
    ...getContentByType('assignment')
  ];
  const allNotes = [
    ...lecturerContent.filter(content => content.type === 'notes'),
    ...getContentByType('notes')
  ];
  const allExams = [
    ...lecturerContent.filter(content => content.type === 'exam' || content.type === 'cat'),
    ...getContentByType('exam'),
    ...getContentByType('cat')
  ];

  // Remove duplicates based on ID
  const uniqueAssignments = allAssignments.filter((item, index, self) =>
    index === self.findIndex(i => i.id === item.id)
  );
  const uniqueNotes = allNotes.filter((item, index, self) =>
    index === self.findIndex(i => i.id === item.id)
  );
  const uniqueExams = allExams.filter((item, index, self) =>
    index === self.findIndex(i => i.id === item.id)
  );

  // If a unit is selected for detailed management, show the UnitDetailManager
  if (selectedUnit) {
    return (
      <UnitDetailManager 
        unit={selectedUnit} 
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  const lecturerStats = {
    totalCourses: assignedUnits.length,
    totalStudents: totalStudents,
    pendingAssignments: uniqueAssignments.length,
    upcomingExams: uniqueExams.length
  };

  // Hamburger tab menu config
  const tabItems = [
    { value: "overview", label: "Overview" },
    { value: "courses", label: "My Courses" },
    { value: "units", label: `My Units (${assignedUnits.length})` },
    { value: "assignments", label: `Assignments (${uniqueAssignments.length})` },
    { value: "ai-detection", label: "AI Detection" },
    { value: "notes", label: `Notes (${uniqueNotes.length})` },
    { value: "attendance", label: "Attendance" },
    { value: "quiz-attendance", label: "Quiz Attendance" },
    { value: "exams", label: `Exams & CATs (${uniqueExams.length})` },
    { value: "manual-marks", label: "Manual Marks Input" },
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

      <LecturerDashboardStats stats={lecturerStats} />

       {/* Responsive hamburger for mobile; triggers on md+ */}
      <div className="mb-3">
        <ResponsiveTabsMenu tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="hidden md:block mb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10">
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
        <TabsContent value="courses">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Courses</h2>
                <p className="text-muted-foreground">
                  Courses where you have allocated units
                </p>
              </div>
            </div>

            {lecturerCourses.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Courses Assigned
                </h3>
                <p className="text-sm text-muted-foreground">
                  You haven't been assigned to any course units yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lecturerCourses.map((course) => (
                  <LecturerCourseContainer key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="units">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Units ({assignedUnits.length})</h2>
                <p className="text-muted-foreground">
                  All units assigned to you across different courses
                </p>
              </div>
            </div>

            {assignedUnits.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Units Assigned
                </h3>
                <p className="text-sm text-muted-foreground">
                  You haven't been assigned to any units yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{unit.code}</h3>
                        <p className="text-gray-600">{unit.name}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {unit.credits} Credits
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Course:</span>
                        <span className="font-medium">{unit.course}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span className="font-medium">{unit.enrolled}/{unit.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Year/Semester:</span>
                        <span className="font-medium">Y{unit.year} S{unit.semester}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Click to manage content</span>
                        <span className="text-blue-600 font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentManager />
        </TabsContent>
        <TabsContent value="ai-detection">
          <AIEssayDetector />
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
        <TabsContent value="manual-marks">
          <ManualMarksInput />
        </TabsContent>
        <TabsContent value="location-restrictions">
          <LocationRestrictionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};