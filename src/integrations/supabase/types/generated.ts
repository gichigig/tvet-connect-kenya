export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Existing tables
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          role: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance'
          profile_picture: string | null
          course: string | null
          level: 'certificate' | 'diploma' | null
          admission_number: string | null
          department: string | null
          approved: boolean
          blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          role: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance'
          profile_picture?: string | null
          course?: string | null
          level?: 'certificate' | 'diploma' | null
          admission_number?: string | null
          department?: string | null
          approved?: boolean
          blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          role?: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance'
          profile_picture?: string | null
          course?: string | null
          level?: 'certificate' | 'diploma' | null
          admission_number?: string | null
          department?: string | null
          approved?: boolean
          blocked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          course: string
          year: number
          semester: number
          lecturer_id: string
          lecturer_name: string
          department: string
          credits: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          course: string
          year: number
          semester: number
          lecturer_id: string
          lecturer_name: string
          department: string
          credits: number
          status: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          course?: string
          year?: number
          semester?: number
          lecturer_id?: string
          lecturer_name?: string
          department?: string
          credits?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          type: 'notes' | 'assignment'
          title: string
          description: string | null
          unit_id: string
          unit_code: string
          unit_name: string
          lecturer_id: string
          files: Json | null
          created_at: string
          updated_at: string
          is_visible: boolean
          topic: string | null
          due_date: string | null
          assignment_type: 'file_upload' | 'multiple_choice' | 'question_file' | null
          accepted_formats: string[] | null
          questions: Json | null
        }
        Insert: {
          id?: string
          type: 'notes' | 'assignment'
          title: string
          description?: string | null
          unit_id: string
          unit_code: string
          unit_name: string
          lecturer_id: string
          files?: Json | null
          created_at?: string
          updated_at?: string
          is_visible?: boolean
          topic?: string | null
          due_date?: string | null
          assignment_type?: 'file_upload' | 'multiple_choice' | 'question_file' | null
          accepted_formats?: string[] | null
          questions?: Json | null
        }
        Update: {
          id?: string
          type?: 'notes' | 'assignment'
          title?: string
          description?: string | null
          unit_id?: string
          unit_code?: string
          unit_name?: string
          lecturer_id?: string
          files?: Json | null
          created_at?: string
          updated_at?: string
          is_visible?: boolean
          topic?: string | null
          due_date?: string | null
          assignment_type?: 'file_upload' | 'multiple_choice' | 'question_file' | null
          accepted_formats?: string[] | null
          questions?: Json | null
        }
      }
      assignment_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          student_name: string
          student_email: string
          submitted_at: string
          files: Json | null
          answers: Json | null
          score: number | null
          feedback: string | null
          status: 'pending' | 'graded'
          graded_by: string | null
          graded_at: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          student_name: string
          student_email: string
          submitted_at?: string
          files?: Json | null
          answers?: Json | null
          score?: number | null
          feedback?: string | null
          status?: 'pending' | 'graded'
          graded_by?: string | null
          graded_at?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          student_name?: string
          student_email?: string
          submitted_at?: string
          files?: Json | null
          answers?: Json | null
          score?: number | null
          feedback?: string | null
          status?: 'pending' | 'graded'
          graded_by?: string | null
          graded_at?: string | null
        }
      }
      student_units: {
        Row: {
          id: string
          student_id: string
          unit_id: string
          unit_code: string
          unit_name: string
          status: 'enrolled' | 'completed' | 'failed'
          grade: string | null
          semester: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          unit_id: string
          unit_code: string
          unit_name: string
          status: 'enrolled' | 'completed' | 'failed'
          grade?: string | null
          semester: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          unit_id?: string
          unit_code?: string
          unit_name?: string
          status?: 'enrolled' | 'completed' | 'failed'
          grade?: string | null
          semester?: number
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
