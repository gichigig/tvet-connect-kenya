import { useState, useRef } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudents } from "@/contexts/students/StudentsContext";
import { useUsers } from "@/contexts/users/UsersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileCheck, Users, AlertTriangle, TrendingUp, UserCheck, DollarSign, BookOpen, FlaskConical, Building2, Mail, Send, Receipt, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { ResultsApproval } from "@/components/hod/ResultsApproval";
import { ResultsNotification } from "@/components/hod/ResultsNotification";
import { StudentResults } from "@/components/hod/StudentResults";
import { RetakeRecommendations } from "@/components/hod/RetakeRecommendations";
import { StaffManagement } from "@/components/hod/StaffManagement";
import { BudgetManagement } from "@/components/hod/BudgetManagement";
import { CurriculumOversight } from "@/components/hod/CurriculumOversight";
import { ResearchCoordination } from "@/components/hod/ResearchCoordination";
import { IndustryLiaison } from "@/components/hod/IndustryLiaison";
import { EmailManager } from "@/components/hod/EmailManager";
import { StudentFeesOverview } from "@/components/hod/StudentFeesOverview";
import { UnitAssignment } from "@/components/hod/UnitAssignment";
import { TimetableManagement } from "@/components/hod/TimetableManager";
import { CourseApprovalManagement } from "@/components/hod/CourseApprovalManagement";
import { UnitRegistrationApproval } from "@/components/hod/UnitRegistrationApproval";
import HODGradeVaultDashboard from "@/components/hod/HODGradeVaultDashboard";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { HodCourseContainer } from "@/components/hod/HodCourseContainer";
import { HodSemesterControl } from "@/components/hod/HodSemesterControl";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export const HodDashboard = () => {
  const { user, studentFees, getAllUsers } = useAuth();
  const { students } = useStudents();
  const { examResults } = useUsers();
  const [activeTab, setActiveTab] = useState("results");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const users = getAllUsers();
  const departmentStudentFees = studentFees.filter(fee => {
    const student = students.find(s => s.id === fee.studentId);
    return student !== undefined;
  });

  // Real-time dashboard stats
  const pendingApprovals = examResults.filter(r => (r.status as string) === 'pending').length;
  const totalStudents = students.length;
  const failedStudents = examResults.filter(r => r.status === 'fail').length;
  const deferredExams = examResults.filter(r => (r.status as string) === 'deferred').length;
  const staffMembersCount = users.filter(u => u.role === 'lecturer').length;
  const totalFeesOwed = departmentStudentFees
    .filter(f => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0);

  // Define tabs for mobile menu
  const tabItems = [
    { value: 'courses', label: 'Course Approval' },
    { value: 'course-units', label: 'Course Units' },
    { value: 'unit-registrations', label: 'Unit Registrations' },
    { value: 'results', label: 'Results' },
    { value: 'send-results', label: 'Send Results' },
    { value: 'students', label: 'Students' },
    { value: 'fees', label: 'Fees' },
    { value: 'retakes', label: 'Retakes' },
    { value: 'staff', label: 'Staff' },
    { value: 'units', label: 'Units' },
    { value: 'timetables', label: 'Timetables' },
    { value: 'budget', label: 'Budget' },
    { value: 'curriculum', label: 'Curriculum' },
    { value: 'research', label: 'Research' },
    { value: 'industry', label: 'Industry' },
    { value: 'emails', label: 'Emails' }
  ];

  const scrollTabs = (offset: number) => {
    tabsContainerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="HOD Dashboard"
        subtitle={`Department of ${user?.department || "Computer Science"} - Comprehensive departmental management and oversight`}
        notificationCount={pendingApprovals + deferredExams}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Results awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{staffMembersCount}</div>
            <p className="text-xs text-muted-foreground">Department faculty</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <p className="text-xs text-muted-foreground">Annual budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Fees Owed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KSh {totalFeesOwed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding balances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4</div>
            <p className="text-xs text-muted-foreground">Attachments & internships</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Mobile hamburger menu */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {tabItems.map(item => (
                <DropdownMenuItem key={item.value} onSelect={() => setActiveTab(item.value)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm font-medium">{tabItems.find(i => i.value === activeTab)?.label}</span>
        </div>
        {/* Desktop tabs */}
        <div className="relative hidden md:block">
          <button onClick={() => scrollTabs(-200)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div ref={tabsContainerRef} className="overflow-x-auto">
            <TabsList className="flex space-x-2 w-max">
              <TabsTrigger value="courses" className="flex items-center gap-1 text-xs">
                <BookOpen className="w-3 h-3" />
                Course Approval
              </TabsTrigger>
              <TabsTrigger value="course-units" className="flex items-center gap-1 text-xs">
                <BookOpen className="w-3 h-3" />
                Course Units
              </TabsTrigger>
              <TabsTrigger value="unit-registrations" className="flex items-center gap-1 text-xs">
                <GraduationCap className="w-3 h-3" />
                Unit Registrations
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-1 text-xs">
                <FileCheck className="w-3 h-3" />
                Results
              </TabsTrigger>
              <TabsTrigger value="grade-vault" className="flex items-center gap-1 text-xs">
                <GraduationCap className="w-3 h-3" />
                Grade Vault
              </TabsTrigger>
              <TabsTrigger value="send-results" className="flex items-center gap-1 text-xs">
                <Send className="w-3 h-3" />
                Send Results
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1 text-xs">
                <Users className="w-3 h-3" />
                Students
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex items-center gap-1 text-xs">
                <Receipt className="w-3 h-3" />
                Fees
              </TabsTrigger>
              <TabsTrigger value="retakes" className="flex items-center gap-1 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Retakes
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-1 text-xs">
                <UserCheck className="w-3 h-3" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-1 text-xs">
                <BookOpen className="w-3 h-3" />
                Units
              </TabsTrigger>
              <TabsTrigger value="timetables" className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" />
                Timetables
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-1 text-xs">
                <DollarSign className="w-3 h-3" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="flex items-center gap-1 text-xs">
                <BookOpen className="w-3 h-3" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-1 text-xs">
                <FlaskConical className="w-3 h-3" />
                Research
              </TabsTrigger>
              <TabsTrigger value="industry" className="flex items-center gap-1 text-xs">
                <Building2 className="w-3 h-3" />
                Industry
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center gap-1 text-xs">
                <Mail className="w-3 h-3" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="semester" className="flex items-center gap-1 text-xs">
                <GraduationCap className="w-3 h-3" />
                Semester
              </TabsTrigger>
            </TabsList>
          </div>
          <button onClick={() => scrollTabs(200)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <TabsContent value="courses" className="space-y-4">
          <CourseApprovalManagement />
        </TabsContent>

        <TabsContent value="course-units" className="space-y-4">
          <HodCourseUnitsContent />
        </TabsContent>

        <TabsContent value="unit-registrations" className="space-y-4">
          <UnitRegistrationApproval />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsApproval />
        </TabsContent>

        <TabsContent value="grade-vault" className="space-y-4">
          <HODGradeVaultDashboard />
        </TabsContent>

        <TabsContent value="send-results" className="space-y-4">
          <ResultsNotification />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentResults />
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <StudentFeesOverview />
        </TabsContent>

        <TabsContent value="retakes" className="space-y-4">
          <RetakeRecommendations />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <UnitAssignment />
        </TabsContent>

        <TabsContent value="timetables" className="space-y-4">
          <TimetableManagement />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetManagement />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <CurriculumOversight />
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <ResearchCoordination />
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <IndustryLiaison />
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <EmailManager />
        </TabsContent>

        <TabsContent value="semester" className="space-y-4">
          <HodSemesterControl />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

// Internal component that uses the CoursesContext
const HodCourseUnitsContent = () => {
  const { courses } = useCoursesContext();
  
  // Filter courses that are active/approved for unit allocation
  const activeCourses = courses.filter(course => 
    course.status === 'active' || course.status === 'approved'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Unit Management</h2>
          <p className="text-muted-foreground">
            Allocate lecturers to course units and track assignments
          </p>
        </div>
      </div>

      {activeCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Active Courses
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              There are no active or approved courses available for unit allocation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCourses.map((course) => (
            <HodCourseContainer key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};