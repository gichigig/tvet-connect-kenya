import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, GraduationCap } from "lucide-react";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";

export const AvailableCourses = () => {
  const { courses } = useCoursesContext();

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'certificate': return 'bg-green-100 text-green-800';
      case 'diploma': return 'bg-blue-100 text-blue-800';
      case 'degree': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'certificate': return <BookOpen className="h-4 w-4" />;
      case 'diploma': return <GraduationCap className="h-4 w-4" />;
      case 'degree': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Available Courses</h2>
        <p className="text-gray-600">Browse all courses offered by the institution</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </div>
                <Badge className={getLevelColor(course.level)}>
                  <div className="flex items-center gap-1">
                    {getLevelIcon(course.level)}
                    {course.level}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{course.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Department: {course.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {course.duration} months</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>Credits: {course.credits}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-600">Check back later for available courses.</p>
        </div>
      )}
    </div>
  );
};
