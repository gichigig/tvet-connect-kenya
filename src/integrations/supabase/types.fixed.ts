export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // Keep the existing tables but with fixed syntax
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_verification_hash: {
        Args: { content: string }
        Returns: string
      }
    }
    Enums: {
      domain_type: "science" | "engineering" | "medical"
      exam_type: "quiz" | "midterm" | "final" | "practice"
      experiment_difficulty: "beginner" | "intermediate" | "advanced"
      job_status: "open" | "closed" | "in_review"
      job_type: "internship" | "full_time" | "part_time" | "contract"
      session_type: "lecture" | "tutorial" | "practical"
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
