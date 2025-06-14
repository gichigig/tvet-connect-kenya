
import { Header } from "@/components/Header";
import { CourseView } from "@/components/CourseView";
import { CourseDetail } from "@/components/CourseDetail";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VirtualClassroom } from "@/components/VirtualClassroom";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Course, Lesson } from "@/data/coursesData";
import { useAuth } from "@/contexts/AuthContext";

type ViewState = "catalog" | "course" | "lesson" | "admin" | "classroom";

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
  const { isAdmin } = useAuth();

  if (currentView === "admin" && isAdmin) {
    return (
      <>
        <Header onSearch={onSearch} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard />
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
            coursesByCategory={coursesByCategory}
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
