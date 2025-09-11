// Firebase config using Supabase implementations (compatibility layer)
import { supabase } from '../supabase/client';

// Export Firebase-compatible objects that use Supabase under the hood
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { user: data.user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return { user: data.user };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  sendPasswordResetEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};

export const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => {
        const { data, error } = await supabase
          .from(name)
          .select('*')
          .eq('id', id)
          .single();
        return { data: () => data, exists: !error };
      },
      set: async (data: any) => {
        const { error } = await supabase
          .from(name)
          .upsert({ ...data, id });
        if (error) throw error;
      },
      update: async (data: any) => {
        const { error } = await supabase
          .from(name)
          .update(data)
          .eq('id', id);
        if (error) throw error;
      },
      delete: async () => {
        const { error } = await supabase
          .from(name)
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
    }),
    get: async () => {
      const { data, error } = await supabase
        .from(name)
        .select('*');
      return { docs: data || [] };
    },
    add: async (data: any) => {
      const { data: result, error } = await supabase
        .from(name)
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { id: result.id };
    }
  })
};

// For backwards compatibility
export const firebaseApp = {
  name: 'supabase-compat',
  options: {}
};
