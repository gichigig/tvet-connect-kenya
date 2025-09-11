import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Clock } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  department: string;
  level: string;
  credits?: number;
  duration?: string;
  units?: any[];
}

interface CourseDetailProps {
  course: Course;
  progress?: number;
  onBack: () => void;
  onPlayLesson?: (lesson: any) => void;
  onJoinClassroom?: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{course.name}</CardTitle>
              <CardDescription className="text-lg mt-2">{course.department}</CardDescription>
            </div>
            <Badge variant="secondary">{course.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{course.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Credits</p>
                <p className="text-sm text-gray-600">{course.credits || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-gray-600">{course.duration || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Units</p>
                <p className="text-sm text-gray-600">{course.units?.length || 0} units</p>
              </div>
            </div>
          </div>

          {course.units && course.units.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Course Units</h3>
              <div className="grid gap-2">
                {course.units.map((unit, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{unit.name || `Unit ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{unit.code || 'No code'}</p>
                    </div>
                    <Badge variant="outline">{unit.credits || 'N/A'} credits</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
