import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, FileText, Calendar, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600 mt-1">{description}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            {trend.value}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const LecturerDashboardStats = () => {
  const { user } = useAuth();
  const { getLecturerUnits } = useUnits();
  
  const assignedUnits = getLecturerUnits(user?.id || '');
  const totalStudents = assignedUnits.reduce((total, unit) => total + unit.enrolled, 0);

  const stats = [
    {
      title: "Assigned Units",
      value: assignedUnits.length,
      description: "Units you're teaching",
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100",
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Total Students",
      value: totalStudents,
      description: "Across all units",
      icon: <Users className="h-4 w-4 text-green-600" />,
      color: "bg-green-100",
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Pending Assignments",
      value: 5,
      description: "Need grading",
      icon: <FileText className="h-4 w-4 text-orange-600" />,
      color: "bg-orange-100",
      trend: { value: 3, isPositive: false }
    },
    {
      title: "This Week's Classes",
      value: 12,
      description: "Scheduled lectures",
      icon: <Calendar className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      title: "Average Attendance",
      value: "87%",
      description: "Last 30 days",
      icon: <Clock className="h-4 w-4 text-indigo-600" />,
      color: "bg-indigo-100",
      trend: { value: 5, isPositive: true }
    },
    {
      title: "Course Rating",
      value: "4.2",
      description: "Student feedback",
      icon: <TrendingUp className="h-4 w-4 text-pink-600" />,
      color: "bg-pink-100",
      trend: { value: 7, isPositive: true }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Your teaching statistics and quick insights</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Units</CardTitle>
            <CardDescription>Currently assigned units for this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedUnits.slice(0, 4).map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{unit.name}</h4>
                    <p className="text-sm text-gray-600">{unit.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {unit.enrolled}/{unit.capacity}
                    </Badge>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New assignment submission</p>
                  <p className="text-xs text-gray-600">CP101 - Programming Assignment 1</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Class attendance updated</p>
                  <p className="text-xs text-gray-600">CP201 - Database Systems</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Grade deadline approaching</p>
                  <p className="text-xs text-gray-600">CP101 - Mid-term exam grades due</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
