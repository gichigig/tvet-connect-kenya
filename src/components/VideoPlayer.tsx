
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  lesson: {
    id: string;
    title: string;
    duration: string;
    videoUrl?: string;
  };
  onBack: () => void;
  onComplete: () => void;
}

export const VideoPlayer = ({ lesson, onBack, onComplete }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Course
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="rounded-full w-16 h-16"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm opacity-75">Duration: {lesson.duration}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600">Learn the fundamentals in this comprehensive lesson.</p>
            </div>
            <Button onClick={onComplete}>
              Mark as Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
