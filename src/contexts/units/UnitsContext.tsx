
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Unit } from '@/types/unitManagement';
import { saveUnitToFirebase, fetchUnitsFromFirebase, updateUnitInFirebase, deleteUnitFromFirebase } from '@/integrations/firebase/units';
import { CreatedContent } from '../auth/types';

interface UnitsContextType {
  createdUnits: Unit[];
  setCreatedUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  createdContent: CreatedContent[];
  setCreatedContent: React.Dispatch<React.SetStateAction<CreatedContent[]>>;
  addCreatedUnit: (unit: Unit) => void;
  updateCreatedUnit: (unitId: string, updates: Partial<Unit>) => void;
  deleteCreatedUnit: (unitId: string) => void;
  getAvailableUnits: (course?: string, year?: number) => Unit[];
  addCreatedContent: (content: CreatedContent) => void;
  updateCreatedContent: (contentId: string, updates: Partial<CreatedContent>) => void;
  deleteCreatedContent: (contentId: string) => void;
}

const UnitsContext = createContext<UnitsContextType | null>(null);

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createdUnits, setCreatedUnits] = useState<Unit[]>([]);
  const [createdContent, setCreatedContent] = useState<CreatedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addCreatedUnit = async (unit: Unit) => {
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
        const units = await fetchUnitsFromFirebase();
        setCreatedUnits(units);
      } catch (err: any) {
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
