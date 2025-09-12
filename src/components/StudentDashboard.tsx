import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Download, FileText, CalendarIcon } from "lucide-react";
import { MyUnits } from "@/components/student/MyUnits";
import { SemesterPlanCalendar } from "@/components/student/SemesterPlanCalendar";
import jsPDF from "jspdf";
import { StudentDashboardTopbar } from "@/components/student/StudentDashboardTopbar";
import { StudentStatsGrid } from "@/components/student/StudentStatsGrid";
import { EnhancedExamCard } from "@/components/student/EnhancedExamCard";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export const StudentDashboard = () => {
  const { user, pendingUnitRegistrations, studentFees, getStudentCard } = useAuth();
  
  // Use dashboard sync hook for real-time semester plan integration
  const { syncedContent, getContentByType } = useDashboardSync('student');

  // Get stats for current user
  const userPendingRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'pending'
  );
  
  const enrolledUnits = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Get synced content counts for dashboard stats
  const syncedAssignments = getContentByType('assignment');
  const syncedNotes = getContentByType('notes');
  const syncedExams = [...getContentByType('exam'), ...getContentByType('cat')];

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
    upcomingExams: syncedExams.length, // Include synced exams from semester plans
    completedAssignments: syncedAssignments.length, // Include synced assignments from semester plans
    availableNotes: syncedNotes.length, // Include synced notes from semester plans
    feesOwed: totalOwed
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Student Dashboard"
        subtitle={`Welcome back, ${user?.firstName || 'Student'}!`}
        notificationCount={userPendingRegistrations.length + syncedExams.length}
        additionalActions={
          feesAreCleared ? (
            <Button onClick={handleDownloadExamCard} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Exam Card</span>
            </Button>
          ) : undefined
        }
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">

      {/* Student Card Status */}
      {feesAreCleared && (
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
                  All fees cleared - You can download your student card
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download Student Card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Exam Card option */}
      <EnhancedExamCard />

      {/* Stats Cards */}
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">My Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-sm text-muted-foreground">Enrolled Units:</span> {stats.enrolledUnits}</div>
          <div><span className="text-sm text-muted-foreground">Pending:</span> {stats.pendingRegistrations}</div>
          <div><span className="text-sm text-muted-foreground">Exams:</span> {stats.upcomingExams}</div>
          <div><span className="text-sm text-muted-foreground">Assignments:</span> {stats.completedAssignments}</div>
        </div>
      </div>

      {/* My Units Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <h2 className="text-xl font-semibold">My Units</h2>
        </div>
        <MyUnits />
      </div>

      {/* Calendar Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Academic Calendar</h2>
        </div>
        <SemesterPlanCalendar />
      </div>
      </div>
    </div>
  );
};