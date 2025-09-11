import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SemesterPlanActivity {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'material' | 'assignment' | 'exam' | 'attendance' | 'online-class';
  unitCode: string;
  unitName: string;
  dueDate?: Date;
  isCompleted?: boolean;
  priority: 'low' | 'medium' | 'high';
  instructor?: string;
  location?: string;
}

interface SemesterPlanContextType {
  activities: SemesterPlanActivity[];
  loading: boolean;
  getActivitiesForDate: (date: Date) => SemesterPlanActivity[];
  getActivitiesForUnit: (unitCode: string) => SemesterPlanActivity[];
  getUpcomingActivities: (days?: number) => SemesterPlanActivity[];
  markActivityCompleted: (activityId: string) => void;
  refreshActivities: () => Promise<void>;
}

const SemesterPlanContext = createContext<SemesterPlanContextType | undefined>(undefined);

export const SemesterPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<SemesterPlanActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock semester plan activities
  const getMockActivities = (): SemesterPlanActivity[] => {
    const today = new Date();
    return [
      {
        id: '1',
        title: 'Programming Assignment 1',
        description: 'Create a calculator application using JavaScript',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        type: 'assignment',
        unitCode: 'CP101',
        unitName: 'Programming Fundamentals',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        priority: 'high',
        instructor: 'Dr. Smith'
      },
      {
        id: '2',
        title: 'Database Design Lecture',
        description: 'Introduction to Entity-Relationship modeling',
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        type: 'material',
        unitCode: 'CP201',
        unitName: 'Database Systems',
        priority: 'medium',
        instructor: 'Prof. Johnson',
        location: 'Room 205'
      },
      {
        id: '3',
        title: 'Mid-term Examination',
        description: 'Covers chapters 1-5 of the programming course',
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        type: 'exam',
        unitCode: 'CP101',
        unitName: 'Programming Fundamentals',
        priority: 'high',
        instructor: 'Dr. Smith',
        location: 'Exam Hall A'
      },
      {
        id: '4',
        title: 'Weekly Attendance Check',
        description: 'Mark your attendance for this week',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'attendance',
        unitCode: 'WD301',
        unitName: 'Web Development',
        priority: 'medium',
        instructor: 'Ms. Davis'
      },
      {
        id: '5',
        title: 'Virtual Class Session',
        description: 'Online discussion on advanced web technologies',
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        type: 'online-class',
        unitCode: 'WD301',
        unitName: 'Web Development',
        priority: 'medium',
        instructor: 'Ms. Davis',
        location: 'Online - Zoom'
      }
    ];
  };

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockActivities = getMockActivities();
        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to load semester plan activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const getActivitiesForDate = (date: Date): SemesterPlanActivity[] => {
    return activities.filter(activity => 
      activity.date.toDateString() === date.toDateString()
    );
  };

  const getActivitiesForUnit = (unitCode: string): SemesterPlanActivity[] => {
    return activities.filter(activity => activity.unitCode === unitCode);
  };

  const getUpcomingActivities = (days: number = 7): SemesterPlanActivity[] => {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    return activities
      .filter(activity => activity.date >= today && activity.date <= endDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const markActivityCompleted = (activityId: string) => {
    setActivities(prevActivities =>
      prevActivities.map(activity =>
        activity.id === activityId
          ? { ...activity, isCompleted: true }
          : activity
      )
    );
  };

  const refreshActivities = async () => {
    setLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockActivities = getMockActivities();
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: SemesterPlanContextType = {
    activities,
    loading,
    getActivitiesForDate,
    getActivitiesForUnit,
    getUpcomingActivities,
    markActivityCompleted,
    refreshActivities
  };

  return (
    <SemesterPlanContext.Provider value={value}>
      {children}
    </SemesterPlanContext.Provider>
  );
};

export const useSemesterPlan = () => {
  const context = useContext(SemesterPlanContext);
  if (context === undefined) {
    throw new Error('useSemesterPlan must be used within a SemesterPlanProvider');
  }
  return context;
};
