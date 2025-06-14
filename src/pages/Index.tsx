
import { useState } from "react";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { CourseDetail } from "@/components/CourseDetail";
import { VideoPlayer } from "@/components/VideoPlayer";
import { coursesData, getUserProgress, Course, Lesson } from "@/data/coursesData";
import { useToast } from "@/hooks/use-toast";

type ViewState = "catalog" | "course" | "lesson";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProgress, setUserProgress] = useState(getUserProgress());
  const { toast } = useToast();

  const filteredCourses = coursesData.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      
      setUserProgress(prev => ({
        ...prev,
        [selectedCourse.id]: newProgress
      }));
      
      toast({
        title: "Lesson completed!",
        description: `Great job! Your progress: ${newProgress}%`,
      });
      
      setCurrentView("course");
    }
  };

  const handleBackToCatalog = () => {
    setCurrentView("catalog");
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const handleBackToCourse = () => {
    setCurrentView("course");
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === "catalog" && (
        <>
          <Header onSearch={setSearchQuery} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Your Next Skill
              </h2>
              <p className="text-lg text-gray-600">
                Choose from our expert-crafted courses and start learning today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  instructor={course.instructor}
                  duration={course.duration}
                  students={course.students}
                  rating={course.rating}
                  progress={userProgress[course.id]}
                  image={course.image}
                  onEnroll={handleEnrollCourse}
                />
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No courses found matching your search.
                </p>
              </div>
            )}
          </main>
        </>
      )}
      
      {currentView === "course" && selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          progress={userProgress[selectedCourse.id] || 0}
          onBack={handleBackToCatalog}
          onPlayLesson={handlePlayLesson}
        />
      )}
      
      {currentView === "lesson" && selectedLesson && (
        <VideoPlayer
          lesson={selectedLesson}
          onBack={handleBackToCourse}
          onComplete={handleCompleteLesson}
        />
      )}
    </div>
  );
};

export default Index;
