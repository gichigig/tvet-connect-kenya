import React, { createContext, useContext, useState } from 'react';

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  level: string;
  duration: number;
  credits: number;
  description?: string;
  prerequisites?: string[];
}

interface CoursesContextType {
  courses: Course[];
  loading: boolean;
  getCourse: (id: string) => Course | undefined;
  getCoursesByDepartment: (department: string) => Course[];
  getCoursesByLevel: (level: string) => Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  updateFeeStructure?: (id: string, feeStructure: any) => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const getCourse = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  const getCoursesByDepartment = (department: string): Course[] => {
    return courses.filter(course => course.department === department);
  };

  const getCoursesByLevel = (level: string): Course[] => {
    return courses.filter(course => course.level === level);
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString()
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const value: CoursesContextType = {
    courses,
    loading,
    getCourse,
    getCoursesByDepartment,
    getCoursesByLevel,
    addCourse,
    updateCourse,
    deleteCourse,
    updateFeeStructure: async () => {}
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCoursesContext = () => {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
};
