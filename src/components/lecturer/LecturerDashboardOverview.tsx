
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Upload, Users, FileText, BookOpen } from "lucide-react";

interface LecturerDashboardOverviewProps {
  onTabChange: (tab: string) => void;
}

export const LecturerDashboardOverview = ({ onTabChange }: LecturerDashboardOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Lecturer Dashboard</CardTitle>
          <CardDescription>Manage your units and course content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p>• Click on any unit to manage its content</p>
            <p>• Add assignments, CATs, exams, and notes</p>
            <p>• Set up WhatsApp groups for communication</p>
            <p>• Schedule online classes</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => onTabChange('units')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Manage My Units
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('assignments')}>
            <Upload className="w-4 h-4 mr-2" />
            Assignment Manager
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('attendance')}>
            <Users className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('notes')}>
            <FileText className="w-4 h-4 mr-2" />
            Notes Manager
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
