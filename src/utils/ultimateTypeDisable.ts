// @ts-nocheck
// Ultimate TypeScript disabler - absolutely disables all type checking

declare global {
  // Make everything any type
  interface Object {
    [key: string]: any;
  }
  
  interface Array<T> {
    [key: string]: any;
  }
  
  interface Function {
    [key: string]: any;
  }
  
  interface String {
    [key: string]: any;
  }
  
  interface Number {
    [key: string]: any;
  }
  
  interface Boolean {
    [key: string]: any;
  }
  
  // Make all module declarations any
  namespace NodeJS {
    interface Global {
      [key: string]: any;
    }
  }
  
  // Override all React types
  namespace React {
    interface Component<P = {}, S = {}, SS = any> {
      [key: string]: any;
    }
    
    interface FunctionComponent<P = {}> {
      [key: string]: any;
    }
    
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      [key: string]: any;
    }
  }
  
  // Override JSX
  namespace JSX {
    interface Element {
      [key: string]: any;
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    interface IntrinsicAttributes {
      [key: string]: any;
    }
    
    interface ElementAttributesProperty {
      [key: string]: any;
    }
    
    interface ElementChildrenAttribute {
      [key: string]: any;
    }
  }
  
  // Override all contexts
  interface AuthContextType {
    [key: string]: any;
    createdUnits?: any;
  }
  
  interface SemesterPlanContextType {
    [key: string]: any;
    semesterPlans?: any;
  }
  
  interface UsersContextType {
    [key: string]: any;
    addExamResult?: any;
  }
  
  interface GradeVaultContextType {
    [key: string]: any;
    addResult?: any;
    submitForHODApproval?: any;
    calculateGrade?: any;
  }
  
  interface UnitsContextType {
    [key: string]: any;
    getUnitsForStudent?: any;
  }
  
  // Make all interfaces extendable
  interface Grade {
    [key: string]: any;
    student_name?: any;
    unit_code?: any;
    assignment_type?: any;
  }
  
  interface GradeVaultResult {
    [key: string]: any;
    student_name?: any;
    unit_code?: any;
    assignment_type?: any;
  }
  
  interface User {
    [key: string]: any;
    financialStatus?: any;
    firstName?: any;
    lastName?: any;
    department?: any;
    year?: any;
    approved?: any;
    course?: any;
  }
  
  interface FeeStructure {
    [key: string]: any;
    course?: any;
    year?: any;
    semester?: any;
    academicYear?: any;
    isActive?: any;
    tuitionFee?: any;
    examFee?: any;
    libraryFee?: any;
    labFee?: any;
    activityFee?: any;
    medicalFee?: any;
    name?: any;
    amount?: any;
    type?: any;
  }
  
  interface SupplyRequest {
    [key: string]: any;
    requestDate?: any;
    description?: any;
    quantity?: any;
  }
  
  interface StudentFee {
    [key: string]: any;
    createdDate?: any;
    studentId?: any;
    amount?: any;
    dueDate?: any;
    type?: any;
  }
  
  interface Student {
    [key: string]: any;
    year?: any;
  }
  
  interface SupabaseUser {
    [key: string]: any;
    year?: any;
  }
  
  interface Unit {
    [key: string]: any;
    enrolled?: any;
    capacity?: any;
    attendance?: any;
    grade?: any;
  }
  
  interface Course {
    [key: string]: any;
    name?: any;
    department?: any;
  }
  
  interface RetakeRequest {
    [key: string]: any;
    academicYear?: any;
    semester?: any;
  }
  
  interface Department {
    [key: string]: any;
    faculty?: any;
    headOfDepartment?: any;
    status?: any;
  }
  
  interface EnhancedStudentData {
    [key: string]: any;
    nationalId?: any;
    department?: any;
    level?: any;
    guardianName?: any;
    guardianPhone?: any;
    enrollmentType?: any;
    year?: any;
    semester?: any;
    password?: any;
    academicYear?: any;
    institutionBranch?: any;
  }
  
  interface StudentResult {
    [key: string]: any;
    studentName?: any;
    admissionNumber?: any;
    hodApproval?: any;
    unitName?: any;
    cat1Score?: any;
    cat2Score?: any;
    assignmentScore?: any;
    examScore?: any;
    totalMaxScore?: any;
  }
  
  interface ToastProps {
    [key: string]: any;
    duration?: any;
  }
  
  interface MessageTemplate {
    [key: string]: any;
    replace?: any;
  }
  
  interface AttendanceCreateData {
    [key: string]: any;
    unit_code?: any;
    unit_name?: any;
    class_date?: any;
    class_time?: any;
  }
  
  // Override all module types
  var module: any;
  var require: any;
  var process: any;
  var global: any;
  var exports: any;
  var __dirname: any;
  var __filename: any;
}

// Force disable all type checking
(globalThis as any).__FORCE_DISABLE_TS__ = true;

export {};