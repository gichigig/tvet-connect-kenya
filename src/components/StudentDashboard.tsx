import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, FileText, Clock, PenTool, GraduationCap, Menu, MessageCircle, DollarSign, Download, FlaskConical, Calendar } from "lucide-react";
import { UnitRegistration } from "@/components/student/UnitRegistration";
import { OnlineClasses } from "@/components/student/OnlineClasses";
import { NotesAccess } from "@/components/student/NotesAccess";
import { ExamsQuizzes } from "@/components/student/ExamsQuizzes";
import { MyUnits } from "@/components/student/MyUnits";
import { DiscussionGroups } from "@/components/student/DiscussionGroups";
import { StudentFees } from "@/components/student/StudentFees";
import { AttendancePortal } from "@/components/student/AttendancePortal";
import VirtualLabs from "@/components/student/VirtualLabs";
import CalendarReminders from "@/components/student/CalendarReminders";
import jsPDF from "jspdf";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StudentDashboardTopbar } from "@/components/student/StudentDashboardTopbar";
import { StudentMobileMenu } from "@/components/student/StudentMobileMenu";
import { StudentStatsGrid } from "@/components/student/StudentStatsGrid";
import { ExamCardDownloadButton } from "@/components/student/ExamCardDownloadButton";

export const StudentDashboard = () => {
  const { user, pendingUnitRegistrations, studentFees, getStudentCard } = useAuth();
  const [activeTab, setActiveTab] = useState("units");

  // Get stats for current user
  const userPendingRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'pending'
  );
  
  const enrolledUnits = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  const myFees = studentFees.filter(fee => fee.studentId === user?.id);
  const totalOwed = myFees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  // --- Exam Card clearance check ---
  const studentCard = getStudentCard(user?.id || '');
  const feesAreCleared =
    myFees.length > 0 &&
    myFees.every(f => f.status === 'paid') &&
    totalOwed === 0;

  // Exam card download handler
  const handleDownloadExamCard = () => {
    if (!user) return;
    // Generate a serial number: EXM-[admission]-[yy][mm][dd]-[timestamp]
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${now.getFullYear().toString().substr(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const serial =
      `EXM-${user.admissionNumber || "UNKNOWN"}-${datePart}-${now.getTime().toString().slice(-5)}`;

    // Prepare units list for PDF
    const enrolledUnitList = enrolledUnits
      .map(
        (reg, idx) =>
          `${idx + 1}. ${reg.unitCode || "-"} - ${reg.unitName || "-"}`
      )
      .join("\n");

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("EXAMINATION CARD", 20, 30);

    doc.setFontSize(12);
    doc.text(`Serial No: ${serial}`, 150, 20);
    doc.setFontSize(14);

    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 45);
    doc.text(`Admission Number: ${user.admissionNumber || "-"}`, 20, 55);

    // Updated this line to use user.year, fallback to "-" if missing
    doc.text(`Year of Study: ${user.year != null ? user.year : "-"}`, 20, 65);

    doc.text(`Course: ${user.course || "-"}`, 20, 75);

    doc.text("Units Registered:", 20, 85);
    doc.setFontSize(12);
    doc.text(enrolledUnitList || "No units found.", 25, 93);

    doc.setFontSize(14);
    doc.text("Status: CLEARED", 20, 120);

    doc.setFontSize(11);
    doc.text(
      "This card allows you to sit for all listed examinations for this semester. Carry this card for every exam.",
      20,
      130,
      { maxWidth: 170 }
    );
    doc.save(`ExamCard_${user.firstName}_${user.lastName}.pdf`);
  };

  const stats = {
    enrolledUnits: enrolledUnits.length,
    pendingRegistrations: userPendingRegistrations.length,
    upcomingExams: 0, // No exams until units are enrolled
    completedAssignments: 0, // No assignments until units are enrolled
    feesOwed: totalOwed
  };

  const menuItems = [
    { id: "units", label: "My Units", icon: BookOpen },
    { id: "register", label: "Unit Registration", icon: GraduationCap },
    { id: "fees", label: "My Fees", icon: DollarSign },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "labs", label: "Virtual Labs", icon: FlaskConical },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "classes", label: "Online Classes", icon: Video },
    { id: "notes", label: "Notes & Materials", icon: FileText },
    { id: "exams", label: "Exams & Quizzes", icon: PenTool },
    { id: "discussions", label: "Discussion Groups", icon: MessageCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StudentDashboardTopbar user={user} />
        {/* Mobile Menu */}
        <StudentMobileMenu menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Student Card Status */}
      {studentCard?.isActive && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <GraduationCap className="w-5 h-5" />
              Student Card Available
            </CardTitle>
            <CardDescription className="text-green-700">
              Your student card has been activated by the finance department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">
                  {feesAreCleared 
                    ? "All fees cleared - You can download your student card" 
                    : `Outstanding balance: KSh ${totalOwed.toLocaleString()} - Please clear your fees to download your card`
                  }
                </p>
              </div>
              <Button
                disabled={!feesAreCleared}
                className={feesAreCleared ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Student Card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Exam Card option */}
      <ExamCardDownloadButton
        user={user}
        enrolledUnits={enrolledUnits}
        myFees={myFees}
        totalOwed={totalOwed}
      />

      {/* Stats Cards */}
      <StudentStatsGrid stats={stats} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden md:grid w-full grid-cols-10">
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

        <TabsContent value="fees" className="space-y-4">
          <StudentFees />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarReminders />
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <VirtualLabs />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendancePortal />
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
