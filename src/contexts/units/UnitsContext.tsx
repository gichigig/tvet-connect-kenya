import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnitService } from '@/integrations/supabase/unit';

export interface Unit {
  id: string;
  name: string;
  code: string;
  course: string;
  courseCode?: string;
  semester: number;
  year: number;
  credits: number;
  description?: string;
  lecturerId?: string;
  lecturerName?: string;
  enrolled: number;
  capacity: number;
  prerequisites?: string[];
  department?: string;
  status?: 'active' | 'inactive';
  createdBy?: string;
  createdDate?: string;
  schedule?: string;
  whatsappLink?: string;
  hasDiscussionGroup?: boolean;
}

interface UnitsContextType {
  units: Unit[];
  loading: boolean;
  getUnit: (id: string) => Unit | undefined;
  getUnitsByCourse: (course: string) => Unit[];
  getUnitsByLecturer: (lecturerId: string) => Unit[];
  getLecturerUnits: (lecturerId: string) => Unit[];
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  updateUnit: (id: string, updates: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  refreshUnits: () => Promise<void>;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const unitService = new UnitService();

  // Load units from database
  const refreshUnits = async () => {
    setLoading(true);
    try {
      const { data, error } = await unitService.listUnits();
      if (error) {
        console.error('Error loading units:', error);
      } else {
        setUnits(data);
        console.log('📚 Loaded units from database:', data);
      }
    } catch (error) {
      console.error('Error refreshing units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load units on component mount
  useEffect(() => {
    refreshUnits();
  }, []);

  const getUnit = (id: string): Unit | undefined => {
    return units.find(unit => unit.id === id);
  };

  const getUnitsByCourse = (course: string): Unit[] => {
    return units.filter(unit => unit.course === course || unit.courseCode === course);
  };

  const getUnitsByLecturer = (lecturerId: string): Unit[] => {
    return units.filter(unit => unit.lecturerId === lecturerId);
  };

  const getLecturerUnits = (lecturerId: string): Unit[] => {
    return getUnitsByLecturer(lecturerId);
  };

  const addUnit = async (unitData: Omit<Unit, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await unitService.createUnit({
        code: unitData.code,
        name: unitData.name,
        description: unitData.description || '',
        course: unitData.course,
        year: unitData.year,
        semester: unitData.semester,
        lecturerId: unitData.lecturerId || '',
        lecturerName: unitData.lecturerName || '',
        department: unitData.department || '',
        credits: unitData.credits,
        status: unitData.status || 'active'
      });
      
      if (error) {
        console.error('Error creating unit:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Unit created successfully:', data);
        // Refresh units to get updated list
        await refreshUnits();
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      setLoading(true);
      const { data, error } = await unitService.updateUnit(id, updates);
      
      if (error) {
        console.error('Error updating unit:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Unit updated successfully:', data);
        // Refresh units to get updated list
        await refreshUnits();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await unitService.deleteUnit(id);
      
      if (error) {
        console.error('Error deleting unit:', error);
        throw error;
      }
      
      console.log('✅ Unit deleted successfully');
      // Refresh units to get updated list
      await refreshUnits();
    } finally {
      setLoading(false);
    }
  };

  const value: UnitsContextType = {
    units,
    loading,
    getUnit,
    getUnitsByCourse,
    getUnitsByLecturer,
    getLecturerUnits,
    addUnit,
    updateUnit,
    deleteUnit,
    refreshUnits
  };

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
};
