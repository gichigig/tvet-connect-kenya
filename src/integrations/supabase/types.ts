export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          feedback_type: string
          id?: string
          rating?: number | null
          sentiment?: string | null
          subject_id?: string | null
        }
        Update: {
          academic_period?: string | null
          created_at?: string | null
          feedback_text?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          sentiment?: string | null
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
          latitude: number | null
          lecturer_id: string
          lecturer_name: string
          location_required: boolean
          longitude: number | null
          session_date: string
          session_type: string
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
          session_type: string
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
          session_type?: string
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
          experiment_id: string | null
          id: string
          score: number | null
          status: string | null
          student_id: string | null
          submission_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          experiment_id?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
          submission_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          experiment_id?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
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
          is_published?: boolean | null
          passing_marks: number
          proctoring_enabled?: boolean | null
          start_time: string
          title: string
          total_marks: number
          unit_code: string
          webcam_required?: boolean | null
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
          is_published?: boolean | null
          passing_marks?: number
          proctoring_enabled?: boolean | null
          start_time?: string
          title?: string
          total_marks?: number
          unit_code?: string
          webcam_required?: boolean | null
        }
        Relationships: []
      }
      pending_unit_registrations: {
        Row: {
          course: string
          id: string
          semester: number
          status: string
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
          status?: string
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
          status?: string
          student_email?: string
          student_id?: string
          student_name?: string
          submitted_date?: string
          unit_code?: string
          unit_id?: string
          unit_name?: string
          year?: number
        }
        Relationships: []
      }
      proctoring_events: {
        Row: {
          attempt_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          severity: string
          timestamp: string | null
        }
        Insert: {
          attempt_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          severity: string
          timestamp?: string | null
        }
        Update: {
          attempt_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          severity?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_events_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
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
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      domain_type: "science" | "engineering" | "medical"
      exam_type: "quiz" | "midterm" | "final" | "practice"
      experiment_difficulty: "beginner" | "intermediate" | "advanced"
      job_status: "open" | "closed" | "in_review"
      job_type: "internship" | "full_time" | "part_time" | "contract"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      domain_type: ["science", "engineering", "medical"],
      exam_type: ["quiz", "midterm", "final", "practice"],
      experiment_difficulty: ["beginner", "intermediate", "advanced"],
      job_status: ["open", "closed", "in_review"],
      job_type: ["internship", "full_time", "part_time", "contract"],
    },
  },
} as const
