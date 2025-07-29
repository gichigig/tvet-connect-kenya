import { useState, useEffect } from "react";
import { AppViewRenderer } from "@/components/AppViewRenderer";
import { useAuth } from "@/contexts/AuthContext";
import { useViewState } from "@/hooks/useViewState";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseActions } from "@/hooks/useCourseActions";
import { useCourseFiltering } from "@/hooks/useCourseFiltering";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";
import { testFirebaseConnection } from "@/utils/firebaseTest";

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

  // Firebase Realtime Database setup
  const db = getDatabase(firebaseApp);

  useEffect(() => {
    // Test Firebase connection on app start
    testFirebaseConnection();
    
    // Test registrar login functionality
    
    // Debug user state
    console.log('=== INDEX PAGE USER DEBUG ===');
    console.log('isAdmin:', isAdmin);
    console.log('Current view should be determined by useViewState hook');

    const coursesRef = ref(db, 'courses/');
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Live course data: ", data);
      // Handle live data updates here
    });

    const progressRef = ref(db, 'userProgress/');
    onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Live progress data: ", data);
      // Handle live data updates here
    });
  }, [db, isAdmin]);

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
