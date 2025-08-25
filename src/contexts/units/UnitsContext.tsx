
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Unit } from '@/types/unitManagement';
import { saveUnitToFirebase, fetchUnitsFromFirebase, updateUnitInFirebase, deleteUnitFromFirebase } from '@/integrations/firebase/units';
import { CreatedContent } from '../auth/types';
import { debugFirestoreAccess } from '@/utils/authDebug';

interface UnitsContextType {
  createdUnits: Unit[];
  setCreatedUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  createdContent: CreatedContent[];
  setCreatedContent: React.Dispatch<React.SetStateAction<CreatedContent[]>>;
  addCreatedUnit: (unit: Omit<Unit, 'id'>) => void;
  updateCreatedUnit: (unitId: string, updates: Partial<Unit>) => void;
  deleteCreatedUnit: (unitId: string) => void;
  getAvailableUnits: (course?: string, year?: number) => Unit[];
  getLecturerUnits: (lecturerId: string) => Unit[];
  getUnassignedUnits: () => Unit[];
  getUnitsForStudent: (studentCourse: string, studentYear: number, semester?: number) => Unit[];
  getAllActiveUnits: () => Unit[];
  addCreatedContent: (content: CreatedContent) => void;
  updateCreatedContent: (contentId: string, updates: Partial<CreatedContent>) => void;
  deleteCreatedContent: (contentId: string) => void;
  loading: boolean;
  error: string | null;
}

const UnitsContext = createContext<UnitsContextType | null>(null);

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createdUnits, setCreatedUnits] = useState<Unit[]>([]);
  const [createdContent, setCreatedContent] = useState<CreatedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addCreatedUnit = async (unit: Omit<Unit, 'id'>) => {
    const saved = await saveUnitToFirebase(unit);
    setCreatedUnits(prev => [...prev, saved]);
  };

  const updateCreatedUnit = async (unitId: string, updates: Partial<Unit>) => {
    await updateUnitInFirebase(unitId, updates);
    setCreatedUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, ...updates } : unit
    ));
  };

  const deleteCreatedUnit = async (unitId: string) => {
    await deleteUnitFromFirebase(unitId);
    setCreatedUnits(prev => prev.filter(unit => unit.id !== unitId));
  };

  // Fetch all units from Firebase on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('UnitsContext: Starting to fetch units from Firebase');
        debugFirestoreAccess();
        const units = await fetchUnitsFromFirebase();
        console.log('UnitsContext: Successfully fetched units:', units.length);
        setCreatedUnits(units);
      } catch (err: any) {
        console.error('UnitsContext: Error fetching units:', err);
        setError(err?.message || 'Failed to load units from database.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getAvailableUnits = (course?: string, year?: number) => {
    if (!course || !year) return [];
    return createdUnits.filter(unit => 
      unit.course === course && unit.year === year && unit.status === 'active'
    );
  };

  // Get units assigned to a specific lecturer
  const getLecturerUnits = (lecturerId: string) => {
    const lecturerUnits = createdUnits.filter(unit => 
      unit.lecturerId === lecturerId && unit.status === 'active'
    );
    
    console.log('getLecturerUnits called:', {
      lecturerId,
      totalUnits: createdUnits.length,
      lecturerUnitsFound: lecturerUnits.length,
      lecturerUnits: lecturerUnits.map(unit => ({
        id: unit.id,
        code: unit.code,
        name: unit.name,
        lecturerId: unit.lecturerId
      })),
      allUnitsWithLecturers: createdUnits.filter(unit => unit.lecturerId).map(unit => ({
        id: unit.id,
        code: unit.code,
        lecturerId: unit.lecturerId
      }))
    });
    
    return lecturerUnits;
  };

  // Get all units that need lecturer assignment (for registrar)
  const getUnassignedUnits = () => {
    return createdUnits.filter(unit => 
      !unit.lecturerId && unit.status === 'active'
    );
  };

  // Helper function to normalize course names for comparison
  const normalizeCourse = (courseName: string) => {
    return courseName.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Get units for a specific course and year (for students)
  const getUnitsForStudent = (studentCourse: string, studentYear: number, semester?: number | string) => {
    const semesterAsNumber = typeof semester === 'string' ? parseInt(semester, 10) : semester;
    const normalizedStudentCourse = normalizeCourse(studentCourse);
    
    console.log('🔍 DEBUG getUnitsForStudent called with:', {
      studentCourse,
      normalizedStudentCourse,
      studentYear,
      semester: semesterAsNumber,
      totalUnits: createdUnits.length
    });
    
    const matchingUnits = createdUnits.filter(unit => {
      const normalizedUnitCourse = normalizeCourse(unit.course);
      const courseMatch = normalizedUnitCourse === normalizedStudentCourse;
      const yearMatch = unit.year === studentYear;
      const statusMatch = unit.status === 'active';
      const semesterMatch = semesterAsNumber ? unit.semester === semesterAsNumber : true;
      
      console.log(`📋 Unit ${unit.code}:`, {
        unitCourse: unit.course,
        normalizedUnitCourse,
        unitYear: unit.year,
        unitSemester: unit.semester,
        unitStatus: unit.status,
        courseMatch,
        yearMatch,
        statusMatch,
        semesterMatch,
        overallMatch: courseMatch && yearMatch && statusMatch && semesterMatch
      });
      
      return courseMatch && yearMatch && statusMatch && semesterMatch;
    });
    
    console.log('✅ Found matching units:', matchingUnits.length, matchingUnits.map(u => u.code));
    return matchingUnits;
  };

  // Get all active units (for general display)
  const getAllActiveUnits = () => {
    return createdUnits.filter(unit => unit.status === 'active');
  };

  const addCreatedContent = (content: CreatedContent) => {
    setCreatedContent(prev => [...prev, content]);
  };

  const updateCreatedContent = (contentId: string, updates: Partial<CreatedContent>) => {
    setCreatedContent(prev => prev.map(content => 
      content.id === contentId ? { ...content, ...updates } : content
    ));
  };

  const deleteCreatedContent = (contentId: string) => {
    setCreatedContent(prev => prev.filter(content => content.id !== contentId));
  };

  const value = {
    createdUnits,
    setCreatedUnits,
    createdContent,
    setCreatedContent,
    addCreatedUnit,
    updateCreatedUnit,
    deleteCreatedUnit,
    getAvailableUnits,
    getLecturerUnits,
    getUnassignedUnits,
    getUnitsForStudent,
    getAllActiveUnits,
    addCreatedContent,
    updateCreatedContent,
    deleteCreatedContent,
    loading,
    error
  };

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
};
