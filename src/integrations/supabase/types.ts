// Type aliases for enums
type ProctoringEventType = "tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "no_person"
type SeverityLevel = "low" | "medium" | "high"
type ExamType = "quiz" | "midterm" | "final" | "practice"
type DomainType = "science" | "engineering" | "medical"
type JobStatus = "open" | "closed" | "in_review"
type JobType = "internship" | "full_time" | "part_time" | "contract"
type SessionType = "lecture" | "tutorial" | "practical"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// This type is used to define our database schema
export interface Database {
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
  }
}
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      anonymous_feedback: {
        Row: {
          academic_period: string | null
          created_at: string | null
          feedback_text: string
          feedback_type: string
          id: string
          rating: number | null
          sentiment: string | null
          subject_id: string | null
        }
        Insert: {
          academic_period?: string | null
          created_at?: string | null
          feedback_text: string
          feedback_type: "unit" | "lecturer" | "facility" | "general"
          id?: string
          rating?: number | null
          sentiment?: "positive" | "negative" | "neutral" | null
          subject_id?: string | null
        }
        Update: {
          academic_period?: string | null
          created_at?: string | null
          feedback_text?: string
          feedback_type?: "unit" | "lecturer" | "facility" | "general"
          id?: string
          rating?: number | null
          sentiment?: "positive" | "negative" | "neutral" | null
          subject_id?: string | null
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          ai_confidence_score: number | null
          ai_detection_details: Json | null
          ai_detection_status: string
          assignment_id: string
          created_at: string
          feedback: string | null
          file_url: string | null
          final_status: string
          grade: number | null
          human_review_notes: string | null
          human_review_status: string | null
          human_reviewed_at: string | null
          human_reviewer_id: string | null
          id: string
          student_id: string
          student_name: string
          submission_text: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_detection_details?: Json | null
          ai_detection_status?: string
          assignment_id: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          final_status?: string
          grade?: number | null
          human_review_notes?: string | null
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          student_id: string
          student_name: string
          submission_text: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          ai_confidence_score?: number | null
          ai_detection_details?: Json | null
          ai_detection_status?: string
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          final_status?: string
          grade?: number | null
          human_review_notes?: string | null
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          student_id?: string
          student_name?: string
          submission_text?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_sessions: {
        Row: {
          allowed_radius: number | null
          attendance_code: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean
          session_type: "lecture" | "tutorial" | "practical"
          latitude: number | null
          longitude: number | null
          location_required: boolean
          lecturer_id: string
          lecturer_name: string
          session_date: string
          start_time: string
          unit_code: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          allowed_radius?: number | null
          attendance_code?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          lecturer_id: string
          lecturer_name: string
          location_required?: boolean
          longitude?: number | null
          session_date: string
          session_type: "lecture" | "tutorial" | "practical"
          start_time: string
          unit_code: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          allowed_radius?: number | null
          attendance_code?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          lecturer_id?: string
          lecturer_name?: string
          location_required?: boolean
          longitude?: number | null
          session_date?: string
          session_type?: "lecture" | "tutorial" | "practical"
          start_time?: string
          unit_code?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          parent_event_id: string | null
          recurrence_pattern: string | null
          related_resource_id: string | null
          related_resource_type: string | null
          related_unit_code: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_pattern?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          related_unit_code?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_pattern?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          related_unit_code?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_type: string
          created_at: string | null
          description: string | null
          id: string
          issue_date: string
          metadata: Json | null
          pdf_url: string | null
          qr_code: string | null
          student_id: string | null
          title: string
          verification_hash: string | null
        }
        Insert: {
          certificate_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          issue_date: string
          metadata?: Json | null
          pdf_url?: string | null
          qr_code?: string | null
          student_id?: string | null
          title: string
          verification_hash?: string | null
        }
        Update: {
          certificate_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          issue_date?: string
          metadata?: Json | null
          pdf_url?: string | null
          qr_code?: string | null
          student_id?: string | null
          title?: string
          verification_hash?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          created_at: string | null
          id: string
          subject_area: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          subject_area?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subject_area?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          resources: Json | null
          sender: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          resources?: Json | null
          sender: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          resources?: Json | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          name: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      elearning: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          created_at: string | null
          end_time: string | null
          exam_id: string | null
          id: string
          proctoring_flags: Json | null
          start_time: string | null
          status: string | null
          student_id: string | null
          submitted_answers: Json | null
          total_score: number | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          exam_id?: string | null
          id?: string
          proctoring_flags?: Json | null
          start_time?: string | null
          status?: string | null
          student_id?: string | null
          submitted_answers?: Json | null
          total_score?: number | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          exam_id?: string | null
          id?: string
          proctoring_flags?: Json | null
          start_time?: string | null
          status?: string | null
          student_id?: string | null
          submitted_answers?: Json | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "online_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string | null
          id: string
          marks: number
          question_id: string | null
          question_number: number
        }
        Insert: {
          exam_id?: string | null
          id?: string
          marks: number
          question_id?: string | null
          question_number: number
        }
        Update: {
          exam_id?: string | null
          id?: string
          marks?: number
          question_id?: string | null
          question_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "online_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          exam_date: string
          exam_type: string
          grade: string
          id: string
          lecturer_name: string
          max_score: number
          score: number
          semester: number
          status: string
          student_id: string
          student_name: string
          unit_code: string
          unit_name: string
          year: number
        }
        Insert: {
          exam_date: string
          exam_type: string
          grade: string
          id?: string
          lecturer_name: string
          max_score: number
          score: number
          semester: number
          status: string
          student_id: string
          student_name: string
          unit_code: string
          unit_name: string
          year: number
        }
        Update: {
          exam_date?: string
          exam_type?: string
          grade?: string
          id?: string
          lecturer_name?: string
          max_score?: number
          score?: number
          semester?: number
          status?: string
          student_id?: string
          student_name?: string
          unit_code?: string
          unit_name?: string
          year?: number
        }
        Relationships: []
      }
      experiment_attempts: {
        Row: {
          completed_at: string | null
          experiment_id: string
          id: string
          score: number | null
          status: "in_progress" | "completed" | "failed"
          student_id: string
          submission_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          experiment_id: string
          id?: string
          score?: number | null
          status?: "in_progress" | "completed" | "failed"
          student_id: string
          submission_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          experiment_id?: string
          id?: string
          score?: number | null
          status?: "in_progress" | "completed" | "failed"
          student_id?: string
          submission_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_attempts_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      experiments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          lab_id: string | null
          max_score: number | null
          simulation_url: string | null
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          lab_id?: string | null
          max_score?: number | null
          simulation_url?: string | null
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          lab_id?: string | null
          max_score?: number | null
          simulation_url?: string | null
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "virtual_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          application_status: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          job_listing_id: string | null
          resume_url: string | null
          student_id: string | null
        }
        Insert: {
          application_status?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_listing_id?: string | null
          resume_url?: string | null
          student_id?: string | null
        }
        Update: {
          application_status?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_listing_id?: string | null
          resume_url?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          application_deadline: string | null
          company_id: string | null
          created_at: string | null
          description: string
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          minimum_gpa: number | null
          required_skills: string[] | null
          salary_range: unknown | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          company_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          job_type: Database["public"]["Enums"]["job_type"]
          location?: string | null
          minimum_gpa?: number | null
          required_skills?: string[] | null
          salary_range?: unknown | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          minimum_gpa?: number | null
          required_skills?: string[] | null
          salary_range?: unknown | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      online_exams: {
        Row: {
          allow_tab_switch: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          end_time: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_published: boolean | null
          passing_marks: number
          proctoring_enabled: boolean | null
          start_time: string
          title: string
          total_marks: number
          unit_code: string
          webcam_required: boolean | null
        }
        Insert: {
          allow_tab_switch?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          end_time: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean
          passing_marks: number
          proctoring_enabled?: boolean
          start_time: string
          title: string
          total_marks: number
          unit_code: string
          webcam_required?: boolean
        }
        Update: {
          allow_tab_switch?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          end_time?: string
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean
          passing_marks?: number
          proctoring_enabled?: boolean
          start_time?: string
          title?: string
          total_marks?: number
          unit_code?: string
          webcam_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "online_exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_exams_unit_code_fkey"
            columns: ["unit_code"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["code"]
          }
        ]
      }
      pending_unit_registrations: {
        Row: {
          course: string
          id: string
          semester: number
          status: "pending" | "approved" | "rejected"
          student_email: string
          student_id: string
          student_name: string
          submitted_date: string
          unit_code: string
          unit_id: string
          unit_name: string
          year: number
        }
        Insert: {
          course: string
          id?: string
          semester: number
          status?: "pending" | "approved" | "rejected"
          student_email: string
          student_id: string
          student_name: string
          submitted_date?: string
          unit_code: string
          unit_id: string
          unit_name: string
          year: number
        }
        Update: {
          course?: string
          id?: string
          semester?: number
          status?: "pending" | "approved" | "rejected"
          student_email?: string
          student_id?: string
          student_name?: string
          submitted_date?: string
          unit_code?: string
          unit_id?: string
          unit_name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pending_unit_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_unit_registrations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          }
        ]
      }
      proctoring_events: {
        Row: {
          attempt_id: string
          event_data: Json | null
          event_type: "tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "no_person"
          id: string
          severity: "low" | "medium" | "high"
          timestamp: string
        }
        Insert: {
          attempt_id: string
          event_data?: Json | null
          event_type: "tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "no_person"
          id?: string
          severity: "low" | "medium" | "high"
          timestamp?: string
        }
        Update: {
          attempt_id?: string
          event_data?: Json | null
          event_type?: "tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "no_person"
          id?: string
          severity?: "low" | "medium" | "high"
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_events_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          }
        ]
      }
      question_bank: {
        Row: {
          answer_options: Json | null
          correct_answer: string
          created_at: string | null
          created_by: string | null
          difficulty: number | null
          explanation: string | null
          id: string
          question_text: string
          topic: string
          unit_code: string
        }
        Insert: {
          answer_options?: Json | null
          correct_answer: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explanation?: string | null
          id?: string
          question_text: string
          topic: string
          unit_code: string
        }
        Update: {
          answer_options?: Json | null
          correct_answer?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explanation?: string | null
          id?: string
          question_text?: string
          topic?: string
          unit_code?: string
        }
        Relationships: []
      }
      quiz_attendance: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          lecturer_id: string
          questions: Json
          start_time: string | null
          time_limit: number
          title: string
          unit_code: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          lecturer_id: string
          questions: Json
          start_time?: string | null
          time_limit?: number
          title: string
          unit_code: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          lecturer_id?: string
          questions?: Json
          start_time?: string | null
          time_limit?: number
          title?: string
          unit_code?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_sent: boolean | null
          notification_type: string[] | null
          reminder_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          notification_type?: string[] | null
          reminder_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          notification_type?: string[] | null
          reminder_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          attendance_date: string
          attendance_time: string
          attendance_type: string
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          quiz_answers: Json | null
          quiz_id: string | null
          quiz_score: number | null
          session_id: string | null
          status: string
          student_id: string
          student_name: string
          unit_code: string
          unit_name: string
        }
        Insert: {
          attendance_date: string
          attendance_time?: string
          attendance_type: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          quiz_answers?: Json | null
          quiz_id?: string | null
          quiz_score?: number | null
          session_id?: string | null
          status: string
          student_id: string
          student_name: string
          unit_code: string
          unit_name: string
        }
        Update: {
          attendance_date?: string
          attendance_time?: string
          attendance_type?: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          quiz_answers?: Json | null
          quiz_id?: string | null
          quiz_score?: number | null
          session_id?: string | null
          status?: string
          student_id?: string
          student_name?: string
          unit_code?: string
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendance_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quiz_attendance"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_attendance"
            referencedColumns: ["id"]
          },
        ]
      }
      student_job_preferences: {
        Row: {
          desired_locations: string[] | null
          minimum_salary: number | null
          preferred_industries: string[] | null
          preferred_job_types: Database["public"]["Enums"]["job_type"][] | null
          student_id: string
        }
        Insert: {
          desired_locations?: string[] | null
          minimum_salary?: number | null
          preferred_industries?: string[] | null
          preferred_job_types?: Database["public"]["Enums"]["job_type"][] | null
          student_id: string
        }
        Update: {
          desired_locations?: string[] | null
          minimum_salary?: number | null
          preferred_industries?: string[] | null
          preferred_job_types?: Database["public"]["Enums"]["job_type"][] | null
          student_id?: string
        }
        Relationships: []
      }
      transcript_grades: {
        Row: {
          credits: number
          grade: string
          id: string
          lecturer_name: string | null
          points: number | null
          transcript_id: string | null
          unit_code: string
          unit_name: string
        }
        Insert: {
          credits: number
          grade: string
          id?: string
          lecturer_name?: string | null
          points?: number | null
          transcript_id?: string | null
          unit_code: string
          unit_name: string
        }
        Update: {
          credits?: number
          grade?: string
          id?: string
          lecturer_name?: string | null
          points?: number | null
          transcript_id?: string | null
          unit_code?: string
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_grades_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          academic_year: string
          created_at: string | null
          generated_at: string | null
          gpa: number | null
          id: string
          pdf_url: string | null
          qr_code: string | null
          semester: number
          status: string | null
          student_id: string | null
          total_credits: number | null
          verification_hash: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          generated_at?: string | null
          gpa?: number | null
          id?: string
          pdf_url?: string | null
          qr_code?: string | null
          semester: number
          status?: string | null
          student_id?: string | null
          total_credits?: number | null
          verification_hash?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          generated_at?: string | null
          gpa?: number | null
          id?: string
          pdf_url?: string | null
          qr_code?: string | null
          semester?: number
          status?: string | null
          student_id?: string | null
          total_credits?: number | null
          verification_hash?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          admission_number: string | null
          approved: boolean
          blocked: boolean
          course: string | null
          department: string | null
          email: string
          financial_status: string | null
          first_name: string
          id: string
          intake: string | null
          last_name: string
          level: string | null
          phone: string | null
          role: string
          semester: number | null
          total_fees_owed: number | null
          year: number | null
        }
        Insert: {
          admission_number?: string | null
          approved?: boolean
          blocked?: boolean
          course?: string | null
          department?: string | null
          email: string
          financial_status?: string | null
          first_name: string
          id?: string
          intake?: string | null
          last_name: string
          level?: string | null
          phone?: string | null
          role: string
          semester?: number | null
          total_fees_owed?: number | null
          year?: number | null
        }
        Update: {
          admission_number?: string | null
          approved?: boolean
          blocked?: boolean
          course?: string | null
          department?: string | null
          email?: string
          financial_status?: string | null
          first_name?: string
          id?: string
          intake?: string | null
          last_name?: string
          level?: string | null
          phone?: string | null
          role?: string
          semester?: number | null
          total_fees_owed?: number | null
          year?: number | null
        }
        Relationships: []
      }
      virtual_labs: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty:
            | Database["public"]["Enums"]["experiment_difficulty"]
            | null
          domain: Database["public"]["Enums"]["domain_type"]
          id: string
          is_active: boolean | null
          learning_objectives: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["experiment_difficulty"]
            | null
          domain: Database["public"]["Enums"]["domain_type"]
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["experiment_difficulty"]
            | null
          domain?: Database["public"]["Enums"]["domain_type"]
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          title?: string
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
      proctoring_event_type: "tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "no_person"
      severity_level: "low" | "medium" | "high"
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
