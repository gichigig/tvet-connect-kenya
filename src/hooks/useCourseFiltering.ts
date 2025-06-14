
import { useMemo } from "react";
import { coursesData } from "@/data/coursesData";

export const useCourseFiltering = (searchQuery: string) => {
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group courses by category for better organization
  const coursesByCategory = useMemo(() => {
    return filteredCourses.reduce((acc, course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    }, {} as Record<string, typeof coursesData>);
  }, [filteredCourses]);

  return {
    filteredCourses,
    coursesByCategory
  };
};
