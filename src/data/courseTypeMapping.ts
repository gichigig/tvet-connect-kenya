// Mapping between different Course type definitions to resolve conflicts

import { Course as DataCourse } from '@/data/coursesData';

export interface UnifiedCourse {
  id: string;
  title: string;
  name: string;
  description: string;
  department: string;
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
  durationType?: string;
  mode?: string;
  totalCredits?: number;
  units?: string[];
  imageUrl?: string;
  progress?: number;
  enrollmentCount?: number;
  instructor?: string;
  level?: string;
  duration?: string;
}

export const mapToUnifiedCourse = (course: any): UnifiedCourse => {
  return {
    id: course.id,
    title: course.title || course.name,
    name: course.name || course.title,
    description: course.description || '',
    department: course.department || course.category || '',
    category: course.category,
    status: course.status || 'active',
    durationType: course.durationType || 'semester',
    mode: course.mode || 'on-campus',
    totalCredits: course.totalCredits || 0,
    units: course.units || [],
    imageUrl: course.imageUrl,
    progress: course.progress || 0,
    enrollmentCount: course.enrollmentCount || 0,
    instructor: course.instructor,
    level: course.level,
    duration: course.duration
  };
};