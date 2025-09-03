import { supabase } from '@/integrations/supabase/client';

export interface SupabaseStudentData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  course: string;
  department: string;
  level: 'certificate' | 'diploma' | 'degree';
  year: number;
  semester: number;
  academicYear: string;
  enrollmentType: 'fulltime' | 'parttime' | 'online';
  institutionBranch: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  nationalId?: string;
  username?: string;
}

export interface StudentCreationResult {
  success: boolean;
  admissionNumber?: string;
  userId?: string;
  error?: string;
  warnings?: string[];
}

export class SupabaseStudentCreation {
  private static async generateAdmissionNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    try {
      // Get the count of existing students for this year
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .like('admission_number', `${currentYear}%`);

      if (error) {
        console.error('Error counting students:', error);
        // Fallback to random number
        return `${currentYear}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }

      const studentNumber = (count || 0) + 1;
      return `${currentYear}${studentNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating admission number:', error);
      return `${currentYear}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }

  private static async generateUsername(firstName: string, lastName: string): Promise<string> {
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    
    try {
      // Check if base username exists
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', baseUsername)
        .single();

      if (error && error.code === 'PGRST116') {
        // Username doesn't exist, we can use it
        return baseUsername;
      }

      // Username exists, add a number
      for (let i = 1; i <= 999; i++) {
        const numberedUsername = `${baseUsername}${i}`;
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', numberedUsername)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // This username doesn't exist
          return numberedUsername;
        }
      }

      // Fallback to random number
      return `${baseUsername}${Math.floor(Math.random() * 10000)}`;
    } catch (error) {
      console.error('Error generating username:', error);
      return `${baseUsername}${Math.floor(Math.random() * 100)}`;
    }
  }

  public static async createStudent(studentData: SupabaseStudentData): Promise<StudentCreationResult> {
    console.log('🎓 Creating student with Supabase-only approach:', studentData.email);

    try {
      // Generate admission number and username if not provided
      const admissionNumber = await this.generateAdmissionNumber();
      const username = studentData.username || await this.generateUsername(studentData.firstName, studentData.lastName);

      // Step 1: Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: studentData.password,
        options: {
          data: {
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            role: 'student',
            phone_number: studentData.phoneNumber
          }
        }
      });

      if (authError) {
        console.error('❌ Supabase auth user creation failed:', authError);
        return {
          success: false,
          error: `Auth creation failed: ${authError.message}`
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'User creation failed - no user returned'
        };
      }

      console.log('✅ Supabase auth user created:', authData.user.id);

      // Step 2: Create detailed profile
      const profileData = {
        id: authData.user.id,
        email: studentData.email,
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        role: 'student' as const,
        phone_number: studentData.phoneNumber,
        date_of_birth: studentData.dateOfBirth,
        gender: studentData.gender,
        course: studentData.course,
        department: studentData.department,
        level: studentData.level,
        year: studentData.year,
        semester: studentData.semester,
        academic_year: studentData.academicYear,
        enrollment_type: studentData.enrollmentType,
        institution_branch: studentData.institutionBranch,
        guardian_name: studentData.guardianName,
        guardian_phone: studentData.guardianPhone,
        address: studentData.address,
        national_id: studentData.nationalId,
        username,
        admission_number: admissionNumber,
        approved: false, // Students need approval
        created_at: new Date().toISOString(),
        created_by_registrar: true
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        
        // Try to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }

        return {
          success: false,
          error: `Profile creation failed: ${profileError.message}`
        };
      }

      console.log('✅ Student profile created successfully:', profile.admission_number);

      return {
        success: true,
        admissionNumber: admissionNumber,
        userId: authData.user.id,
        warnings: authData.session ? [] : ['Email confirmation required']
      };

    } catch (error) {
      console.error('❌ Student creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public static async createBatchStudents(students: SupabaseStudentData[]): Promise<{
    successful: number;
    failed: number;
    results: StudentCreationResult[];
  }> {
    console.log(`🎓 Creating batch of ${students.length} students`);

    const results: StudentCreationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const studentData of students) {
      const result = await this.createStudent(studentData);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      successful,
      failed,
      results
    };
  }

  public static async updateStudent(userId: string, updates: Partial<SupabaseStudentData>): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Convert updates to database column names
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
      if (updates.dateOfBirth) dbUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.gender) dbUpdates.gender = updates.gender;
      if (updates.course) dbUpdates.course = updates.course;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.level) dbUpdates.level = updates.level;
      if (updates.year) dbUpdates.year = updates.year;
      if (updates.semester) dbUpdates.semester = updates.semester;
      if (updates.academicYear) dbUpdates.academic_year = updates.academicYear;
      if (updates.enrollmentType) dbUpdates.enrollment_type = updates.enrollmentType;
      if (updates.institutionBranch) dbUpdates.institution_branch = updates.institutionBranch;
      if (updates.guardianName) dbUpdates.guardian_name = updates.guardianName;
      if (updates.guardianPhone) dbUpdates.guardian_phone = updates.guardianPhone;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.nationalId) dbUpdates.national_id = updates.nationalId;
      if (updates.username) dbUpdates.username = updates.username;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .eq('role', 'student');

      if (error) {
        console.error('Student update failed:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Student update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public static async deleteStudent(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Delete the profile (auth user will be cleaned up by triggers)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .eq('role', 'student');

      if (error) {
        console.error('Student deletion failed:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Student deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public static async getStudentByAdmissionNumber(admissionNumber: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('admission_number', admissionNumber)
        .eq('role', 'student')
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching student by admission number:', error);
      return null;
    }
  }

  public static async getAllStudents(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all students:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all students:', error);
      return [];
    }
  }
}
