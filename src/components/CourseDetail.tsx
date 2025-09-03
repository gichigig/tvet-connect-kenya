import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle,
  Video
} from "lucide-react";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";

interface CourseDetailProps {
  course: Course;
  progress: number;
  onBack: () => void;
  onPlayLesson: (lesson: Lesson) => void;
  onJoinClassroom?: () => void;
}

export const CourseDetail = ({ 
  course, 
  progress, 
  onBack, 
  onPlayLesson,
  onJoinClassroom 
}: CourseDetailProps) => {
  const { user } = useAuth();
  const isLecturerOrAbove = user?.role === 'lecturer' || user?.role === 'hod' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <div className="flex items-center space-x-4">
              {onJoinClassroom && (
                <Button onClick={onJoinClassroom} className="bg-green-600 hover:bg-green-700">
                  <Video className="w-4 h-4 mr-2" />
                  Join Virtual Classroom
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-600">{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-600">{course.students} students</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span className="text-sm text-gray-600">{course.rating}/5</span>
                </div>
                <Badge variant="secondary">{course.level}</Badge>
                <Badge>{course.category}</Badge>
              </div>

              {progress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.duration}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPlayLesson(lesson)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructor Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-semibold text-xl">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{course.instructor}</h3>
                  <p className="text-gray-600 text-sm">Course Instructor</p>
                </div>
              </CardContent>
            </Card>

            {/* Virtual Classroom Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2" />
                  Virtual Classroom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Join live sessions with your instructor and fellow students.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Audio Classes:</span>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Screen Sharing:</span>
                      <Badge variant="secondary">
                        {isLecturerOrAbove ? 'Enabled' : 'View Only'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Hand Raising:</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  </div>
                  {onJoinClassroom && (
                    <Button 
                      onClick={onJoinClassroom} 
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
