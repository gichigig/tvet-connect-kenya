
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, GraduationCap, FileText, Clock, BookOpen, Users, Settings } from "lucide-react";
import { StudentApproval } from "@/components/registrar/StudentApproval";
import { UnitAllocation } from "@/components/registrar/UnitAllocation";
import { ExamManager } from "@/components/registrar/ExamManager";
import { RetakeManager } from "@/components/registrar/RetakeManager";
import { ApprovedStudents } from "@/components/registrar/ApprovedStudents";
import { PendingUnitRegistrations } from "@/components/registrar/PendingUnitRegistrations";
import { UnitManagement } from "@/components/registrar/UnitManagement";

export const RegistrarDashboard = () => {
  const { user, getPendingUsers, getAllUsers, getPendingUnitRegistrations } = useAuth();
  const [activeTab, setActiveTab] = useState("students");

  const pendingUsers = getPendingUsers();
  const allUsers = getAllUsers();
  const pendingStudents = pendingUsers.filter(u => u.role === 'student');
  const totalStudents = allUsers.filter(u => u.role === 'student' && u.approved);
  const pendingUnitRegistrations = getPendingUnitRegistrations();

  // Mock data for dashboard stats
  const stats = {
    pendingStudents: pendingStudents.length,
    totalStudents: totalStudents.length,
    pendingUnits: pendingUnitRegistrations.length,
    retakeRequests: 12
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Student Approval
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Approved Students
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
