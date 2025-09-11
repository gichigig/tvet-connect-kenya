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
  courses?: Course[];
  coursesByCategory?: Record<string, Course[]>;
  userProgress?: Record<string, number>;
  onCourseSelect?: (course: Course) => void;
  onEnrollCourse?: (courseId: string) => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ 
  courses, 
  coursesByCategory, 
  userProgress, 
  onCourseSelect, 
  onEnrollCourse 
}) => {
  // Use courses if provided, otherwise flatten coursesByCategory
  const coursesList = courses || (coursesByCategory ? 
    Object.values(coursesByCategory).flat() : []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coursesList.map((course) => (
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
            {userProgress && userProgress[course.id] && (
              <div className="mt-2">
                <div className="text-xs text-gray-500">Progress: {userProgress[course.id]}%</div>
              </div>
            )}
            {onEnrollCourse && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEnrollCourse(course.id);
                }}
                className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Enroll
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
