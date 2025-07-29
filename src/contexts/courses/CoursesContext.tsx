import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, CourseUnit, FeeStructure } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/integrations/firebase/config';

interface CoursesContextType {
  courses: Course[];
  courseUnits: CourseUnit[];
  feeStructures: FeeStructure[];
  loading: boolean;
  
  // Course management
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  approveCourse: (courseId: string) => Promise<void>;
  activateCourse: (courseId: string) => Promise<void>;
  
  // Course unit management
  assignUnitToCourse: (courseId: string, unitId: string, semester: number, year: number, isCore: boolean) => Promise<void>;
  removeUnitFromCourse: (courseUnitId: string) => Promise<void>;
  
  // Lecturer assignment
  assignLecturerToCourse: (courseId: string, lecturerId: string) => Promise<void>;
  removeLecturerFromCourse: (courseId: string, lecturerId: string) => Promise<void>;
  
  // Fee structure management
  createFeeStructure: (feeStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  updateFeeStructure: (feeStructureId: string, updates: Partial<FeeStructure>) => Promise<void>;
  
  // Getters
  getCourseById: (courseId: string) => Course | undefined;
  getCoursesByStatus: (status: Course['status']) => Course[];
  getCoursesByDepartment: (department: string) => Course[];
  getFeeStructureByCourseId: (courseId: string) => FeeStructure | undefined;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const useCoursesContext = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
};

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(firebaseApp);

  // Subscribe to courses
  useEffect(() => {
    const coursesRef = collection(db, 'courses');
    const coursesQuery = query(coursesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Handle legacy courses that might have 'title' instead of 'name' or missing name
        const course = {
          id: doc.id,
          ...data,
          // Ensure name field exists, fallback to title or code
          name: data.name || data.title || data.code || 'Unnamed Course'
        } as Course;
        
        return course;
      });
      setCourses(coursesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Subscribe to course units
  useEffect(() => {
    const courseUnitsRef = collection(db, 'course_units');
    const courseUnitsQuery = query(courseUnitsRef);
    
    const unsubscribe = onSnapshot(courseUnitsQuery, (snapshot) => {
      const courseUnitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseUnit[];
      setCourseUnits(courseUnitsData);
    });

    return () => unsubscribe();
  }, [db]);

  // Subscribe to fee structures
  useEffect(() => {
    const feeStructuresRef = collection(db, 'fee_structures');
    const feeStructuresQuery = query(feeStructuresRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(feeStructuresQuery, (snapshot) => {
      const feeStructuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeeStructure[];
      setFeeStructures(feeStructuresData);
    });

    return () => unsubscribe();
  }, [db]);

  const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'createdBy'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const course: Omit<Course, 'id'> = {
      ...courseData,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      status: 'pending_approval',
      studentsEnrolled: 0,
      units: [],
      lecturerIds: []
    };

    const docRef = await addDoc(collection(db, 'courses'), course);
    return docRef.id;
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<void> => {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, updates);
  };

  const deleteCourse = async (courseId: string): Promise<void> => {
    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
  };

  const approveCourse = async (courseId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    await updateCourse(courseId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user.id
    });
  };

  const activateCourse = async (courseId: string): Promise<void> => {
    await updateCourse(courseId, {
      status: 'active',
      isActive: true
    });
  };

  const assignUnitToCourse = async (
    courseId: string, 
    unitId: string, 
    semester: number, 
    year: number, 
    isCore: boolean
  ): Promise<void> => {
    const courseUnit: Omit<CourseUnit, 'id'> = {
      courseId,
      unitId,
      semester,
      year,
      isCore,
      prerequisites: []
    };

    await addDoc(collection(db, 'course_units'), courseUnit);
    
    // Update course units array
    const course = getCourseById(courseId);
    if (course && !course.units.includes(unitId)) {
      await updateCourse(courseId, {
        units: [...course.units, unitId]
      });
    }
  };

  const removeUnitFromCourse = async (courseUnitId: string): Promise<void> => {
    const courseUnitRef = doc(db, 'course_units', courseUnitId);
    await deleteDoc(courseUnitRef);
  };

  const assignLecturerToCourse = async (courseId: string, lecturerId: string): Promise<void> => {
    const course = getCourseById(courseId);
    if (course && !course.lecturerIds.includes(lecturerId)) {
      await updateCourse(courseId, {
        lecturerIds: [...course.lecturerIds, lecturerId]
      });
    }
  };

  const removeLecturerFromCourse = async (courseId: string, lecturerId: string): Promise<void> => {
    const course = getCourseById(courseId);
    if (course) {
      await updateCourse(courseId, {
        lecturerIds: course.lecturerIds.filter(id => id !== lecturerId)
      });
    }
  };

  const createFeeStructure = async (feeStructureData: Omit<FeeStructure, 'id' | 'createdAt' | 'createdBy'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const feeStructure: Omit<FeeStructure, 'id'> = {
      ...feeStructureData,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'fee_structures'), feeStructure);
    
    // Update course with fee structure ID
    await updateCourse(feeStructureData.courseId, {
      feeStructureId: docRef.id
    });

    return docRef.id;
  };

  const updateFeeStructure = async (feeStructureId: string, updates: Partial<FeeStructure>): Promise<void> => {
    const feeStructureRef = doc(db, 'fee_structures', feeStructureId);
    await updateDoc(feeStructureRef, updates);
  };

  // Getters
  const getCourseById = (courseId: string): Course | undefined => {
    return courses.find(course => course.id === courseId);
  };

  const getCoursesByStatus = (status: Course['status']): Course[] => {
    return courses.filter(course => course.status === status);
  };

  const getCoursesByDepartment = (department: string): Course[] => {
    return courses.filter(course => course.department === department);
  };

  const getFeeStructureByCourseId = (courseId: string): FeeStructure | undefined => {
    return feeStructures.find(fs => fs.courseId === courseId);
  };

  const value: CoursesContextType = {
    courses,
    courseUnits,
    feeStructures,
    loading,
    createCourse,
    updateCourse,
    deleteCourse,
    approveCourse,
    activateCourse,
    assignUnitToCourse,
    removeUnitFromCourse,
    assignLecturerToCourse,
    removeLecturerFromCourse,
    createFeeStructure,
    updateFeeStructure,
    getCourseById,
    getCoursesByStatus,
    getCoursesByDepartment,
    getFeeStructureByCourseId
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
};
