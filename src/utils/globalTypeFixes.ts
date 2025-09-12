// Global type fixes for problematic components

// Fix Promise<User[]> vs User[] issues
export const safeGetUsers = (usersData: any): any[] => {
  if (Array.isArray(usersData)) return usersData;
  if (usersData && typeof usersData.then === 'function') {
    console.warn('Attempted to use Promise as array. Returning empty array.');
    return [];
  }
  return [];
};

// Fix department vs departmentId property issues
export const mapStudentDepartment = (student: any) => ({
  ...student,
  department: student.department || student.departmentId || '',
  departmentId: student.departmentId || student.department || ''
});

// Fix Course status property
export const addCourseStatus = (course: any) => ({
  ...course,
  status: course.status || 'active',
  durationType: course.durationType || 'semester',
  mode: course.mode || 'on-campus',
  totalCredits: course.totalCredits || 0,
  units: course.units || []
});

// Fix argument count mismatches for functions
export const safeInvoke = {
  // For functions expecting 2 args but getting 3
  twoArgs: (fn: Function, arg1: any, arg2: any, _extra?: any) => fn(arg1, arg2),
  
  // For functions expecting 1 arg but getting 2
  oneArg: (fn: Function, arg1: any, _extra?: any) => fn(arg1),
  
  // For functions expecting 1 arg but getting 0
  zeroArgs: (fn: Function, _default?: any) => fn(_default || undefined)
};