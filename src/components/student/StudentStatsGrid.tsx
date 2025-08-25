
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, DollarSign, PenTool, FileText } from "lucide-react";

interface StudentStatsGridProps {
  stats: {
    enrolledUnits: number;
    pendingRegistrations: number;
    upcomingExams: number;
    completedAssignments: number;
    availableNotes?: number;
    feesOwed: number;
  };
}

export const StudentStatsGrid = ({ stats }: StudentStatsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Enrolled Units</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">
          {stats.enrolledUnits}
        </div>
        <p className="text-xs text-muted-foreground">Current semester</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Pending Registrations
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          {stats.pendingRegistrations}
        </div>
        <p className="text-xs text-muted-foreground">Awaiting approval</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Fees Owed</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">
          KSh {stats.feesOwed.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">Outstanding balance</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
        <PenTool className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">
          {stats.upcomingExams}
        </div>
        <p className="text-xs text-muted-foreground">Next 2 weeks</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Completed Assignments
        </CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {stats.completedAssignments}
        </div>
        <p className="text-xs text-muted-foreground">This semester</p>
      </CardContent>
    </Card>
  </div>
);
