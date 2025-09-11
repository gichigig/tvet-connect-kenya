import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Course {
  id: string;
  name: string;
  description: string;
  department: string;
  level: string;
}

interface CourseViewProps {
  courses: Course[];
  onCourseSelect?: (course: Course) => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ courses, onCourseSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card 
          key={course.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCourseSelect?.(course)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription>{course.department}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>
            <p className="text-xs text-gray-500">Level: {course.level}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
