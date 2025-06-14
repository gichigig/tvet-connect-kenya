
import { useState } from "react";
import { Header } from "@/components/Header";
import { CourseView } from "@/components/CourseView";
import { CourseDetail } from "@/components/CourseDetail";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VirtualClassroom } from "@/components/VirtualClassroom";
import { AdminDashboard } from "@/components/AdminDashboard";
import { coursesData } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";
import { useViewState } from "@/hooks/useViewState";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseActions } from "@/hooks/useCourseActions";

const Index = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    currentView,
    setCurrentView,
    selectedCourse,
    setSelectedCourse,
    selectedLesson,
    setSelectedLesson,
    handleBackToCatalog,
    handleBackToCourse,
    handleBackFromClassroom
  } = useViewState();

  const { userProgress, updateProgress } = useCourseProgress();

  const {
    handleEnrollCourse,
    handlePlayLesson,
    handleCompleteLesson,
    handleJoinClassroom
  } = useCourseActions({
    setSelectedCourse,
    setSelectedLesson,
    setCurrentView,
    selectedCourse,
    selectedLesson,
    userProgress,
    updateProgress
  });

  const filteredCourses = coursesData.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group courses by category for better organization
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, typeof coursesData>);

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
            <CourseView 
              coursesByCategory={coursesByCategory}
              userProgress={userProgress}
              onEnrollCourse={handleEnrollCourse}
            />
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
