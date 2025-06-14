
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Upload, Users, FileText } from "lucide-react";

interface LecturerDashboardOverviewProps {
  onTabChange: (tab: string) => void;
}

export const LecturerDashboardOverview = ({ onTabChange }: LecturerDashboardOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest course activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Assignment submitted - Math 101</span>
            <Badge variant="secondary">2 hours ago</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Attendance taken - Physics Lab</span>
            <Badge variant="secondary">1 day ago</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notes uploaded - Chemistry</span>
            <Badge variant="secondary">2 days ago</Badge>
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
            <Settings className="w-4 h-4 mr-2" />
            Manage Units
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('assignments')}>
            <Upload className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('attendance')}>
            <Users className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('notes')}>
            <FileText className="w-4 h-4 mr-2" />
            Upload Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
