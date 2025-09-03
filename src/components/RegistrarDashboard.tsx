import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudents } from "@/contexts/students/StudentsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, GraduationCap, FileText, Clock, BookOpen, Users, Settings, Plus, Building } from "lucide-react";
import { StudentApproval } from "@/components/registrar/StudentApproval";
import { UnitAllocation } from "@/components/registrar/UnitAllocation";
import { ExamManager } from "@/components/registrar/ExamManager";
import { RetakeManager } from "@/components/registrar/RetakeManager";
import ApprovedStudents from "@/components/registrar/ApprovedStudents";
import { PendingUnitRegistrations } from "@/components/registrar/PendingUnitRegistrations";
import { UnitManagement } from "@/components/registrar/UnitManagement";
import { DepartmentManagement } from "@/components/registrar/DepartmentManagement";
import AddStudentForm from "@/components/registrar/AddStudentFormMultiStep";
import CreateStudentForm from "@/components/registrar/CreateStudentForm";
import EnhancedAddStudentForm from "@/components/registrar/EnhancedAddStudentForm";
import SupabaseStudentForm from "@/components/registrar/SupabaseStudentForm";
import { CourseManagement } from "@/components/registrar/CourseManagement";
import { CreateCourseForm } from "@/components/registrar/CreateCourseForm";
import { CourseList } from "@/components/registrar/CourseList";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Course } from "@/types/course";
import { CourseContainer } from "@/components/registrar/CourseContainer";

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

  // Course statistics
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === 'active').length;
  const pendingCourses = courses.filter(c => c.status === 'pending_approval').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard</h1>
          <p className="text-gray-600">Student registration and academic management</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateCourse} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>
      </div>

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
                <span className="text-sm">{courses.filter(c => c.status === 'approved').length} Approved</span>
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

      {/* Hamburger menu for mobile */}
      <div className="block md:hidden mb-2">
        <select
          className="border rounded p-2 w-full"
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
        >
          <option value="students">Student Approval</option>
          <option value="approved">Approved Students</option>
          <option value="create-student">Create Student (Legacy Firebase)</option>
          <option value="enhanced-create-student">Enhanced Student Creation (Dual)</option>
          <option value="supabase-student">Create Student (Supabase Only)</option>
          <option value="departments">Departments</option>
          <option value="courses">Course Management</option>
          <option value="unit-management">Unit Management</option>
          <option value="units">Unit Allocation</option>
          <option value="exams">Exam Management</option>
          <option value="retakes">Retake Management</option>
          <option value="pending-units">Pending Units</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Desktop tabs */}
        <TabsList className="hidden md:grid w-full grid-cols-12">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Student Approval
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Approved Students
          </TabsTrigger>
          <TabsTrigger value="create-student" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Legacy Firebase
          </TabsTrigger>
          <TabsTrigger value="enhanced-create-student" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <Badge variant="default" className="ml-1 text-xs">Dual</Badge>
          </TabsTrigger>
          <TabsTrigger value="supabase-student" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <Badge variant="default" className="ml-1 text-xs bg-green-600">Supabase</Badge>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
            {pendingCourses > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {pendingCourses}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unit-management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Unit Management
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Unit Allocation
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exam Management
          </TabsTrigger>
          <TabsTrigger value="retakes" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Retake Management
          </TabsTrigger>
          <TabsTrigger value="pending-units" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pending Units
            {pendingUnitsCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {pendingUnitsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <StudentApproval />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ApprovedStudents />
        </TabsContent>

        <TabsContent value="create-student" className="space-y-4">
          <AddStudentForm />
        </TabsContent>

        <TabsContent value="enhanced-create-student" className="space-y-4">
          <EnhancedAddStudentForm />
        </TabsContent>

        <TabsContent value="supabase-student" className="space-y-4">
          <SupabaseStudentForm />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="unit-management" className="space-y-4">
          <UnitManagement />
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <UnitAllocation />
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <ExamManager />
        </TabsContent>

        <TabsContent value="retakes" className="space-y-4">
          <RetakeManager />
        </TabsContent>

        <TabsContent value="pending-units" className="space-y-4">
          <PendingUnitRegistrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const RegistrarDashboard = () => {
  return <RegistrarDashboardContent />;
};
