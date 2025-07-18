import { useState } from "react";
import { coursesData } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { saveAdminToFirebase } from "@/integrations/firebase/admin";
import { UserCheck, GraduationCap, FileText, Clock, BookOpen, Users, Settings } from "lucide-react";
import { StudentApproval } from "@/components/registrar/StudentApproval";
import { UnitAllocation } from "@/components/registrar/UnitAllocation";
import { ExamManager } from "@/components/registrar/ExamManager";
import { RetakeManager } from "@/components/registrar/RetakeManager";
import { ApprovedStudents } from "@/components/registrar/ApprovedStudents";
import { PendingUnitRegistrations } from "@/components/registrar/PendingUnitRegistrations";
import { UnitManagement } from "@/components/registrar/UnitManagement";
import { allUndergraduateCourses, allDiplomaCourses, allCertificateCourses } from "@/data/zetechCourses";

export const RegistrarDashboard = () => {
  const { user, getPendingUsers, getAllUsers, getPendingUnitRegistrations, setUsers, users } = useAuth();
  const [activeTab, setActiveTab] = useState("students");
  const { toast } = useToast();

  // Student creation form state
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentLevel, setStudentLevel] = useState("");
  const [studentAdmission, setStudentAdmission] = useState("");
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const pendingUsers = getPendingUsers();
  const allUsers = getAllUsers();
  const pendingStudents = pendingUsers.filter(u => u.role === 'student');
  const totalStudents = allUsers.filter(u => u.role === 'student' && u.approved);
  const pendingUnitRegistrations = getPendingUnitRegistrations();

  // Filter courses by selected level
  let filteredCourses: string[] = [];
  if (selectedLevel === "Degree") filteredCourses = allUndergraduateCourses;
  else if (selectedLevel === "Diploma") filteredCourses = allDiplomaCourses;
  else if (selectedLevel === "Certificate") filteredCourses = allCertificateCourses;
  else filteredCourses = [];

  // Mock data for dashboard stats
  const stats = {
    pendingStudents: pendingStudents.length,
    totalStudents: totalStudents.length,
    pendingUnits: pendingUnitRegistrations.length,
    retakeRequests: 12
  };

  // Student creation handler
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingStudent(true);
    if (users.some(u => u.email === studentEmail)) {
      toast({ title: "Email Exists", description: "A user with this email already exists.", variant: "destructive" });
      setIsCreatingStudent(false);
      return;
    }
    try {
      await saveAdminToFirebase({
        email: studentEmail,
        firstName: studentFirstName,
        lastName: studentLastName,
        password: studentPassword,
        role: "student",
        course: studentCourse,
        level: studentLevel,
        admissionNumber: studentAdmission
      });
      setUsers(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          email: studentEmail,
          firstName: studentFirstName,
          lastName: studentLastName,
          role: "student",
          course: studentCourse,
          level: studentLevel,
          admissionNumber: studentAdmission,
          approved: true,
          blocked: false,
          password: studentPassword
        }
      ]);
      toast({ title: "Student Created", description: `Student ${studentEmail} created and saved to Firebase.` });
      setStudentFirstName("");
      setStudentLastName("");
      setStudentEmail("");
      setStudentPassword("");
      setStudentCourse("");
      setStudentLevel("");
      setStudentAdmission("");
      setActiveTab("students");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save student to Firebase.", variant: "destructive" });
    }
    setIsCreatingStudent(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard</h1>
          <p className="text-gray-600">Student registration and academic management</p>
        </div>
        <GraduationCap className="w-8 h-8 text-blue-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingStudents}</div>
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
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active enrolled students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Units</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingUnits}</div>
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
            <div className="text-2xl font-bold text-red-600">{stats.retakeRequests}</div>
            <p className="text-xs text-muted-foreground">
              Unit retake applications
            </p>
          </CardContent>
        </Card>
      </div>

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
          <option value="create-student">Create Student</option>
          <option value="unit-management">Unit Management</option>
          <option value="units">Unit Allocation</option>
          <option value="exams">Exam Management</option>
          <option value="retakes">Retake Management</option>
          <option value="pending-units">Pending Units</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden md:grid w-full grid-cols-8">
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
            Create Student
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
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <StudentApproval />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ApprovedStudents />
        </TabsContent>

        <TabsContent value="create-student" className="space-y-4">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Create New Student</CardTitle>
              <CardDescription>Fill in details to create a new student. The password can be changed later by the student.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="border p-2 rounded w-full sm:w-1/2"
                    type="text"
                    placeholder="First Name"
                    value={studentFirstName}
                    onChange={e => setStudentFirstName(e.target.value)}
                    required
                  />
                  <input
                    className="border p-2 rounded w-full sm:w-1/2"
                    type="text"
                    placeholder="Last Name"
                    value={studentLastName}
                    onChange={e => setStudentLastName(e.target.value)}
                    required
                  />
                </div>
                <input
                  className="border p-2 rounded w-full"
                  type="email"
                  placeholder="Email"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  required
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="border p-2 rounded w-full sm:w-1/2"
                    type="password"
                    placeholder="Password"
                    value={studentPassword}
                    onChange={e => setStudentPassword(e.target.value)}
                    required
                  />
                  <input
                    className="border p-2 rounded w-full sm:w-1/2"
                    type="text"
                    placeholder="Admission Number"
                    value={studentAdmission}
                    onChange={e => setStudentAdmission(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="border p-2 rounded w-full sm:w-1/2"
                    value={studentLevel}
                    onChange={e => {
                      setStudentLevel(e.target.value);
                      setSelectedLevel(e.target.value);
                      setStudentCourse(""); // Reset course when level changes
                    }}
                    required
                  >
                    <option value="" disabled>Select Level</option>
                    <option value="Degree">Degree</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                  <select
                    className="border p-2 rounded w-full sm:w-1/2"
                    value={studentCourse}
                    onChange={e => setStudentCourse(e.target.value)}
                    required
                    disabled={!studentLevel}
                  >
                    <option value="" disabled>{studentLevel ? "Select Course" : "Select Level First"}</option>
                    {filteredCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isCreatingStudent}>
                  {isCreatingStudent ? "Creating..." : "Create Student"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
