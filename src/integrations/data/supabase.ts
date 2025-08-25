import { createClient } from '@supabase/supabase-js'
import { Tables } from '@/lib/supabase-schema'

export interface DataConfig {
  supabaseUrl: string
  supabaseKey: string
}

export class DataService {
  private supabase
  
  constructor(config: DataConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }

  // Users
  async getUser(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Tables['users']
  }

  // Units
  async getUnits(filters?: Partial<Tables['units']>) {
    let query = this.supabase.from('units').select('*')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data as Tables['units'][]
  }

  // Content (Notes & Assignments)
  async getContent(unitId: string) {
    const { data, error } = await this.supabase
      .from('content')
      .select('*')
      .eq('unit_id', unitId)
    
    if (error) throw error
    return data as Tables['content'][]
  }

  async createContent(content: Partial<Tables['content']>) {
    const { data, error } = await this.supabase
      .from('content')
      .insert(content)
      .select()
      .single()
    
    if (error) throw error
    return data as Tables['content']
  }

  // Assignment Submissions
  async getSubmissions(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
    
    if (error) throw error
    return data as Tables['assignment_submissions'][]
  }

  async submitAssignment(submission: Partial<Tables['assignment_submissions']>) {
    const { data, error } = await this.supabase
      .from('assignment_submissions')
      .insert(submission)
      .select()
      .single()
    
    if (error) throw error
    return data as Tables['assignment_submissions']
  }

  // Student Units
  async getStudentUnits(studentId: string) {
    const { data, error } = await this.supabase
      .from('student_units')
      .select('*')
      .eq('student_id', studentId)
    
    if (error) throw error
    return data as Tables['student_units'][]
  }

  // Attendance
  async recordAttendance(attendance: Partial<Tables['student_attendance']>) {
    const { data, error } = await this.supabase
      .from('student_attendance')
      .insert(attendance)
      .select()
      .single()
    
    if (error) throw error
    return data as Tables['student_attendance']
  }

  // Generic CRUD operations
  async create<T extends keyof Tables>(
    table: T,
    data: Partial<Tables[T]>
  ) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result as Tables[T]
  }

  async get<T extends keyof Tables>(
    table: T,
    id: string
  ) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Tables[T]
  }

  async list<T extends keyof Tables>(
    table: T,
    filters?: Partial<Tables[T]>
  ) {
    let query = this.supabase.from(table).select('*')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data as Tables[T][]
  }

  async update<T extends keyof Tables>(
    table: T,
    id: string,
    updates: Partial<Tables[T]>
  ) {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Tables[T]
  }

  async delete<T extends keyof Tables>(
    table: T,
    id: string
  ) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
