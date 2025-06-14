
import React, { createContext, useState, useContext } from 'react';
import { Unit } from '@/types/unitManagement';
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

  const addCreatedUnit = (unit: Unit) => {
    setCreatedUnits(prev => [...prev, unit]);
  };

  const updateCreatedUnit = (unitId: string, updates: Partial<Unit>) => {
    setCreatedUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, ...updates } : unit
    ));
  };

  const deleteCreatedUnit = (unitId: string) => {
    setCreatedUnits(prev => prev.filter(unit => unit.id !== unitId));
  };

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
    deleteCreatedContent
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
