
import { useState, useEffect } from "react";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom" | "lecturer" | "registrar" | "hod" | "student" | "finance";

export const useViewState = () => {
  const { isAdmin, user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Redirect users to their respective dashboards on mount
  useEffect(() => {
    console.log("useViewState - user:", user);
    console.log("useViewState - isAdmin:", isAdmin);
    console.log("useViewState - user role:", user?.role);
    
    if (isAdmin) {
      console.log("Setting view to admin");
      setCurrentView("admin");
    } else if (user?.role === "finance") {
      console.log("Setting view to finance");
      setCurrentView("finance");
    } else if (user?.role === "hod") {
      console.log("Setting view to hod");
      setCurrentView("hod");
    } else if (user?.role === "lecturer") {
      console.log("Setting view to lecturer");
      setCurrentView("lecturer");
    } else if (user?.role === "registrar") {
      console.log("Setting view to registrar");
      setCurrentView("registrar");
    } else if (user?.role === "student") {
      console.log("Setting view to student");
      setCurrentView("student");
    } else {
      console.log("Setting view to catalog");
      setCurrentView("catalog");
    }
  }, [isAdmin, user]);

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
