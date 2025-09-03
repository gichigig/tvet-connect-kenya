import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  approved: boolean;
  createdAt: string;
  lastLoginAt?: string;
  username?: string;
  admissionNumber?: string;
  course?: string;
  department?: string;
  level?: string;
  year?: number;
  semester?: number;
  academicYear?: string;
  profileComplete: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance';
  phoneNumber?: string;
  username?: string;
  // Student-specific fields
  course?: string;
  department?: string;
  level?: 'certificate' | 'diploma' | 'degree';
  year?: number;
  semester?: number;
  academicYear?: string;
  enrollmentType?: 'fulltime' | 'parttime' | 'online';
  institutionBranch?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;
  private authStateListeners: Set<(authState: AuthState) => void> = new Set();
  private currentAuthState: AuthState = {
    user: null,
    session: null,
    loading: true,
    error: null
  };
  public supabase = supabase; // Expose supabase client for external use

  private constructor() {
    this.initializeAuth();
    this.setupAuthListener();
  }

  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  private async initializeAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        this.updateAuthState({ 
          user: null, 
          session: null, 
          loading: false, 
          error: error.message 
        });
        return;
      }

      if (session?.user) {
        const user = await this.loadUserProfile(session.user.id);
        this.updateAuthState({ 
          user, 
          session, 
          loading: false, 
          error: null 
        });
      } else {
        this.updateAuthState({ 
          user: null, 
          session: null, 
          loading: false, 
          error: null 
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.updateAuthState({ 
        user: null, 
        session: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.loadUserProfile(session.user.id);
        this.updateAuthState({ 
          user, 
          session, 
          loading: false, 
          error: null 
        });
      } else if (event === 'SIGNED_OUT') {
        this.updateAuthState({ 
          user: null, 
          session: null, 
          loading: false, 
          error: null 
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Update session but keep user data
        this.updateAuthState({ 
          ...this.currentAuthState,
          session, 
          loading: false 
        });
      }
    });
  }

  private async loadUserProfile(userId: string): Promise<SupabaseUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.warn('Profile not found:', error?.message);
        return null;
      }

      // Transform Supabase profile to SupabaseUser format
      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phoneNumber: profile.phone_number,
        approved: profile.approved || false,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        username: profile.username,
        admissionNumber: profile.admission_number,
        course: profile.course,
        department: profile.department,
        level: profile.level,
        year: profile.year,
        semester: profile.semester,
        academicYear: profile.academic_year,
        profileComplete: this.checkProfileComplete(profile)
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  private checkProfileComplete(profile: any): boolean {
    const requiredFields = ['first_name', 'last_name', 'role'];
    return requiredFields.every(field => profile[field] && profile[field].trim() !== '');
  }

  private updateAuthState(newState: Partial<AuthState>) {
    this.currentAuthState = { ...this.currentAuthState, ...newState };
    this.authStateListeners.forEach(listener => listener(this.currentAuthState));
  }

  // Public API methods
  public getCurrentUser(): SupabaseUser | null {
    return this.currentAuthState.user;
  }

  public getSession(): Session | null {
    return this.currentAuthState.session;
  }

  public isLoading(): boolean {
    return this.currentAuthState.loading;
  }

  public getError(): string | null {
    return this.currentAuthState.error;
  }

  public onAuthStateChange(callback: (authState: AuthState) => void): () => void {
    this.authStateListeners.add(callback);
    // Immediately call with current state
    callback(this.currentAuthState);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  // Authentication methods
  public async signUp(signupData: SignupData): Promise<{
    user: SupabaseUser | null;
    error: string | null;
    needsEmailConfirmation?: boolean;
  }> {
    try {
      console.log('🔐 Creating new user account:', signupData.email, signupData.role);

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            role: signupData.role,
            phone_number: signupData.phoneNumber
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'User creation failed' };
      }

      // Step 2: Create profile
      const profileData = await this.createUserProfile(authData.user.id, signupData);
      
      if (!profileData) {
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut();
        return { user: null, error: 'Profile creation failed' };
      }

      const user: SupabaseUser = {
        id: authData.user.id,
        email: signupData.email,
        role: signupData.role,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phoneNumber: signupData.phoneNumber,
        approved: signupData.role !== 'student', // Auto-approve non-students
        createdAt: new Date().toISOString(),
        username: signupData.username,
        course: signupData.course,
        department: signupData.department,
        level: signupData.level,
        year: signupData.year,
        semester: signupData.semester,
        academicYear: signupData.academicYear,
        profileComplete: true
      };

      return { 
        user, 
        error: null, 
        needsEmailConfirmation: !authData.session 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown signup error' 
      };
    }
  }

  private async createUserProfile(userId: string, signupData: SignupData): Promise<any> {
    try {
      // Generate admission number for students
      let admissionNumber = null;
      if (signupData.role === 'student') {
        admissionNumber = await this.generateAdmissionNumber();
      }

      const profileData = {
        id: userId,
        email: signupData.email,
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        role: signupData.role,
        phone_number: signupData.phoneNumber,
        username: signupData.username,
        approved: signupData.role !== 'student', // Auto-approve non-students
        created_at: new Date().toISOString(),
        admission_number: admissionNumber,
        course: signupData.course,
        department: signupData.department,
        level: signupData.level,
        year: signupData.year,
        semester: signupData.semester,
        academic_year: signupData.academicYear,
        enrollment_type: signupData.enrollmentType,
        institution_branch: signupData.institutionBranch,
        guardian_name: signupData.guardianName,
        guardian_phone: signupData.guardianPhone,
        address: signupData.address,
        national_id: signupData.nationalId,
        date_of_birth: signupData.dateOfBirth,
        gender: signupData.gender
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  private async generateAdmissionNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    
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

  public async signIn(credentials: LoginCredentials): Promise<{
    user: SupabaseUser | null;
    error: string | null;
  }> {
    try {
      console.log('🔐 Signing in user:', credentials.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Sign in failed' };
      }

      console.log('✅ Authentication successful, loading profile...');

      // Try to load user profile
      let user = await this.loadUserProfile(data.user.id);
      
      // If profile doesn't exist, create it automatically
      if (!user) {
        console.log('👤 Profile not found, creating profile for authenticated user...');
        
        const profileData = {
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || 'User',
          last_name: data.user.user_metadata?.last_name || '',
          role: data.user.user_metadata?.role || 'student',
          approved: data.user.user_metadata?.role === 'admin' ? true : false,
          username: data.user.email?.split('@')[0] || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return { user: null, error: 'Failed to create user profile' };
        }

        console.log('✅ Profile created successfully');
        user = await this.loadUserProfile(data.user.id);
      } else {
        // Update last login time for existing profile
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return { user, error: null };

    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown sign in error' 
      };
    }
  }

  public async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown sign out error' };
    }
  }

  public async updateUserProfile(updates: Partial<SupabaseUser>): Promise<{
    user: SupabaseUser | null;
    error: string | null;
  }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { user: null, error: 'No user logged in' };
      }

      // Convert SupabaseUser fields to database column names
      const dbUpdates: any = {};
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.course) dbUpdates.course = updates.course;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.level) dbUpdates.level = updates.level;
      if (updates.year) dbUpdates.year = updates.year;
      if (updates.semester) dbUpdates.semester = updates.semester;
      if (updates.academicYear) dbUpdates.academic_year = updates.academicYear;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { user: null, error: error.message };
      }

      const updatedUser = await this.loadUserProfile(currentUser.id);
      return { user: updatedUser, error: null };

    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown update error' 
      };
    }
  }

  public async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown password reset error' };
    }
  }

  // Admin functions
  public async getAllUsers(): Promise<SupabaseUser[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phoneNumber: profile.phone_number,
        approved: profile.approved || false,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        username: profile.username,
        admissionNumber: profile.admission_number,
        course: profile.course,
        department: profile.department,
        level: profile.level,
        year: profile.year,
        semester: profile.semester,
        academicYear: profile.academic_year,
        profileComplete: this.checkProfileComplete(profile)
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  public async approveUser(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId);

      if (error) {
        console.error('Error approving user:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error approving user:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  public async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      // Delete profile first (auth user will be cleaned up by trigger)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const supabaseAuth = SupabaseAuthService.getInstance();
