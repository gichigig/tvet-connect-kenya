
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Star } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress?: number;
  image: string;
  onEnroll: (courseId: string) => void;
}

export const CourseCard = ({
  id,
  title,
  description,
  instructor,
  duration,
  students,
  rating,
  progress,
  image,
  onEnroll
}: CourseCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video w-full bg-gray-200 rounded-t-lg overflow-hidden">
        <img 
          src={`https://images.unsplash.com/${image}?w=400&h=200&fit=crop`}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          by {instructor}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onEnroll(id)} 
          className="w-full"
          variant={progress !== undefined ? "secondary" : "default"}
        >
          {progress !== undefined ? "Continue Learning" : "Enroll Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};
