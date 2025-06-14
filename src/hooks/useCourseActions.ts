
import { coursesData, Course, Lesson } from "@/data/coursesData";
import { useToast } from "@/hooks/use-toast";

interface UseCourseActionsProps {
  setSelectedCourse: (course: Course | null) => void;
  setSelectedLesson: (lesson: Lesson | null) => void;
  setCurrentView: (view: "catalog" | "course" | "lesson" | "admin" | "classroom") => void;
  selectedCourse: Course | null;
  selectedLesson: Lesson | null;
  userProgress: Record<string, number>;
  updateProgress: (courseId: string, newProgress: number) => void;
}

export const useCourseActions = ({
  setSelectedCourse,
  setSelectedLesson,
  setCurrentView,
  selectedCourse,
  selectedLesson,
  userProgress,
  updateProgress
}: UseCourseActionsProps) => {
  const { toast } = useToast();

  const handleEnrollCourse = (courseId: string) => {
    const course = coursesData.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setCurrentView("course");
      
      // If user has progress, show continue message, else show enrollment
      if (userProgress[courseId] > 0) {
        toast({
          title: "Welcome back!",
          description: `Continue your progress in ${course.title}`,
        });
      } else {
        toast({
          title: "Enrolled successfully!",
          description: `You're now enrolled in ${course.title}`,
        });
      }
    }
  };

  const handlePlayLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView("lesson");
  };

  const handleCompleteLesson = () => {
    if (selectedCourse && selectedLesson) {
      // Update lesson completion status
      const updatedCourse = {
        ...selectedCourse,
        lessons: selectedCourse.lessons.map(lesson =>
          lesson.id === selectedLesson.id ? { ...lesson, completed: true } : lesson
        )
      };
      
      setSelectedCourse(updatedCourse);
      
      // Calculate new progress
      const completedLessons = updatedCourse.lessons.filter(l => l.completed).length;
      const newProgress = Math.round((completedLessons / updatedCourse.lessons.length) * 100);
      
      updateProgress(selectedCourse.id, newProgress);
      
      toast({
        title: "Lesson completed!",
        description: `Great job! Your progress: ${newProgress}%`,
      });
      
      setCurrentView("course");
    }
  };

  const handleJoinClassroom = () => {
    if (selectedCourse) {
      setCurrentView("classroom");
      toast({
        title: "Joining Virtual Classroom",
        description: `Welcome to ${selectedCourse.title} virtual classroom!`,
      });
    }
  };

  return {
    handleEnrollCourse,
    handlePlayLesson,
    handleCompleteLesson,
    handleJoinClassroom
  };
};
