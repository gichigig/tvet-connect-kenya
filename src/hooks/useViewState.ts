
import { useState, useEffect } from "react";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom";

export const useViewState = () => {
  const { isAdmin, user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Redirect admin to admin dashboard on mount
  useEffect(() => {
    console.log("useViewState - user:", user);
    console.log("useViewState - isAdmin:", isAdmin);
    console.log("useViewState - user role:", user?.role);
    
    if (isAdmin) {
      console.log("Setting view to admin");
      setCurrentView("admin");
    } else {
      console.log("Not admin, setting view to catalog");
      setCurrentView("catalog");
    }
  }, [isAdmin, user]);

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

  return {
    currentView,
    setCurrentView,
    selectedCourse,
    setSelectedCourse,
    selectedLesson,
    setSelectedLesson,
    handleBackToCatalog,
    handleBackToCourse,
    handleBackFromClassroom
  };
};
