import { createClient } from '@supabase/supabase-js'
import { Tables } from '@/lib/supabase-schema'

export interface AuthConfig {
  supabaseUrl: string
  supabaseKey: string
}

export class AuthService {
  private supabase
  
  constructor(config: AuthConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }

  async signUp(email: string, password: string, userData: Partial<Tables['users']>) {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    const { error: profileError } = await this.supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        email,
        ...userData
      })

    if (profileError) {
      // Rollback auth creation
      await this.supabase.auth.admin.deleteUser(authData.user!.id)
      throw profileError
    }

    return authData
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async updateUserProfile(userId: string, updates: Partial<Tables['users']>) {
    const { error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    
    if (error) throw error
  }

  getSession() {
    return this.supabase.auth.getSession()
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}
