import { useEffect, useMemo, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

import { firebaseApp } from "@/integrations/firebase/config";

export const useCourseFiltering = (searchQuery: string) => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const coursesRef = ref(db, "courses");
    const unsubscribe = onValue(coursesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        setCourses(Object.values(data));
      } else {
        setCourses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  // Group courses by category for better organization
  const coursesByCategory = useMemo(() => {
    return filteredCourses.reduce((acc, course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    }, {} as Record<string, typeof courses>);
  }, [filteredCourses]);

  return {
    filteredCourses,
    coursesByCategory
  };
};
