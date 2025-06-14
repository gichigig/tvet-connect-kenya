
import { useState } from "react";
import { AppViewRenderer } from "@/components/AppViewRenderer";
import { useAuth } from "@/contexts/AuthContext";
import { useViewState } from "@/hooks/useViewState";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseActions } from "@/hooks/useCourseActions";
import { useCourseFiltering } from "@/hooks/useCourseFiltering";

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
  const { coursesByCategory } = useCourseFiltering(searchQuery);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppViewRenderer
        currentView={currentView}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        coursesByCategory={coursesByCategory}
        userProgress={userProgress}
        selectedCourse={selectedCourse}
        selectedLesson={selectedLesson}
        onEnrollCourse={handleEnrollCourse}
        onBack={handleBackToCatalog}
        onBackToCourse={handleBackToCourse}
        onBackFromClassroom={handleBackFromClassroom}
        onPlayLesson={handlePlayLesson}
        onCompleteLesson={handleCompleteLesson}
        onJoinClassroom={handleJoinClassroom}
      />
    </div>
  );
};

export default Index;
