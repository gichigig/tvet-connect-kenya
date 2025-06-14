
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileCheck, Users, AlertTriangle, TrendingUp, UserCheck, DollarSign, BookOpen, FlaskConical, Building2, Mail, Send } from "lucide-react";
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

export const HodDashboard = () => {
  const { user, examResults } = useAuth();
  const [activeTab, setActiveTab] = useState("results");

  // Mock data for dashboard stats
  const stats = {
    pendingApprovals: 12,
    totalStudents: 340,
    failedStudents: 8,
    deferredExams: 5,
    staffMembers: 15,
    budgetUtilization: 78,
    activeCourses: 24,
    researchProjects: 6,
    unreadEmails: 4,
    pendingNotifications: examResults.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
          <p className="text-gray-600">Department of {user?.department || "Computer Science"}</p>
          <p className="text-sm text-gray-500">Comprehensive departmental management and oversight</p>
        </div>
        <GraduationCap className="w-8 h-8 text-purple-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Results awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.staffMembers}</div>
            <p className="text-xs text-muted-foreground">Department faculty</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.budgetUtilization}%</div>
            <p className="text-xs text-muted-foreground">Annual budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results to Send</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingNotifications}</div>
            <p className="text-xs text-muted-foreground">Ready for notification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unreadEmails}</div>
            <p className="text-xs text-muted-foreground">Attachments & internships</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="results" className="flex items-center gap-1 text-xs">
            <FileCheck className="w-3 h-3" />
            Results
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
            <Send className="w-3 h-3" />
            Send Results
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            Students
          </TabsTrigger>
          <TabsTrigger value="retakes" className="flex items-center gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Retakes
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-1 text-xs">
            <UserCheck className="w-3 h-3" />
            Staff
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
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <ResultsApproval />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <ResultsNotification />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentResults />
        </TabsContent>

        <TabsContent value="retakes" className="space-y-4">
          <RetakeRecommendations />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <StaffManagement />
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
      </Tabs>
    </div>
  );
};
