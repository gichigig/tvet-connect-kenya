import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { CourseDetail } from "@/components/CourseDetail";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VirtualClassroom } from "@/components/VirtualClassroom";
import { AdminDashboard } from "@/components/AdminDashboard";
import { coursesData, getUserProgress, Course, Lesson } from "@/data/coursesData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom";

const Index = () => {
  const { isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProgress, setUserProgress] = useState(getUserProgress());
  const { toast } = useToast();

  // Redirect admin to admin dashboard on mount
  useEffect(() => {
    if (isAdmin) {
      setCurrentView("admin");
    }
  }, [isAdmin]);

  const filteredCourses = coursesData.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.level.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleJoinClassroom = () => {
    if (selectedCourse) {
      setCurrentView("classroom");
      toast({
        title: "Joining Virtual Classroom",
        description: `Welcome to ${selectedCourse.title} virtual classroom!`,
      });
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

  const handleBackFromClassroom = () => {
    setCurrentView("course");
  };

  // Group courses by category for better organization
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === "admin" && isAdmin && (
        <>
          <Header onSearch={setSearchQuery} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard />
          </main>
        </>
      )}
      
      {currentView === "catalog" && (
        <>
          <Header onSearch={setSearchQuery} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                TVET Courses in Kenya
              </h2>
              <p className="text-lg text-gray-600">
                Choose from our comprehensive Technical and Vocational Education and Training courses.
              </p>
            </div>
            
            {Object.keys(coursesByCategory).length > 0 ? (
              Object.entries(coursesByCategory).map(([category, courses]) => (
                <div key={category} className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
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
                </div>
              ))
            ) : (
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
          onJoinClassroom={handleJoinClassroom}
        />
      )}
      
      {currentView === "lesson" && selectedLesson && (
        <VideoPlayer
          lesson={selectedLesson}
          onBack={handleBackToCourse}
          onComplete={handleCompleteLesson}
        />
      )}

      {currentView === "classroom" && selectedCourse && (
        <VirtualClassroom
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onBack={handleBackFromClassroom}
        />
      )}
    </div>
  );
};

export default Index;
