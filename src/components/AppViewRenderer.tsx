import Header from "@/components/Header";
import { CourseView } from "@/components/CourseView";
import { CourseDetail } from "@/components/CourseDetail";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VirtualClassroom } from "@/components/VirtualClassroom";
import AdminDashboard from "@/components/AdminDashboard";
import { LecturerDashboard } from "@/components/LecturerDashboard";
import { RegistrarDashboard } from "@/components/RegistrarDashboard";
import { HodDashboard } from "@/components/HodDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { FinanceDashboard } from "@/components/FinanceDashboard";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom" | "lecturer" | "registrar" | "hod" | "student" | "finance";

interface AppViewRendererProps {
  currentView: ViewState;
  searchQuery: string;
  onSearch: (query: string) => void;
  coursesByCategory: Record<string, Course[]>;
  userProgress: Record<string, number>;
  selectedCourse: Course | null;
  selectedLesson: Lesson | null;
  onEnrollCourse: (courseId: string) => void;
  onBack: () => void;
  onBackToCourse: () => void;
  onBackFromClassroom: () => void;
  onPlayLesson: (lesson: Lesson) => void;
  onCompleteLesson: () => void;
  onJoinClassroom: () => void;
}

export const AppViewRenderer = ({
  currentView,
  searchQuery,
  onSearch,
  coursesByCategory,
  userProgress,
  selectedCourse,
  selectedLesson,
  onEnrollCourse,
  onBack,
  onBackToCourse,
  onBackFromClassroom,
  onPlayLesson,
  onCompleteLesson,
  onJoinClassroom
}: AppViewRendererProps) => {
  const { user } = useAuth();

  // Firebase: Listen for courses data from Realtime Database
  const [firebaseCourses, setFirebaseCourses] = useState<Record<string, Course>>({});

  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const coursesRef = ref(db, "courses/");
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      setFirebaseCourses(data || {});
    });
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (currentView === "admin" && user?.role === "admin") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <AdminDashboard />
        </main>
      </>
    );
  }

  if (currentView === "finance" && user?.role === "finance") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <FinanceDashboard />
        </main>
      </>
    );
  }

  if (currentView === "hod" && user?.role === "hod") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <HodDashboard />
        </main>
      </>
    );
  }

  if (currentView === "lecturer" && user?.role === "lecturer") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <LecturerDashboard />
        </main>
      </>
    );
  }

  if (currentView === "registrar" && user?.role === "registrar") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <RegistrarDashboard />
        </main>
      </>
    );
  }

  if (currentView === "student" && user?.role === "student") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mx-auto">
          <StudentDashboard />
        </main>
      </>
    );
  }

  if (currentView === "catalog") {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseView 
            coursesByCategory={Object.fromEntries(
              Object.entries(firebaseCourses).map(([key, course]) => [key, [course]])
            )}
            userProgress={userProgress}
            onEnrollCourse={onEnrollCourse}
          />
        </main>
      </>
    );
  }

  if (currentView === "course" && selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        progress={userProgress[selectedCourse.id] || 0}
        onBack={onBack}
        onPlayLesson={onPlayLesson}
        onJoinClassroom={onJoinClassroom}
      />
    );
  }

  if (currentView === "lesson" && selectedLesson) {
    return (
      <VideoPlayer
        lesson={selectedLesson}
        onBack={onBackToCourse}
        onComplete={onCompleteLesson}
      />
    );
  }

  if (currentView === "classroom" && selectedCourse) {
    return (
      <VirtualClassroom
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        onBack={onBackFromClassroom}
      />
    );
  }

  return null;
};
