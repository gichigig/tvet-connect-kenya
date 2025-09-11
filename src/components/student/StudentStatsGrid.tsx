import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, CheckCircle, Clock, DollarSign, FileText, Users } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </CardContent>
  </Card>
);

export const StudentStatsGrid = () => {
  // Mock stats data - these would come from actual data in a real implementation
  const stats = [
    {
      title: "Enrolled Units",
      value: 6,
      description: "Units this semester",
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "Pending Assignments",
      value: 3,
      description: "Due this week",
      icon: <FileText className="h-4 w-4 text-orange-600" />,
      color: "bg-orange-100"
    },
    {
      title: "Upcoming Exams",
      value: 2,
      description: "Next 30 days",
      icon: <Calendar className="h-4 w-4 text-red-600" />,
      color: "bg-red-100"
    },
    {
      title: "Completed Tasks",
      value: 12,
      description: "This semester",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: "bg-green-100"
    },
    {
      title: "GPA",
      value: "3.7",
      description: "Current semester",
      icon: <Users className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      title: "Fee Balance",
      value: "$2,450",
      description: "Outstanding amount",
      icon: <DollarSign className="h-4 w-4 text-yellow-600" />,
      color: "bg-yellow-100"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};
