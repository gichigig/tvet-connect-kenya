
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, FileText, Clock, PenTool, GraduationCap, Menu, MessageCircle } from "lucide-react";
import { UnitRegistration } from "@/components/student/UnitRegistration";
import { OnlineClasses } from "@/components/student/OnlineClasses";
import { NotesAccess } from "@/components/student/NotesAccess";
import { ExamsQuizzes } from "@/components/student/ExamsQuizzes";
import { MyUnits } from "@/components/student/MyUnits";
import { DiscussionGroups } from "@/components/student/DiscussionGroups";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("units");

  // Updated stats to reflect empty state for new students
  const stats = {
    enrolledUnits: 0, // No units until registered and approved
    pendingRegistrations: 0, // Will be updated based on actual registrations
    upcomingExams: 0, // No exams until units are enrolled
    completedAssignments: 0 // No assignments until units are enrolled
  };

  const menuItems = [
    { id: "units", label: "My Units", icon: BookOpen },
    { id: "register", label: "Unit Registration", icon: GraduationCap },
    { id: "classes", label: "Online Classes", icon: Video },
    { id: "notes", label: "Notes & Materials", icon: FileText },
    { id: "exams", label: "Exams & Quizzes", icon: PenTool },
    { id: "discussions", label: "Discussion Groups", icon: MessageCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}!
          </p>
          {user?.admissionNumber && (
            <p className="text-sm text-blue-600 font-medium mt-1">
              Admission Number: {user.admissionNumber}
            </p>
          )}
        </div>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Student Menu</SheetTitle>
                <SheetDescription>
                  Navigate through your student portal
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.enrolledUnits}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.upcomingExams}</div>
            <p className="text-xs text-muted-foreground">
              Next 2 weeks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden md:grid w-full grid-cols-6">
          {menuItems.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <MyUnits />
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <UnitRegistration />
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <OnlineClasses />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <NotesAccess />
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <ExamsQuizzes />
        </TabsContent>

        <TabsContent value="discussions" className="space-y-4">
          <DiscussionGroups />
        </TabsContent>
      </Tabs>
    </div>
  );
};
