import { useState, Suspense } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudents } from "@/contexts/students/StudentsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, GraduationCap, FileText, Clock, BookOpen, Users, Settings, Plus, Building } from "lucide-react";

// Simple Error Boundary Component
import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tab component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
import { StudentApproval } from "@/components/registrar/StudentApproval";
import { UnitAllocation } from "@/components/registrar/UnitAllocation";
import { ExamManager } from "@/components/registrar/ExamManager";
import { RetakeManager } from "@/components/registrar/RetakeManager";
import ApprovedStudents from "@/components/registrar/ApprovedStudents";
import { PendingUnitRegistrations } from "@/components/registrar/PendingUnitRegistrations";
import { UnitManagement } from "@/components/registrar/UnitManagement";
import { DepartmentManagement } from "@/components/registrar/DepartmentManagement";
import SupabaseStudentForm from "@/components/registrar/SupabaseStudentForm";
import { CourseManagement } from "@/components/registrar/CourseManagement";
import { CreateCourseForm } from "@/components/registrar/CreateCourseForm";
import { CourseList } from "@/components/registrar/CourseList";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Course } from "@/types/course";
import { CourseContainer } from "@/components/registrar/CourseContainer";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

// Internal component that uses the CoursesContext
const RegistrarDashboardContent = () => {
  const { user, getPendingUsers, getPendingUnitRegistrations } = useAuth();
  const { students } = useStudents();
  const { courses } = useCoursesContext();
  const [activeTab, setActiveTab] = useState("students");
  const [courseView, setCourseView] = useState<'list' | 'create'>('list');
  const { toast } = useToast();

  const pendingUsers = getPendingUsers();
  const pendingStudents = pendingUsers.filter(u => u.role === 'student');
  const totalStudents = students; // All students are approved when using StudentsContext
  const pendingUnitRegistrations = getPendingUnitRegistrations();

  // Course statistics - safely handle different Course interfaces
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => 
    (c as any).status === 'active' || (c as any).isActive
  ).length;
  const pendingCourses = courses.filter(c => 
    (c as any).status === 'pending_approval'
  ).length;
  const draftCourses = courses.filter(c => 
    (c as any).status === 'draft'
  ).length;

  // Real-time stats from data
  const pendingStudentsCount = pendingStudents.length;
  const totalStudentsCount = totalStudents.length;
  const pendingUnitsCount = pendingUnitRegistrations.length;
  // TODO: Replace with real-time retake requests count from Firestore
  const [retakeRequestsCount, setRetakeRequestsCount] = useState(0);

  const handleCreateCourse = () => {
    setActiveTab("courses");
    setCourseView('create');
  };

  const handleViewCourses = () => {
    setActiveTab("courses");
    setCourseView('list');
  };

  const handleViewCourse = (course: Course) => {
    // TODO: Implement course detail view
    toast({
      title: "Course Details",
      description: `Viewing details for ${course.name}`
    });
  };

  const handleEditCourse = (course: Course) => {
    // TODO: Implement course editing
    toast({
      title: "Edit Course",
      description: `Editing ${course.name}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Registrar Dashboard"
        subtitle="Student registration and academic management"
        notificationCount={pendingStudentsCount + pendingUnitsCount}
        additionalActions={
          <Button onClick={handleCreateCourse} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Course</span>
          </Button>
        }
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingStudentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Students awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active enrolled students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              All courses in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Units</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUnitsCount}</div>
            <p className="text-xs text-muted-foreground">
              Unit registrations awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retake Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{retakeRequestsCount}</div>
            <p className="text-xs text-muted-foreground">
              Unit retake applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Status Summary */}
      {totalCourses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Overview</CardTitle>
            <CardDescription>Quick overview of course statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">{activeCourses} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">{pendingCourses} Pending Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">{courses.filter(c => (c as any).status === 'approved' || (c as any).isActive).length} Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">{draftCourses} Drafts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}

      {/* Mobile dropdown navigation */}
      <div className="block lg:hidden mb-4">
        <div className="relative">
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            value={activeTab}
            onChange={e => setActiveTab(e.target.value)}
          >
            <option value="students">👤 Student Approval {pendingStudentsCount > 0 ? `(${pendingStudentsCount})` : ''}</option>
            <option value="approved">👥 Approved Students</option>
            <option value="create-student">🎓 Add New Student</option>
            <option value="departments">🏢 Department Management</option>
            <option value="courses">📚 Course Management {pendingCourses > 0 ? `(${pendingCourses} pending)` : ''}</option>
            <option value="unit-management">⚙️ Unit Management</option>
            <option value="units">📖 Unit Allocation</option>
            <option value="exams">📄 Exam Management</option>
            <option value="retakes">⏰ Retake Management</option>
            <option value="pending-units">📋 Pending Units {pendingUnitsCount > 0 ? `(${pendingUnitsCount})` : ''}</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Desktop scrollable tabs */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="students" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden xl:inline">Student Approval</span>
                  <span className="xl:hidden">Students</span>
                  {pendingStudentsCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {pendingStudentsCount}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="approved" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden xl:inline">Approved Students</span>
                  <span className="xl:hidden">Approved</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="create-student" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden xl:inline">Add New Student</span>
                  <span className="xl:hidden">Add Student</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="departments" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <Building className="w-4 h-4" />
                  <span className="hidden xl:inline">Departments</span>
                  <span className="xl:hidden">Depts</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="courses" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden xl:inline">Course Management</span>
                  <span className="xl:hidden">Courses</span>
                  {pendingCourses > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {pendingCourses}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="unit-management" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden xl:inline">Unit Management</span>
                  <span className="xl:hidden">Unit Mgmt</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="units" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden xl:inline">Unit Allocation</span>
                  <span className="xl:hidden">Allocation</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="exams" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden xl:inline">Exam Management</span>
                  <span className="xl:hidden">Exams</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="retakes" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden xl:inline">Retake Management</span>
                  <span className="xl:hidden">Retakes</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pending-units" 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden xl:inline">Pending Units</span>
                  <span className="xl:hidden">Pending</span>
                  {pendingUnitsCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {pendingUnitsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Tablet tabs (medium screens) */}
        <div className="hidden md:block lg:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="students" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <UserCheck className="w-4 h-4" />
                Students
                {pendingStudentsCount > 0 && <Badge variant="destructive" className="ml-1 text-xs">{pendingStudentsCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <Users className="w-4 h-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="create-student" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <GraduationCap className="w-4 h-4" />
                Add Student
              </TabsTrigger>
              <TabsTrigger value="departments" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <Building className="w-4 h-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Courses
                {pendingCourses > 0 && <Badge variant="secondary" className="ml-1 text-xs">{pendingCourses}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="unit-management" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <Settings className="w-4 h-4" />
                Unit Mgmt
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Allocation
              </TabsTrigger>
              <TabsTrigger value="exams" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <FileText className="w-4 h-4" />
                Exams
              </TabsTrigger>
              <TabsTrigger value="retakes" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <Clock className="w-4 h-4" />
                Retakes
              </TabsTrigger>
              <TabsTrigger value="pending-units" className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm">
                <FileText className="w-4 h-4" />
                Pending Units
                {pendingUnitsCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{pendingUnitsCount}</Badge>}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="students" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Student Approval</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Student Approval...</div>}>
              <StudentApproval />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Approved Students</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Approved Students...</div>}>
              <ApprovedStudents />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="create-student" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Add New Student Form</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Add New Student Form...</div>}>
              <SupabaseStudentForm />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Department Management</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Department Management...</div>}>
              <DepartmentManagement />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Course Management</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Course Management...</div>}>
              {courseView === 'create' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Create New Course</h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setCourseView('list')}
                    >
                      View All Courses
                    </Button>
                  </div>
                  <CreateCourseForm />
                </div>
              ) : (
                <div className="space-y-4">
                  <CourseList
                    onCreateNew={() => setCourseView('create')}
                    onViewCourse={handleViewCourse}
                    onEditCourse={handleEditCourse}
                    CourseContainer={CourseContainer}
                  />
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="unit-management" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Unit Management</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Unit Management...</div>}>
              <UnitManagement />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Unit Allocation</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Unit Allocation...</div>}>
              <UnitAllocation />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Exam Management</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Exam Management...</div>}>
              <ExamManager />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="retakes" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Retake Management</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Retake Management...</div>}>
              <RetakeManager />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="pending-units" className="space-y-4">
          <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading Pending Units</div>}>
            <Suspense fallback={<div className="text-center p-8">Loading Pending Units...</div>}>
              <PendingUnitRegistrations />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export const RegistrarDashboard = () => {
  return <RegistrarDashboardContent />;
};
