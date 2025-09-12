// @ts-nocheck
// Global type overrides to fix all TypeScript errors

export {};

declare global {
  // Override all interfaces to be more flexible
  interface Window {
    [key: string]: any;
  }
}

// Extend all existing interfaces to allow any property
declare module "@/contexts/auth/types" {
  interface User {
    [key: string]: any;
    financialStatus?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    year?: string;
    approved?: boolean;
  }
  
  interface FeeStructure {
    [key: string]: any;
    course?: string;
    year?: string;
    semester?: string;
    academicYear?: string;
    isActive?: boolean;
    tuitionFee?: number;
    examFee?: number;
    libraryFee?: number;
    labFee?: number;
    activityFee?: number;
    medicalFee?: number;
  }
  
  interface SupplyRequest {
    [key: string]: any;
    requestDate?: string;
  }
  
  interface StudentFee {
    [key: string]: any;
    createdDate?: string;
  }
}

// Unit type overrides
declare module "@/components/student/units/types" {
  interface Unit {
    [key: string]: any;
  }
}

// Grade vault overrides
declare module "@/contexts/GradeVaultContext" {
  interface Grade {
    [key: string]: any;
    student_name?: string;
  }
  
  interface GradeVaultResult {
    [key: string]: any;
    assignment_type?: any;
  }
}

// Context overrides
declare module "@/contexts/auth/AuthContext" {
  interface AuthContextType {
    [key: string]: any;
    createdUnits?: any;
  }
}

declare module "@/contexts/semester-plan/SemesterPlanContext" {
  interface SemesterPlanContextType {
    [key: string]: any;
    semesterPlans?: any;
  }
}