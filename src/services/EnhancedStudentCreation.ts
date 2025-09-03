/**
 * Enhanced Student Creation Service
 * Creates students in both Firebase and Supabase for seamless migration
 */

import { createClient } from '@supabase/supabase-js';
import { createStudent as createFirebaseStudent, CreateStudentData } from '@/integrations/firebase/users';
import { SimpleUserMigration } from '@/services/SimpleUserMigration';
import { toast } from '@/hooks/use-toast';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EnhancedCreateStudentData extends CreateStudentData {
  password: string; // Make password required
}

export interface StudentCreationResult {
  success: boolean;
  studentId?: string;
  admissionNumber?: string;
  firebaseCreated: boolean;
  supabaseCreated: boolean;
  errors?: string[];
  warnings?: string[];
}

export class EnhancedStudentCreation {
  /**
   * Create a student in both Firebase and Supabase
   */
  static async createStudent(studentData: EnhancedCreateStudentData): Promise<StudentCreationResult> {
    const result: StudentCreationResult = {
      success: false,
      firebaseCreated: false,
      supabaseCreated: false,
      errors: [],
      warnings: []
    };

    console.log('🎓 Starting enhanced student creation for:', studentData.email);

    try {
      // Step 1: Create student in Firebase (existing system)
      console.log('🔥 Creating student in Firebase...');
      
      const firebaseStudent = await createFirebaseStudent(studentData);
      result.firebaseCreated = true;
      result.studentId = firebaseStudent.id;
      result.admissionNumber = firebaseStudent.admissionNumber;
      
      console.log('✅ Firebase student created:', firebaseStudent.admissionNumber);

      // Step 2: Create Supabase auth user
      console.log('🔐 Creating Supabase auth user...');
      
      const supabaseAuthResult = await this.createSupabaseAuthUser(studentData, firebaseStudent);
      
      if (supabaseAuthResult.success) {
        result.supabaseCreated = true;
        console.log('✅ Supabase auth user created');
        
        // Step 3: Create student profile in Supabase
        console.log('👤 Creating Supabase student profile...');
        
        const profileResult = await this.createSupabaseStudentProfile(
          studentData, 
          firebaseStudent, 
          supabaseAuthResult.userId
        );
        
        if (profileResult.success) {
          console.log('✅ Supabase student profile created');
        } else {
          result.warnings?.push('Supabase profile creation failed: ' + profileResult.error);
        }
      } else {
        result.warnings?.push('Supabase auth user creation failed: ' + supabaseAuthResult.error);
      }

      result.success = result.firebaseCreated; // At minimum, Firebase creation must succeed

      // Show success toast
      toast({
        title: 'Student Created Successfully!',
        description: `${studentData.firstName} ${studentData.lastName} (${result.admissionNumber}) has been created.${
          result.supabaseCreated ? ' Account is ready for the new system.' : ' Will be migrated to new system on first login.'
        }`,
        duration: 5000,
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors?.push(errorMessage);
      
      console.error('❌ Enhanced student creation failed:', errorMessage);
      
      toast({
        title: 'Student Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return result;
    }
  }

  /**
   * Create Supabase auth user for the student
   */
  private static async createSupabaseAuthUser(
    studentData: EnhancedCreateStudentData, 
    firebaseStudent: any
  ) {
    try {
      // Generate a secure password (can be the same as Firebase or different)
      const password = studentData.password;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: password,
        options: {
          data: {
            // Include Firebase reference and student data
            firebase_uid: firebaseStudent.id,
            admission_number: firebaseStudent.admissionNumber,
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            role: 'student',
            department: studentData.department,
            course: studentData.course,
            level: studentData.level,
            year: studentData.year,
            semester: studentData.semester,
            academic_year: studentData.academicYear,
            phone_number: studentData.phoneNumber,
            created_by_registrar: true,
            created_at: new Date().toISOString()
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          console.log('⚠️ User already exists in Supabase auth');
          return { success: true, userId: null, warning: 'User already exists' };
        }
        throw authError;
      }

      return {
        success: true,
        userId: authData.user?.id,
        user: authData.user
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create student profile in Supabase profiles table
   */
  private static async createSupabaseStudentProfile(
    studentData: EnhancedCreateStudentData,
    firebaseStudent: any,
    supabaseUserId?: string
  ) {
    try {
      if (!supabaseUserId) {
        return { success: false, error: 'No Supabase user ID provided' };
      }

      // Create profile record
      const profileData = {
        id: supabaseUserId,
        user_id: supabaseUserId,
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        email: studentData.email,
        role: 'student',
        department_id: null, // Will need to map department name to ID
        course: studentData.course,
        level: studentData.level,
        year: studentData.year,
        semester: studentData.semester,
        admission_number: firebaseStudent.admissionNumber,
        intake: studentData.academicYear,
        phone: studentData.phoneNumber,
        approved: true,
        blocked: false,
        financial_status: 'pending',
        total_fees_owed: 0,
        // Additional fields
        firebase_id: firebaseStudent.id,
        date_of_birth: studentData.dateOfBirth,
        gender: studentData.gender,
        guardian_name: studentData.guardianName,
        guardian_phone: studentData.guardianPhone,
        national_id: studentData.nationalId,
        enrollment_type: studentData.enrollmentType,
        institution_branch: studentData.institutionBranch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, profile: data?.[0] };

    } catch (error) {
      console.error('Failed to create Supabase profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Batch create multiple students
   */
  static async createMultipleStudents(studentsData: EnhancedCreateStudentData[]) {
    const results = [];
    const batchSize = 5; // Process in batches to avoid overwhelming the system

    console.log(`🎓 Starting batch student creation for ${studentsData.length} students...`);

    for (let i = 0; i < studentsData.length; i += batchSize) {
      const batch = studentsData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (studentData, index) => {
        try {
          console.log(`📝 Creating student ${i + index + 1}/${studentsData.length}: ${studentData.firstName} ${studentData.lastName}`);
          
          const result = await this.createStudent(studentData);
          return {
            index: i + index,
            studentData,
            result
          };
        } catch (error) {
          return {
            index: i + index,
            studentData,
            result: {
              success: false,
              firebaseCreated: false,
              supabaseCreated: false,
              errors: [error instanceof Error ? error.message : String(error)]
            }
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < studentsData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Summary
    const successful = results.filter(r => r.result.success);
    const failed = results.filter(r => !r.result.success);

    console.log(`✅ Batch creation complete: ${successful.length} successful, ${failed.length} failed`);

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      results
    };
  }

  /**
   * Check if a student exists in both systems
   */
  static async checkStudentExists(email: string, admissionNumber?: string) {
    try {
      // Check Supabase
      const { data: supabaseUser } = await supabase.auth.getUser();
      const supabaseExists = !!supabaseUser;

      // Check Firebase (would need to implement Firebase check)
      // For now, we'll just return Supabase status

      return {
        supabase: supabaseExists,
        firebase: false, // Would need to implement
        exists: supabaseExists
      };

    } catch (error) {
      console.error('Error checking student existence:', error);
      return {
        supabase: false,
        firebase: false,
        exists: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Migrate existing Firebase student to Supabase
   */
  static async migrateExistingStudent(firebaseStudent: any, password: string) {
    try {
      console.log(`🔄 Migrating existing student: ${firebaseStudent.email}`);

      const migrationResult = await SimpleUserMigration.createSupabaseUser({
        uid: firebaseStudent.id,
        email: firebaseStudent.email,
        displayName: `${firebaseStudent.firstName} ${firebaseStudent.lastName}`
      });

      if (migrationResult.success) {
        // Also create profile if it doesn't exist
        const profileResult = await this.createSupabaseStudentProfile(
          {
            ...firebaseStudent,
            password // This won't be stored in profile, just used for reference
          } as EnhancedCreateStudentData,
          firebaseStudent,
          migrationResult.user?.id
        );

        return {
          success: true,
          migrationResult,
          profileResult
        };
      }

      return {
        success: false,
        error: migrationResult.error
      };

    } catch (error) {
      console.error('Failed to migrate student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
