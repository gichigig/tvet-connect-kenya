
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, Users, Star, ArrowLeft } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
}

interface CourseDetailProps {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    students: number;
    rating: number;
    image: string;
    lessons: Lesson[];
  };
  progress: number;
  onBack: () => void;
  onPlayLesson: (lesson: Lesson) => void;
}

export const CourseDetail = ({ course, progress, onBack, onPlayLesson }: CourseDetailProps) => {
  const completedLessons = course.lessons.filter(lesson => lesson.completed).length;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden mb-6">
            <img 
              src={`https://images.unsplash.com/${course.image}?w=800&h=400&fit=crop`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onPlayLesson(lesson)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        lesson.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {lesson.completed ? '✓' : index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{completedLessons}/{course.lessons.length} lessons</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-gray-600">{progress}% complete</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{course.instructor}</h4>
                  <p className="text-sm text-gray-500">Course Instructor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
