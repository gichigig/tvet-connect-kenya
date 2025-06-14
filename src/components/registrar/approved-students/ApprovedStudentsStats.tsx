
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";

interface ApprovedStudentsStatsProps {
  totalApproved: number;
  totalCourses: number;
}

export const ApprovedStudentsStats = ({ totalApproved, totalCourses }: ApprovedStudentsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-blue-600">{totalApproved}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-green-600">{totalCourses}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready for Units</p>
              <p className="text-2xl font-bold text-purple-600">{totalApproved}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
