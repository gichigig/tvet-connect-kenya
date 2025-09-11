import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';

export interface SupabaseUser {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
  departmentId?: string;
  institutionId?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
<<<<<<< HEAD
  login: (identifier: string, password: string) => Promise<SupabaseUser>; // Support username or email
=======
  login: (identifier: string, password: string) => Promise<SupabaseUser>;
>>>>>>> 248ed50 (added tables)
  logout: () => Promise<void>;
  createUser: (userData: any, password: string) => Promise<void>;
  createUserWithBypass: (userData: any) => Promise<void>; // New bypass method
  getAllUsers: () => Promise<SupabaseUser[]>;
  getPendingUsers: () => SupabaseUser[];
  getPendingUnitRegistrations: () => any[];
  updateUnitRegistrationStatus: (registrationId: string, status: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Additional properties for compatibility
  users: SupabaseUser[];
  approveUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>; // Support username or email
  updateProfilePicture: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile from profiles table using admin client to bypass RLS
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profile) {
            setUser({
              id: profile.user_id,
              email: profile.email,
              username: profile.username,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role,
              approved: profile.approved,
              blocked: profile.blocked,
              departmentId: profile.department_id,
              institutionId: profile.institution_id,
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Ã°Å¸â€â€ž Auth state change event:', event);
      console.log('Ã°Å¸â€â€ž Session user:', session?.user?.id);
      console.log('Ã°Å¸â€â€ž Is currently logging in:', isLoggingIn);
      
      // Skip profile fetching if we're in the middle of login process
      if (isLoggingIn) {
        console.log('Ã¢ÂÂ­Ã¯Â¸Â Auth listener: Skipping profile fetch - login in progress');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Ã°Å¸â€œâ€¹ Auth listener: User signed in, fetching profile...');
        
        try {
          console.log('Ã°Å¸â€œâ€¹ Auth listener: Fetching profile for user:', session.user.id);
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Ã¢ÂÅ’ Auth listener: Profile error:', profileError);
            setLoading(false);
            return;
          }
          
          if (profile) {
            console.log('Ã¢Å“â€¦ Auth listener: Profile loaded:', profile);
            const userData = {
              id: profile.user_id,
              email: profile.email,
              username: profile.username,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role,
              approved: profile.approved,
              blocked: profile.blocked,
              departmentId: profile.department_id,
              institutionId: profile.institution_id,
            };
            console.log('Ã°Å¸â€˜Â¤ Auth listener: Setting user data:', userData);
            setUser(userData);
          } else {
            console.log('Ã¢ÂÅ’ Auth listener: No profile found');
          }
        } catch (error) {
          console.error('Ã°Å¸Å¡Â¨ Auth listener: Unexpected error:', error);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('Ã°Å¸â€˜Â¤ Auth listener: User signed out or no session, clearing user');
        setUser(null);
      }
      
      console.log('Ã°Å¸ÂÂ Auth listener: Setting loading to false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string) => {
<<<<<<< HEAD
    console.log('🔐 Starting login process for:', identifier);
    setIsLoggingIn(true);
    
    try {
      // First, try to find user by username or email
      let email = identifier;
      
      // Check if identifier is not an email (doesn't contain @)
      if (!identifier.includes('@')) {
        // Look up email by username
        const { data: profile, error: profileError } = await supabase
=======
    console.log('Ã°Å¸â€Â Starting login process for identifier:', identifier);
    console.log('Ã°Å¸â€Â§ Environment check:');
    console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('- VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
    
    setIsLoggingIn(true);
    
    try {
      let email = identifier;
      
      // If identifier doesn't contain @, it's likely a username - look up the email
      if (!identifier.includes('@')) {
        console.log('Ã°Å¸â€Â Looking up email for username:', identifier);
        const { data: profile, error: lookupError } = await supabaseAdmin
>>>>>>> 248ed50 (added tables)
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
          
<<<<<<< HEAD
        if (profileError || !profile) {
          throw new Error('User not found');
        }
        
        email = profile.email;
        console.log('🔍 Found email for username:', email);
      }
      
=======
        if (lookupError || !profile) {
          console.error('Ã¢ÂÅ’ Username lookup failed:', lookupError);
          throw new Error('Invalid username or password');
        }
        
        email = profile.email;
        console.log('Ã¢Å“â€¦ Found email for username:', email);
      }

      console.log('Ã°Å¸â€â€˜ Attempting auth with email:', email);
>>>>>>> 248ed50 (added tables)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Ã¢ÂÅ’ Auth error:', authError);
        throw new Error(authError.message || 'Invalid credentials');
      }

      if (!authData?.user) {
        console.error('Ã¢ÂÅ’ No user data returned');
        throw new Error('No user data returned');
      }

      console.log('Ã¢Å“â€¦ Authentication successful, user ID:', authData.user.id);

      // Get user profile using admin client to bypass RLS
      console.log('Ã°Å¸â€œâ€¹ Fetching user profile...');
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Ã¢ÂÅ’ Profile error:', profileError);
        throw new Error(`Error loading user profile: ${profileError.message}`);
      }

      if (!profile) {
        console.error('Ã¢ÂÅ’ No profile found');
        throw new Error('User profile not found');
      }

      console.log('Ã¢Å“â€¦ Profile loaded:', profile);

      // Check if user is blocked
      if (profile.blocked) {
        console.error('Ã¢ÂÅ’ User is blocked');
        throw new Error('This account has been blocked. Please contact support.');
      }

      // Check if user is approved
      if (!profile.approved) {
        console.error('Ã¢ÂÅ’ User not approved');
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }

      const userData = {
        id: profile.user_id,
        email: profile.email,
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        approved: profile.approved,
        blocked: profile.blocked,
        departmentId: profile.department_id,
        institutionId: profile.institution_id,
      };

      console.log('Ã°Å¸â€˜Â¤ Setting user data from login function:', userData);
      setUser(userData);
      setLoading(false);
      console.log('Ã¢Å“â€¦ Login complete, user state updated');

      return userData;
    } catch (error) {
      console.error('Ã°Å¸Å¡Â¨ Login error:', error);
      setLoading(false);
      // Clear any existing session on error
      await supabase.auth.signOut();
      setUser(null);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const createUser = async (userData: any, password: string) => {
    console.log('Ã°Å¸â€Â§ Creating user with data:', userData);
    
    // Check if email already exists
    console.log('Ã°Å¸â€Â Checking if email already exists...');
    const { data: existingUser, error: emailCheckError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Ã¢ÂÅ’ Error checking existing email:', emailCheckError);
      throw new Error(`Error checking existing email: ${emailCheckError.message}`);
    }

    if (existingUser) {
      console.error('Ã¢ÂÅ’ Email already exists:', userData.email);
      throw new Error(`A user with email ${userData.email} already exists`);
    }

    // Check if username already exists (if provided)
    if (userData.username) {
      console.log('Ã°Å¸â€Â Checking if username already exists...');
      const { data: existingUsername, error: usernameCheckError } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('username', userData.username)
        .single();

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        console.error('Ã¢ÂÅ’ Error checking existing username:', usernameCheckError);
        throw new Error(`Error checking existing username: ${usernameCheckError.message}`);
      }

      if (existingUsername) {
        console.error('Ã¢ÂÅ’ Username already exists:', userData.username);
        throw new Error(`A user with username ${userData.username} already exists`);
      }
    }
    
    // Use admin client to create user without email verification
    console.log('Ã°Å¸â€œÂ§ Creating user via admin client to bypass email verification...');
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: password,
<<<<<<< HEAD
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          role: userData.role
        }
=======
      email_confirm: true, // This bypasses email verification
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username
>>>>>>> 248ed50 (added tables)
      }
    });

    if (authError) {
      console.error('Ã¢ÂÅ’ Admin user creation error:', authError);
      throw new Error(authError.message);
    }

<<<<<<< HEAD
    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: userData.email,
          username: userData.username,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          course: userData.course,
          department: userData.department,
          phone: userData.phone,
          approved: true, // Auto-approve
          blocked: false
        });
=======
    if (!authData.user) {
      throw new Error('No user data returned from admin user creation');
    }

    console.log('Ã¢Å“â€¦ Admin user created:', authData.user.id);
    console.log('Ã¢Å“â€¦ Email verification bypassed - user can login immediately');

    // Check if profile already exists (might be created by trigger)
    console.log('Ã°Å¸â€Â Checking if profile already exists...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no profile exists
      console.error('Ã¢ÂÅ’ Error checking existing profile:', checkError);
      throw new Error(`Error checking existing profile: ${checkError.message}`);
    }

    if (existingProfile) {
      console.log('Ã°Å¸â€œâ€¹ Profile already exists, updating it...');
      
      // Update existing profile with the provided data
      const updateData = {
        email: userData.email,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        phone: userData.phone || '',
        approved: true,
        blocked: false,
        ...(userData.role === 'student' && {
          course: userData.course,
          department: userData.department,
        })
      };

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('user_id', authData.user.id);

      if (updateError) {
        console.error('Ã¢ÂÅ’ Profile update error:', updateError);
        // Cleanup auth user if profile update fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Ã¢ÂÅ’ Failed to cleanup auth user:', cleanupError);
        }
        throw new Error(`Error updating user profile: ${updateError.message}`);
      }

      console.log('Ã¢Å“â€¦ Profile updated successfully');
    } else {
      console.log('Ã°Å¸â€œâ€¹ Creating new profile...');
      
      // Create profile with all required fields
      const profileData = {
        user_id: authData.user.id,
        email: userData.email,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        phone: userData.phone || '',
        approved: true, // Auto-approve users created by admin/registrar
        blocked: false,
        ...(userData.role === 'student' && {
          course: userData.course,
          department: userData.department,
        })
      };

      console.log('Ã°Å¸â€œâ€¹ Creating profile with data:', profileData);

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData);
>>>>>>> 248ed50 (added tables)

      if (profileError) {
        console.error('Ã¢ÂÅ’ Profile creation error:', profileError);
        // If profile creation fails, we should clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Ã¢ÂÅ’ Failed to cleanup auth user:', cleanupError);
        }
        throw new Error(`Error creating user profile: ${profileError.message}`);
      }

      console.log('Ã¢Å“â€¦ Profile created successfully');
    }

    console.log('Ã¢Å“â€¦ User created successfully with username:', userData.username);
  };

  const createUserWithBypass = async (userData: any) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            role: userData.role
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Use the bypass function to create profile with admin privileges
        const { data, error: functionError } = await supabase.rpc('create_user_with_bypass', {
          p_email: userData.email,
          p_username: userData.username,
          p_first_name: userData.firstName,
          p_last_name: userData.lastName,
          p_role: userData.role,
          p_course: userData.course || null,
          p_department: userData.department || null,
          p_phone: userData.phone || null,
          p_approved: true
        });

        if (functionError) {
          // If profile creation fails, clean up the auth user
          await supabase.auth.signOut();
          throw new Error(functionError.message);
        }

        // Refresh users list
        await getAllUsers();
      }
    } catch (error) {
      console.error('Error creating user with bypass:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<SupabaseUser[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*');
    
    if (error) {
      throw new Error(error.message);
    }

    const usersList = data?.map(profile => ({
      id: profile.user_id,
      email: profile.email,
      username: profile.username,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      approved: profile.approved,
      blocked: profile.blocked,
      departmentId: profile.department_id,
      institutionId: profile.institution_id,
    })) || [];

    setUsers(usersList);
    return usersList;
  };

  const getPendingUsers = (): SupabaseUser[] => {
    return users.filter(user => !user.approved);
  };

  const getPendingUnitRegistrations = (): any[] => {
    // For now, return empty array. This would need to be implemented
    // when unit registration functionality is added
    return [];
  };

  const updateUnitRegistrationStatus = async (registrationId: string, status: string): Promise<void> => {
    // For now, just log. This would need to be implemented
    // when unit registration functionality is added
    console.log(`Updating unit registration ${registrationId} to status: ${status}`);
  };

  const approveUser = async (userId: string) => {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ approved: true })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Refresh users list
    await getAllUsers();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Refresh users list
    await getAllUsers();
  };

  const signIn = async (identifier: string, password: string) => {
    const result = await login(identifier, password);
    if (!result) {
      throw new Error('Login failed');
    }
  };

  const updateProfilePicture = async (file: File) => {
    // Mock implementation - just log for now
    console.log('Profile picture update requested:', file.name);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    createUser,
    createUserWithBypass,
    getAllUsers,
    getPendingUsers,
    getPendingUnitRegistrations,
    updateUnitRegistrationStatus,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'registrar',
    users,
    approveUser,
    deleteUser,
    signIn,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};