// Supabase profile management functions (migrated from Firebase)
import { supabase } from '../supabase/client';

// Update user email
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user email:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

// Update user phone number
export const updateUserPhoneNumber = async (userId: string, phoneNumber: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        phone_number: phoneNumber,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user phone number:', error);
    throw error;
  }
};

// Save profile with picture
export const saveProfileWithPicture = async (userId: string, profileData: any, pictureFile?: File): Promise<void> => {
  try {
    let profilePictureUrl = profileData.profilePicture;

    // Upload profile picture if provided
    if (pictureFile) {
      const fileExt = pictureFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, pictureFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      profilePictureUrl = urlData.publicUrl;
    }

    // Update profile in database
    const updateData = {
      ...profileData,
      profile_picture: profilePictureUrl,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving profile with picture:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
