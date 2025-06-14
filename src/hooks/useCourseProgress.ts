
import { useState } from "react";
import { getUserProgress } from "@/data/coursesData";

export const useCourseProgress = () => {
  const [userProgress, setUserProgress] = useState(getUserProgress());

  const updateProgress = (courseId: string, newProgress: number) => {
    setUserProgress(prev => ({
      ...prev,
      [courseId]: newProgress
    }));
  };

  return {
    userProgress,
    updateProgress
  };
};
