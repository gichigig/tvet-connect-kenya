import { useState, useEffect } from "react";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom" | "lecturer" | "registrar" | "hod" | "student" | "finance";

export const useViewState = () => {
  const { isAdmin, user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [viewInitialized, setViewInitialized] = useState(false);

  // Redirect users to their respective dashboards on mount
  useEffect(() => {
    console.log("=== USEVIEWSTATE DEBUG ===");
    console.log("useViewState - loading:", loading);
    console.log("useViewState - user:", user);
    console.log("useViewState - isAdmin:", isAdmin);
    console.log("useViewState - user role:", user?.role);
    console.log("useViewState - currentView before change:", currentView);
    console.log("useViewState - viewInitialized:", viewInitialized);
    
    // Don't set view while authentication is still loading
    if (loading) {
      console.log("Auth still loading, waiting...");
      return;
    }
    
    if (!user) {
      console.log("No user, staying on current view");
      setViewInitialized(true);
      return;
    }

    // Only initialize view once after authentication is complete
    if (viewInitialized) {
      console.log("View already initialized, skipping...");
      return;
    }

    // Check user role first, then admin status
    let newView: ViewState = "catalog";
    
    if (user.role === "finance") {
      console.log("Setting view to finance");
      newView = "finance";
    } else if (user.role === "hod") {
      console.log("Setting view to hod");
      newView = "hod";
    } else if (user.role === "lecturer") {
      console.log("Setting view to lecturer");
      newView = "lecturer";
    } else if (user.role === "registrar") {
      console.log("Setting view to registrar");
      newView = "registrar";
    } else if (user.role === "student") {
      console.log("Setting view to student");
      newView = "student";
    } else if (isAdmin) {
      console.log("Setting view to admin");
      newView = "admin";
    } else {
      console.log("Setting view to catalog for authenticated user");
      newView = "catalog";
    }
    
    setCurrentView(newView);
    setViewInitialized(true);
    console.log("useViewState - new view set to:", newView);
  }, [user, isAdmin, loading, viewInitialized]); // Added loading and viewInitialized to dependencies

  const handleBackToCatalog = () => {
    if (user?.role === "finance") {
      setCurrentView("finance");
    } else if (user?.role === "hod") {
      setCurrentView("hod");
    } else if (user?.role === "lecturer") {
      setCurrentView("lecturer");
    } else if (user?.role === "registrar") {
      setCurrentView("registrar");
    } else if (user?.role === "student") {
      setCurrentView("student");
    } else {
      setCurrentView("catalog");
    }
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
