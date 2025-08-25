// Course Content Context for sharing materials between lecturers and students
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface CourseContent {
  id: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  type: 'notes' | 'assignment' | 'exam' | 'cat' | 'material';
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  dueDate?: string;
  maxMarks?: number;
  instructions?: string;
  createdAt: string;
  isVisible: boolean;
  lecturerId: string;
  lecturerName?: string;
}

interface CourseContentContextType {
  allContent: CourseContent[];
  getContentForUnit: (unitId: string) => CourseContent[];
  getContentForStudent: (studentId: string, approvedUnits: string[]) => CourseContent[];
  addContent: (content: Omit<CourseContent, 'id'>) => void;
  updateContent: (contentId: string, updates: Partial<CourseContent>) => void;
  deleteContent: (contentId: string) => void;
}

const CourseContentContext = createContext<CourseContentContextType | null>(null);

export const CourseContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allContent, setAllContent] = useState<CourseContent[]>([]);

  // Note: Content is now managed in memory only, not persisted to localStorage
  // This ensures fresh data is fetched from the server on each session

  const getContentForUnit = (unitId: string) => {
    return allContent.filter(content => content.unitId === unitId && content.isVisible);
  };

  const getContentForStudent = (studentId: string, approvedUnits: string[]) => {
    const studentContent = allContent.filter(content => 
      approvedUnits.includes(content.unitId) && content.isVisible
    );
    
    console.log('CourseContentContext - getContentForStudent:', {
      studentId,
      approvedUnits,
      totalContent: allContent.length,
      studentContent: studentContent.length,
      allContentSample: allContent.slice(0, 2)
    });
    
    return studentContent;
  };

  const addContent = (content: Omit<CourseContent, 'id'>) => {
    const newContent: CourseContent = {
      ...content,
      id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };
    
    console.log('Adding new course content:', newContent);
    setAllContent(prev => [...prev, newContent]);
  };

  const updateContent = (contentId: string, updates: Partial<CourseContent>) => {
    setAllContent(prev => prev.map(content => 
      content.id === contentId ? { ...content, ...updates } : content
    ));
  };

  const deleteContent = (contentId: string) => {
    setAllContent(prev => prev.filter(content => content.id !== contentId));
  };

  const value: CourseContentContextType = {
    allContent,
    getContentForUnit,
    getContentForStudent,
    addContent,
    updateContent,
    deleteContent,
  };

  return (
    <CourseContentContext.Provider value={value}>
      {children}
    </CourseContentContext.Provider>
  );
};

export const useCourseContent = () => {
  const context = useContext(CourseContentContext);
  if (!context) {
    throw new Error('useCourseContent must be used within a CourseContentProvider');
  }
  return context;
};
