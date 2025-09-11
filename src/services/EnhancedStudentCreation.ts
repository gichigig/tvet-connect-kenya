// Enhanced Student Creation Service with validation and error handling
import { supabase } from '@/integrations/supabase/client';
import { createStudent, CreateStudentData, getUserProfile } from '@/integrations/supabase/users';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StudentCreationResult {
  success: boolean;
  studentId?: string;
  errors?: ValidationError[];
  message?: string;
}

export interface EnhancedStudentData extends CreateStudentData {
  confirmEmail?: string;
  confirmPassword?: string;
  generatePassword?: boolean;
  sendWelcomeEmail?: boolean;
  profilePhoto?: File;
}

/**
 * Validate student data before creation
 */
export const validateStudentData = async (data: EnhancedStudentData): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  // Required field validation
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  
  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  
  if (!data.username?.trim()) {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  
  if (!data.studentId?.trim()) {
    errors.push({ field: 'studentId', message: 'Student ID is required' });
  }
  
  if (!data.course?.trim()) {
    errors.push({ field: 'course', message: 'Course is required' });
  }
  
  if (!data.intake?.trim()) {
    errors.push({ field: 'intake', message: 'Intake is required' });
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Email confirmation validation
  if (data.confirmEmail && data.email !== data.confirmEmail) {
    errors.push({ field: 'confirmEmail', message: 'Email addresses do not match' });
  }

  // Username validation (alphanumeric and underscores only)
  if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' });
  }

  // Username length validation
  if (data.username && (data.username.length < 3 || data.username.length > 20)) {
    errors.push({ field: 'username', message: 'Username must be between 3 and 20 characters' });
  }

  // Student ID format validation (adjust as needed)
  if (data.studentId && !/^[A-Z0-9-/]+$/i.test(data.studentId)) {
    errors.push({ field: 'studentId', message: 'Student ID can only contain letters, numbers, hyphens, and slashes' });
  }

  // Year of study validation
  if (data.yearOfStudy && (data.yearOfStudy < 1 || data.yearOfStudy > 6)) {
    errors.push({ field: 'yearOfStudy', message: 'Year of study must be between 1 and 6' });
  }

  // Phone number validation
  if (data.phoneNumber && !/^[\+]?[0-9\s\-\(\)]+$/.test(data.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
  }

  // Check for existing email
  if (data.email) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', data.email)
      .single();
    
    if (existingUser) {
      errors.push({ field: 'email', message: 'A user with this email already exists' });
    }
  }

  // Check for existing username
  if (data.username) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', data.username)
      .single();
    
    if (existingUser) {
      errors.push({ field: 'username', message: 'This username is already taken' });
    }
  }

  // Check for existing student ID
  if (data.studentId) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('studentId')
      .eq('studentId', data.studentId)
      .single();
    
    if (existingUser) {
      errors.push({ field: 'studentId', message: 'This student ID is already registered' });
    }
  }

  return errors;
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each set
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@#$%^&*';
  
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Upload profile photo to Supabase storage
 */
export const uploadProfilePhoto = async (file: File, studentId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return null;
  }
};

/**
 * Send welcome email to new student
 */
export const sendWelcomeEmail = async (
  studentData: CreateStudentData,
  password: string,
  loginUrl: string = window.location.origin
): Promise<boolean> => {
  try {
    // This would typically integrate with an email service
    // For now, we'll just log the email content
    const emailContent = {
      to: studentData.email,
      subject: 'Welcome to TVET Connect Kenya',
      html: `
        <h1>Welcome to TVET Connect Kenya, ${studentData.firstName}!</h1>
        <p>Your student account has been created successfully.</p>
        <h3>Login Details:</h3>
        <p><strong>Username:</strong> ${studentData.username}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p><strong>Student ID:</strong> ${studentData.studentId}</p>
        <p><strong>Course:</strong> ${studentData.course}</p>
        <p><strong>Intake:</strong> ${studentData.intake}</p>
        <p><a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a></p>
        <p><em>Please change your password after your first login for security.</em></p>
        <p>If you have any questions, please contact the registrar's office.</p>
      `
    };

    console.log('Welcome email content:', emailContent);
    
    // TODO: Integrate with actual email service (e.g., SendGrid, AWS SES, etc.)
    // await emailService.send(emailContent);
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Create student with enhanced validation and features
 */
export const createEnhancedStudent = async (
  data: EnhancedStudentData,
  password?: string
): Promise<StudentCreationResult> => {
  try {
    // Validate data
    const validationErrors = await validateStudentData(data);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
        message: 'Please fix the validation errors and try again'
      };
    }

    // Generate password if not provided
    let finalPassword = password;
    if (data.generatePassword || !finalPassword) {
      finalPassword = generateSecurePassword();
    }

    // Upload profile photo if provided
    let profilePhotoUrl: string | undefined;
    if (data.profilePhoto) {
      profilePhotoUrl = await uploadProfilePhoto(data.profilePhoto, data.studentId) || undefined;
    }

    // Prepare student data
    const studentData: CreateStudentData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      username: data.username.trim().toLowerCase(),
      studentId: data.studentId.trim().toUpperCase(),
      course: data.course.trim(),
      yearOfStudy: data.yearOfStudy,
      intake: data.intake.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      address: data.address?.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      emergencyContact: data.emergencyContact
    };

    // Create the student
    const student = await createStudent(studentData, finalPassword!);

    // Update profile with photo URL if uploaded
    if (profilePhotoUrl && student.id) {
      await supabase
        .from('profiles')
        .update({ profile_photo_url: profilePhotoUrl })
        .eq('id', student.id);
    }

    // Send welcome email if requested
    if (data.sendWelcomeEmail) {
      await sendWelcomeEmail(studentData, finalPassword!);
    }

    return {
      success: true,
      studentId: student.id,
      message: `Student ${studentData.firstName} ${studentData.lastName} created successfully`
    };

  } catch (error: any) {
    console.error('Error creating student:', error);
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while creating the student',
      errors: [{ field: 'general', message: error.message || 'Unknown error' }]
    };
  }
};

/**
 * Bulk create students from CSV data
 */
export const bulkCreateStudents = async (
  studentsData: EnhancedStudentData[],
  options: {
    generatePasswords?: boolean;
    sendWelcomeEmails?: boolean;
    continueOnError?: boolean;
  } = {}
): Promise<{
  successful: string[];
  failed: Array<{ data: EnhancedStudentData; error: string }>;
  totalProcessed: number;
}> => {
  const successful: string[] = [];
  const failed: Array<{ data: EnhancedStudentData; error: string }> = [];

  for (const studentData of studentsData) {
    try {
      const result = await createEnhancedStudent({
        ...studentData,
        generatePassword: options.generatePasswords,
        sendWelcomeEmail: options.sendWelcomeEmails
      });

      if (result.success && result.studentId) {
        successful.push(result.studentId);
      } else {
        failed.push({
          data: studentData,
          error: result.message || 'Unknown error'
        });
        
        if (!options.continueOnError) {
          break;
        }
      }
    } catch (error: any) {
      failed.push({
        data: studentData,
        error: error.message || 'Unknown error'
      });
      
      if (!options.continueOnError) {
        break;
      }
    }
  }

  return {
    successful,
    failed,
    totalProcessed: successful.length + failed.length
  };
};

/**
 * Get student creation statistics
 */
export const getStudentCreationStats = async (timeframe: 'week' | 'month' | 'year' = 'month') => {
  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at, course, intake')
    .eq('role', 'student')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  return {
    totalStudents: data?.length || 0,
    studentsByCourse: data?.reduce((acc, student) => {
      acc[student.course] = (acc[student.course] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    studentsByIntake: data?.reduce((acc, student) => {
      acc[student.intake] = (acc[student.intake] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {}
  };
};

/**
 * Enhanced Student Creation Service - Main export
 */
export const EnhancedStudentCreation = {
  validateStudentData,
  generateSecurePassword,
  uploadProfilePhoto,
  sendWelcomeEmail,
  createEnhancedStudent,
  bulkCreateStudents,
  getStudentCreationStats
};

// Also export the interface type alias for convenience
export type EnhancedCreateStudentData = EnhancedStudentData;
