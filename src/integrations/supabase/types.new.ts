export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
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
      experiments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lab_id: string | null
          max_score: number
          simulation_url: string | null
          time_limit_minutes: number
          title: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          prerequisites: string[] | null
          learning_outcomes: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lab_id?: string | null
          max_score?: number
          simulation_url?: string | null
          time_limit_minutes?: number
          title: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          prerequisites?: string[] | null
          learning_outcomes?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lab_id?: string | null
          max_score?: number
          simulation_url?: string | null
          time_limit_minutes?: number
          title?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          prerequisites?: string[] | null
          learning_outcomes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "virtual_labs"
            referencedColumns: ["id"]
          }
        ]
      }
      job_applications: {
        Row: {
          application_status: 'pending' | 'under_review' | 'accepted' | 'rejected'
          cover_letter: string | null
          created_at: string
          id: string
          job_listing_id: string
          resume_url: string | null
          student_id: string
          interview_date: string | null
          interview_feedback: string | null
          interview_status: 'scheduled' | 'completed' | 'cancelled' | null
        }
        Insert: {
          application_status?: 'pending' | 'under_review' | 'accepted' | 'rejected'
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_listing_id: string
          resume_url?: string | null
          student_id: string
          interview_date?: string | null
          interview_feedback?: string | null
          interview_status?: 'scheduled' | 'completed' | 'cancelled' | null
        }
        Update: {
          application_status?: 'pending' | 'under_review' | 'accepted' | 'rejected'
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string
          resume_url?: string | null
          student_id?: string
          interview_date?: string | null
          interview_feedback?: string | null
          interview_status?: 'scheduled' | 'completed' | 'cancelled' | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      student_job_preferences: {
        Row: {
          desired_locations: string[]
          minimum_salary: number | null
          preferred_industries: string[]
          preferred_job_types: ('internship' | 'full_time' | 'part_time' | 'contract')[]
          student_id: string
          created_at: string
          updated_at: string
          job_alerts_enabled: boolean
          skills: string[]
          availability_date: string | null
        }
        Insert: {
          desired_locations?: string[]
          minimum_salary?: number | null
          preferred_industries?: string[]
          preferred_job_types?: ('internship' | 'full_time' | 'part_time' | 'contract')[]
          student_id: string
          created_at?: string
          updated_at?: string
          job_alerts_enabled?: boolean
          skills?: string[]
          availability_date?: string | null
        }
        Update: {
          desired_locations?: string[]
          minimum_salary?: number | null
          preferred_industries?: string[]
          preferred_job_types?: ('internship' | 'full_time' | 'part_time' | 'contract')[]
          student_id?: string
          created_at?: string
          updated_at?: string
          job_alerts_enabled?: boolean
          skills?: string[]
          availability_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_job_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_verification_hash: {
        Args: {
          content: string
        }
        Returns: string
      }
    }
    Enums: {
      domain_type: 'science' | 'engineering' | 'medical'
      exam_type: 'quiz' | 'midterm' | 'final' | 'practice'
      experiment_difficulty: 'beginner' | 'intermediate' | 'advanced'
      job_status: 'open' | 'closed' | 'in_review'
      job_type: 'internship' | 'full_time' | 'part_time' | 'contract'
      attendance_type: 'present' | 'absent' | 'late' | 'excused'
      submission_status: 'draft' | 'submitted' | 'late' | 'graded'
      verification_status: 'pending' | 'verified' | 'rejected'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
