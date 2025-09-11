export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_calendar: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_public: boolean | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          is_public?: boolean | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_public?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_calendar_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_progress: {
        Row: {
          academic_standing: string | null
          academic_year_id: string | null
          calculated_at: string | null
          calculated_by: string | null
          created_at: string | null
          cumulative_gpa: number | null
          expected_graduation_date: string | null
          id: string
          progress_percentage: number | null
          student_id: string
          total_credits_attempted: number | null
          total_credits_earned: number | null
          updated_at: string | null
        }
        Insert: {
          academic_standing?: string | null
          academic_year_id?: string | null
          calculated_at?: string | null
          calculated_by?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          expected_graduation_date?: string | null
          id?: string
          progress_percentage?: number | null
          student_id: string
          total_credits_attempted?: number | null
          total_credits_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_standing?: string | null
          academic_year_id?: string | null
          calculated_at?: string | null
          calculated_by?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          expected_graduation_date?: string | null
          id?: string
          progress_percentage?: number | null
          student_id?: string
          total_credits_attempted?: number | null
          total_credits_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_progress_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_standings: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          effective_date: string
          gpa: number | null
          id: string
          reason: string | null
          review_date: string | null
          semester_id: string | null
          standing: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          effective_date: string
          gpa?: number | null
          id?: string
          reason?: string | null
          review_date?: string | null
          semester_id?: string | null
          standing: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          effective_date?: string
          gpa?: number | null
          id?: string
          reason?: string | null
          review_date?: string | null
          semester_id?: string | null
          standing?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_standings_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_standings_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_standings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_current: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      admission_decisions: {
        Row: {
          applicant_response: string | null
          application_id: string
          conditions: string | null
          created_at: string | null
          decided_by: string
          decision: string
          decision_date: string
          id: string
          offer_expiry_date: string | null
          response_date: string | null
          response_deadline: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_response?: string | null
          application_id: string
          conditions?: string | null
          created_at?: string | null
          decided_by: string
          decision: string
          decision_date: string
          id?: string
          offer_expiry_date?: string | null
          response_date?: string | null
          response_deadline?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_response?: string | null
          application_id?: string
          conditions?: string | null
          created_at?: string | null
          decided_by?: string
          decision?: string
          decision_date?: string
          id?: string
          offer_expiry_date?: string | null
          response_date?: string | null
          response_deadline?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admission_decisions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_requirements: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          minimum_score: number | null
          requirement_name: string
          requirement_type: string
          updated_at: string | null
          weight_percentage: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          minimum_score?: number | null
          requirement_name: string
          requirement_type: string
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          minimum_score?: number | null
          requirement_name?: string
          requirement_type?: string
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          created_at: string | null
          date_recorded: string
          dimensions: Json | null
          hour_recorded: number | null
          id: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          date_recorded: string
          dimensions?: Json | null
          hour_recorded?: number | null
          id?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          date_recorded?: string
          dimensions?: Json | null
          hour_recorded?: number | null
          id?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      announcements: {
        Row: {
          announcement_type: string | null
          attachments: Json | null
          content: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_published: boolean | null
          priority: string | null
          published_at: string | null
          target_audience: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          attachments?: Json | null
          content: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_audience: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          attachments?: Json | null
          content?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_audience?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          created_at: string | null
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string | null
          id: string
          upload_date: string | null
          verification_date: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          document_name: string
          document_type: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          upload_date?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          upload_date?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_email: string
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone: string | null
          application_date: string
          application_number: string
          application_status: string | null
          course_id: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          id: string
          intake_period_id: string | null
          nationality: string | null
          previous_education: Json | null
          review_date: string | null
          review_notes: string | null
          reviewed_by: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_email: string
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone?: string | null
          application_date: string
          application_number: string
          application_status?: string | null
          course_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          intake_period_id?: string | null
          nationality?: string | null
          previous_education?: Json | null
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_email?: string
          applicant_first_name?: string
          applicant_last_name?: string
          applicant_phone?: string | null
          application_date?: string
          application_number?: string
          application_status?: string | null
          course_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          intake_period_id?: string | null
          nationality?: string | null
          previous_education?: Json | null
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_intake_period_id_fkey"
            columns: ["intake_period_id"]
            isOneToOne: false
            referencedRelation: "intake_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          ai_detection_score: number | null
          ai_detection_status: string | null
          assignment_id: string
          final_status: string | null
          human_review_notes: string | null
          human_review_status: string | null
          human_reviewed_at: string | null
          human_reviewer_id: string | null
          id: string
          student_id: string
          student_name: string
          submission_text: string
          submitted_at: string
        }
        Insert: {
          ai_detection_score?: number | null
          ai_detection_status?: string | null
          assignment_id: string
          final_status?: string | null
          human_review_notes?: string | null
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          student_id: string
          student_name: string
          submission_text: string
          submitted_at?: string
        }
        Update: {
          ai_detection_score?: number | null
          ai_detection_status?: string | null
          assignment_id?: string
          final_status?: string | null
          human_review_notes?: string | null
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          student_id?: string
          student_name?: string
          submission_text?: string
          submitted_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assignment_type: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          instructions: string | null
          is_group_assignment: boolean | null
          late_submission_penalty: number | null
          lecturer_id: string | null
          max_group_size: number | null
          rubric: Json | null
          status: string | null
          submission_format: string | null
          title: string
          total_marks: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean | null
          late_submission_penalty?: number | null
          lecturer_id?: string | null
          max_group_size?: number | null
          rubric?: Json | null
          status?: string | null
          submission_format?: string | null
          title: string
          total_marks: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean | null
          late_submission_penalty?: number | null
          lecturer_id?: string | null
          max_group_size?: number | null
          rubric?: Json | null
          status?: string | null
          submission_format?: string | null
          title?: string
          total_marks?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          attendance_date: string
          check_in_time: string | null
          check_out_time: string | null
          class_schedule_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          recorded_by: string | null
          status: string
          student_id: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          check_in_time?: string | null
          check_out_time?: string | null
          class_schedule_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status: string
          student_id: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          class_schedule_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          created_at: string | null
          end_time: string | null
          error_message: string | null
          file_location: string | null
          file_size_bytes: number | null
          id: string
          initiated_by: string | null
          start_time: string
          status: string
        }
        Insert: {
          backup_type: string
          created_at?: string | null
          end_time?: string | null
          error_message?: string | null
          file_location?: string | null
          file_size_bytes?: number | null
          id?: string
          initiated_by?: string | null
          start_time: string
          status: string
        }
        Update: {
          backup_type?: string
          created_at?: string | null
          end_time?: string | null
          error_message?: string | null
          file_location?: string | null
          file_size_bytes?: number | null
          id?: string
          initiated_by?: string | null
          start_time?: string
          status?: string
        }
        Relationships: []
      }
      book_borrowings: {
        Row: {
          book_id: string
          borrowed_date: string
          created_at: string | null
          due_date: string
          id: string
          renewed_count: number | null
          returned_date: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          book_id: string
          borrowed_date: string
          created_at?: string | null
          due_date: string
          id?: string
          renewed_count?: number | null
          returned_date?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          borrowed_date?: string
          created_at?: string | null
          due_date?: string
          id?: string
          renewed_count?: number | null
          returned_date?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_borrowings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_borrowings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_allocations: {
        Row: {
          academic_year_id: string | null
          allocated_amount: number
          approval_date: string | null
          approved_by: string | null
          category: string
          created_at: string | null
          department_id: string | null
          id: string
          remaining_amount: number | null
          spent_amount: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          allocated_amount: number
          approval_date?: string | null
          approved_by?: string | null
          category: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          remaining_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          allocated_amount?: number
          approval_date?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          remaining_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          location: string | null
          related_unit_code: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          location?: string | null
          related_unit_code?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          location?: string | null
          related_unit_code?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          classification: string | null
          course_id: string | null
          created_at: string | null
          digital_signature: string | null
          gpa: number | null
          id: string
          is_revoked: boolean | null
          issued_by: string
          issued_date: string
          revoked_reason: string | null
          student_id: string
          updated_at: string | null
          verification_code: string | null
        }
        Insert: {
          certificate_number: string
          certificate_type: string
          classification?: string | null
          course_id?: string | null
          created_at?: string | null
          digital_signature?: string | null
          gpa?: number | null
          id?: string
          is_revoked?: boolean | null
          issued_by: string
          issued_date: string
          revoked_reason?: string | null
          student_id: string
          updated_at?: string | null
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          classification?: string | null
          course_id?: string | null
          created_at?: string | null
          digital_signature?: string | null
          gpa?: number | null
          id?: string
          is_revoked?: boolean | null
          issued_by?: string
          issued_date?: string
          revoked_reason?: string | null
          student_id?: string
          updated_at?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_type: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_recurring: boolean | null
          lecturer_id: string | null
          max_students: number | null
          semester_id: string | null
          start_time: string
          unit_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          class_type?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          lecturer_id?: string | null
          max_students?: number | null
          semester_id?: string | null
          start_time: string
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          class_type?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          lecturer_id?: string | null
          max_students?: number | null
          semester_id?: string | null
          start_time?: string
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          accepted_formats: string[] | null
          assignment_type: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          files: Json | null
          id: string
          is_visible: boolean | null
          lecturer_id: string
          questions: Json | null
          title: string
          topic: string | null
          type: string
          unit_code: string
          unit_id: string
          unit_name: string
          updated_at: string | null
        }
        Insert: {
          accepted_formats?: string[] | null
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          files?: Json | null
          id?: string
          is_visible?: boolean | null
          lecturer_id: string
          questions?: Json | null
          title: string
          topic?: string | null
          type: string
          unit_code: string
          unit_id: string
          unit_name: string
          updated_at?: string | null
        }
        Update: {
          accepted_formats?: string[] | null
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          files?: Json | null
          id?: string
          is_visible?: boolean | null
          lecturer_id?: string
          questions?: Json | null
          title?: string
          topic?: string | null
          type?: string
          unit_code?: string
          unit_id?: string
          unit_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      continuous_assessments: {
        Row: {
          assessment_date: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          semester_id: string | null
          status: string | null
          title: string
          total_marks: number
          unit_id: string | null
          updated_at: string | null
          weight_percentage: number
        }
        Insert: {
          assessment_date: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          semester_id?: string | null
          status?: string | null
          title: string
          total_marks: number
          unit_id?: string | null
          updated_at?: string | null
          weight_percentage: number
        }
        Update: {
          assessment_date?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          semester_id?: string | null
          status?: string | null
          title?: string
          total_marks?: number
          unit_id?: string | null
          updated_at?: string | null
          weight_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "continuous_assessments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      course_approvals: {
        Row: {
          comments: string | null
          course_id: string | null
          created_at: string | null
          id: string
          review_date: string | null
          reviewed_by: string | null
          status: string | null
          submission_date: string
          submitted_by: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date: string
          submitted_by: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string
          submitted_by?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_units: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_core: boolean | null
          semester: number
          unit_id: string | null
          year: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_core?: boolean | null
          semester: number
          unit_id?: string | null
          year: number
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_core?: boolean | null
          semester?: number
          unit_id?: string | null
          year?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transfers: {
        Row: {
          created_at: string | null
          credits: number
          equivalent_unit_id: string | null
          evaluated_by: string | null
          evaluation_date: string | null
          evaluation_notes: string | null
          grade_received: string | null
          id: string
          source_institution: string
          student_id: string
          transfer_status: string | null
          unit_code: string | null
          unit_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits: number
          equivalent_unit_id?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_notes?: string | null
          grade_received?: string | null
          id?: string
          source_institution: string
          student_id: string
          transfer_status?: string | null
          unit_code?: string | null
          unit_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          equivalent_unit_id?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_notes?: string | null
          grade_received?: string | null
          id?: string
          source_institution?: string
          student_id?: string
          transfer_status?: string | null
          unit_code?: string | null
          unit_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transfers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_versions: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          effective_date: string
          id: string
          is_current: boolean | null
          updated_at: string | null
          version_number: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          effective_date: string
          id?: string
          is_current?: boolean | null
          updated_at?: string | null
          version_number: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          is_current?: boolean | null
          updated_at?: string | null
          version_number?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          configuration: Json
          created_at: string | null
          height: number | null
          id: string
          is_visible: boolean | null
          position_x: number | null
          position_y: number | null
          updated_at: string | null
          user_id: string
          widget_title: string
          widget_type: string
          width: number | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          user_id: string
          widget_title: string
          widget_type: string
          width?: number | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          user_id?: string
          widget_title?: string
          widget_type?: string
          width?: number | null
        }
        Relationships: []
      }
      department_heads: {
        Row: {
          appointed_by: string | null
          created_at: string | null
          department_id: string | null
          end_date: string | null
          head_id: string
          id: string
          is_active: boolean | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          appointed_by?: string | null
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          head_id: string
          id?: string
          is_active?: boolean | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          appointed_by?: string | null
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          head_id?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      digital_resources: {
        Row: {
          access_level: string | null
          access_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_concurrent_users: number | null
          provider: string | null
          resource_type: string
          subject_areas: string[] | null
          subscription_end: string | null
          subscription_start: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          access_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_users?: number | null
          provider?: string | null
          resource_type: string
          subject_areas?: string[] | null
          subscription_end?: string | null
          subscription_start?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          access_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_users?: number | null
          provider?: string | null
          resource_type?: string
          subject_areas?: string[] | null
          subscription_end?: string | null
          subscription_start?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          sender_email: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_name: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          sender_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_name?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sender_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_name?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          error_level: string
          error_message: string
          id: string
          ip_address: unknown | null
          request_url: string | null
          stack_trace: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          error_level: string
          error_message: string
          id?: string
          ip_address?: unknown | null
          request_url?: string | null
          stack_trace?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          error_level?: string
          error_message?: string
          id?: string
          ip_address?: unknown | null
          request_url?: string | null
          stack_trace?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string | null
          grade: string | null
          id: string
          marked_at: string | null
          marked_by: string | null
          marks_obtained: number
          remarks: string | null
          status: string | null
          student_exam_registration_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          grade?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          marks_obtained: number
          remarks?: string | null
          status?: string | null
          student_exam_registration_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          grade?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          marks_obtained?: number
          remarks?: string | null
          status?: string | null
          student_exam_registration_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_student_exam_registration_id_fkey"
            columns: ["student_exam_registration_id"]
            isOneToOne: false
            referencedRelation: "student_exam_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_schedules: {
        Row: {
          created_at: string | null
          end_time: string
          exam_date: string
          exam_id: string
          id: string
          invigilator_id: string | null
          max_students: number | null
          special_instructions: string | null
          start_time: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          exam_date: string
          exam_id: string
          id?: string
          invigilator_id?: string | null
          max_students?: number | null
          special_instructions?: string | null
          start_time: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          exam_date?: string
          exam_id?: string
          id?: string
          invigilator_id?: string | null
          max_students?: number | null
          special_instructions?: string | null
          start_time?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedules_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          created_by: string
          duration_minutes: number
          exam_type: string
          id: string
          instructions: string | null
          semester_id: string
          status: string | null
          title: string
          total_marks: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          duration_minutes: number
          exam_type: string
          id?: string
          instructions?: string | null
          semester_id: string
          status?: string | null
          title: string
          total_marks: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          duration_minutes?: number
          exam_type?: string
          id?: string
          instructions?: string | null
          semester_id?: string
          status?: string | null
          title?: string
          total_marks?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      expenditures: {
        Row: {
          amount: number
          approval_date: string | null
          approved_by: string | null
          budget_allocation_id: string | null
          category: string | null
          created_at: string | null
          description: string
          expense_date: string
          id: string
          receipt_number: string | null
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          approval_date?: string | null
          approved_by?: string | null
          budget_allocation_id?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          expense_date: string
          id?: string
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          approval_date?: string | null
          approved_by?: string | null
          budget_allocation_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          expense_date?: string
          id?: string
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenditures_budget_allocation_id_fkey"
            columns: ["budget_allocation_id"]
            isOneToOne: false
            referencedRelation: "budget_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lab_id: string
          results: Json | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lab_id: string
          results?: Json | null
          started_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lab_id?: string
          results?: Json | null
          started_at?: string | null
          status?: string
          user_id?: string
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
      fee_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method_id: string | null
          processed_by: string | null
          status: string | null
          student_fee_id: string
          student_id: string
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method_id?: string | null
          processed_by?: string | null
          status?: string | null
          student_fee_id: string
          student_id: string
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method_id?: string | null
          processed_by?: string | null
          status?: string | null
          student_fee_id?: string
          student_id?: string
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string | null
          activity_fee: number | null
          course_id: string | null
          created_at: string | null
          examination_fee: number | null
          id: string
          installment_plan: boolean | null
          installments: Json | null
          is_active: boolean | null
          level: string | null
          library_fee: number | null
          other_fees: Json | null
          registration_fee: number | null
          technology_fee: number | null
          total_fee: number
          tuition_fee: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          activity_fee?: number | null
          course_id?: string | null
          created_at?: string | null
          examination_fee?: number | null
          id?: string
          installment_plan?: boolean | null
          installments?: Json | null
          is_active?: boolean | null
          level?: string | null
          library_fee?: number | null
          other_fees?: Json | null
          registration_fee?: number | null
          technology_fee?: number | null
          total_fee: number
          tuition_fee: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          activity_fee?: number | null
          course_id?: string | null
          created_at?: string | null
          examination_fee?: number | null
          id?: string
          installment_plan?: boolean | null
          installments?: Json | null
          is_active?: boolean | null
          level?: string | null
          library_fee?: number | null
          other_fees?: Json | null
          registration_fee?: number | null
          technology_fee?: number | null
          total_fee?: number
          tuition_fee?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_waivers: {
        Row: {
          academic_year_id: string | null
          amount: number
          approval_date: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          percentage: number | null
          reason: string
          semester_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
          waiver_type: string
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          percentage?: number | null
          reason: string
          semester_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
          waiver_type: string
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          percentage?: number | null
          reason?: string
          semester_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
          waiver_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_waivers_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      final_grades: {
        Row: {
          academic_year_id: string
          approved_at: string | null
          approved_by: string | null
          calculated_at: string | null
          calculated_by: string | null
          continuous_assessment_marks: number | null
          created_at: string | null
          exam_marks: number | null
          final_grade: string
          grade_points: number | null
          id: string
          is_supplementary: boolean | null
          semester_id: string
          status: string | null
          student_id: string
          total_marks: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          calculated_by?: string | null
          continuous_assessment_marks?: number | null
          created_at?: string | null
          exam_marks?: number | null
          final_grade: string
          grade_points?: number | null
          id?: string
          is_supplementary?: boolean | null
          semester_id: string
          status?: string | null
          student_id: string
          total_marks: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          calculated_by?: string | null
          continuous_assessment_marks?: number | null
          created_at?: string | null
          exam_marks?: number | null
          final_grade?: string
          grade_points?: number | null
          id?: string
          is_supplementary?: boolean | null
          semester_id?: string
          status?: string | null
          student_id?: string
          total_marks?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "final_grades_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_grades_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_aid: {
        Row: {
          academic_year_id: string | null
          aid_type: string
          amount: number
          awarded_date: string | null
          conditions: string | null
          created_at: string | null
          description: string | null
          disbursement_schedule: Json | null
          expiry_date: string | null
          id: string
          provider: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          aid_type: string
          amount: number
          awarded_date?: string | null
          conditions?: string | null
          created_at?: string | null
          description?: string | null
          disbursement_schedule?: Json | null
          expiry_date?: string | null
          id?: string
          provider?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          aid_type?: string
          amount?: number
          awarded_date?: string | null
          conditions?: string | null
          created_at?: string | null
          description?: string | null
          disbursement_schedule?: Json | null
          expiry_date?: string | null
          id?: string
          provider?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_aid_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_aid_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_scales: {
        Row: {
          created_at: string | null
          description: string | null
          grade: string
          grade_point: number | null
          id: string
          is_active: boolean | null
          is_passing: boolean | null
          max_score: number
          min_score: number
          name: string
          scale_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grade: string
          grade_point?: number | null
          id?: string
          is_active?: boolean | null
          is_passing?: boolean | null
          max_score: number
          min_score: number
          name: string
          scale_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grade?: string
          grade_point?: number | null
          id?: string
          is_active?: boolean | null
          is_passing?: boolean | null
          max_score?: number
          min_score?: number
          name?: string
          scale_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          academic_year_id: string | null
          assessment_id: string | null
          assessment_type: string
          comments: string | null
          created_at: string | null
          grade: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_final: boolean | null
          marks_obtained: number
          percentage: number | null
          semester_id: string | null
          student_id: string
          total_marks: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          assessment_id?: string | null
          assessment_type: string
          comments?: string | null
          created_at?: string | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_final?: boolean | null
          marks_obtained: number
          percentage?: number | null
          semester_id?: string | null
          student_id: string
          total_marks: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          assessment_id?: string | null
          assessment_type?: string
          comments?: string | null
          created_at?: string | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_final?: boolean | null
          marks_obtained?: number
          percentage?: number | null
          semester_id?: string | null
          student_id?: string
          total_marks?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      graduation_requirements: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          minimum_value: number
          requirement_name: string
          requirement_type: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_value: number
          requirement_name: string
          requirement_type: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_value?: number
          requirement_name?: string
          requirement_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hostel_fees: {
        Row: {
          academic_year_id: string | null
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_amount: number | null
          room_allocation_id: string
          semester_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_amount?: number | null
          room_allocation_id: string
          semester_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_amount?: number | null
          room_allocation_id?: string
          semester_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_fees_room_allocation_id_fkey"
            columns: ["room_allocation_id"]
            isOneToOne: false
            referencedRelation: "room_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_fees_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          created_at: string | null
          current_occupancy: number | null
          facilities: string[] | null
          gender_restriction: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          rules_regulations: string | null
          total_capacity: number
          updated_at: string | null
          warden_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_occupancy?: number | null
          facilities?: string[] | null
          gender_restriction?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          rules_regulations?: string | null
          total_capacity: number
          updated_at?: string | null
          warden_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_occupancy?: number | null
          facilities?: string[] | null
          gender_restriction?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          rules_regulations?: string | null
          total_capacity?: number
          updated_at?: string | null
          warden_id?: string | null
        }
        Relationships: []
      }
      institution_branches: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          location: string | null
          manager_id: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          location?: string | null
          manager_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          location?: string | null
          manager_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_branches_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          established_date: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      intake_periods: {
        Row: {
          academic_year_id: string
          application_deadline: string | null
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_students: number | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          application_deadline?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          application_deadline?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_periods_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturer_attendance: {
        Row: {
          attendance_date: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          id: string
          lecturer_id: string
          notes: string | null
          recorded_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          lecturer_id: string
          notes?: string | null
          recorded_by?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          lecturer_id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecturer_attendance_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturer_qualifications: {
        Row: {
          created_at: string | null
          field_of_study: string | null
          id: string
          institution: string
          is_verified: boolean | null
          lecturer_id: string
          qualification_name: string
          qualification_type: string
          year_obtained: number | null
        }
        Insert: {
          created_at?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          is_verified?: boolean | null
          lecturer_id: string
          qualification_name: string
          qualification_type: string
          year_obtained?: number | null
        }
        Update: {
          created_at?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          is_verified?: boolean | null
          lecturer_id?: string
          qualification_name?: string
          qualification_type?: string
          year_obtained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lecturer_qualifications_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturer_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          lecturer_id: string
          semester_id: string
          start_time: string
          unit_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          lecturer_id: string
          semester_id: string
          start_time: string
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          lecturer_id?: string
          semester_id?: string
          start_time?: string
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecturer_schedules_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecturer_schedules_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturer_specializations: {
        Row: {
          competency_level: string | null
          created_at: string | null
          id: string
          lecturer_id: string
          subject_area: string
          years_experience: number | null
        }
        Insert: {
          competency_level?: string | null
          created_at?: string | null
          id?: string
          lecturer_id: string
          subject_area: string
          years_experience?: number | null
        }
        Update: {
          competency_level?: string | null
          created_at?: string | null
          id?: string
          lecturer_id?: string
          subject_area?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lecturer_specializations_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturers: {
        Row: {
          created_at: string | null
          department_id: string | null
          employee_number: string
          employment_type: string | null
          hire_date: string
          id: string
          is_active: boolean | null
          office_hours: string | null
          office_location: string | null
          position: string | null
          salary: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          employee_number: string
          employment_type?: string | null
          hire_date: string
          id?: string
          is_active?: boolean | null
          office_hours?: string | null
          office_location?: string | null
          position?: string | null
          salary?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          employee_number?: string
          employment_type?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean | null
          office_hours?: string | null
          office_location?: string | null
          position?: string | null
          salary?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      library_books: {
        Row: {
          acquisition_date: string | null
          author: string
          available_copies: number | null
          category: string | null
          created_at: string | null
          id: string
          isbn: string | null
          location: string | null
          price: number | null
          publication_year: number | null
          publisher: string | null
          status: string | null
          subject_area: string | null
          title: string
          total_copies: number | null
          updated_at: string | null
        }
        Insert: {
          acquisition_date?: string | null
          author: string
          available_copies?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          isbn?: string | null
          location?: string | null
          price?: number | null
          publication_year?: number | null
          publisher?: string | null
          status?: string | null
          subject_area?: string | null
          title: string
          total_copies?: number | null
          updated_at?: string | null
        }
        Update: {
          acquisition_date?: string | null
          author?: string
          available_copies?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          isbn?: string | null
          location?: string | null
          price?: number | null
          publication_year?: number | null
          publisher?: string | null
          status?: string | null
          subject_area?: string | null
          title?: string
          total_copies?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      library_fines: {
        Row: {
          amount: number
          borrowing_id: string
          created_at: string | null
          days_overdue: number | null
          fine_type: string
          id: string
          paid_date: string | null
          status: string | null
          student_id: string
          updated_at: string | null
          waived_by: string | null
          waived_reason: string | null
        }
        Insert: {
          amount: number
          borrowing_id: string
          created_at?: string | null
          days_overdue?: number | null
          fine_type: string
          id?: string
          paid_date?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
          waived_by?: string | null
          waived_reason?: string | null
        }
        Update: {
          amount?: number
          borrowing_id?: string
          created_at?: string | null
          days_overdue?: number | null
          fine_type?: string
          id?: string
          paid_date?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
          waived_by?: string | null
          waived_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_fines_borrowing_id_fkey"
            columns: ["borrowing_id"]
            isOneToOne: false
            referencedRelation: "book_borrowings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_fines_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      makeup_classes: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          lecturer_id: string | null
          makeup_date: string
          original_class_schedule_id: string | null
          reason: string
          scheduled_by: string
          start_time: string
          status: string | null
          unit_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          lecturer_id?: string | null
          makeup_date: string
          original_class_schedule_id?: string | null
          reason: string
          scheduled_by: string
          start_time: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          lecturer_id?: string | null
          makeup_date?: string
          original_class_schedule_id?: string | null
          reason?: string
          scheduled_by?: string
          start_time?: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "makeup_classes_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_classes_original_class_schedule_id_fkey"
            columns: ["original_class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          parent_message_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          category: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_details: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          account_details?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          account_details?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admission_number: string | null
          approved: boolean | null
          blocked: boolean | null
          course: string | null
          created_at: string
          department_id: string | null
          email: string
          financial_status: string | null
          first_name: string
          id: string
          intake: string | null
          last_name: string
          level: number | null
          phone: string | null
          role: string
          semester: number | null
          total_fees_owed: number | null
          updated_at: string
          user_id: string
          username: string | null
          year: number | null
        }
        Insert: {
          admission_number?: string | null
          approved?: boolean | null
          blocked?: boolean | null
          course?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          financial_status?: string | null
          first_name: string
          id?: string
          intake?: string | null
          last_name: string
          level?: number | null
          phone?: string | null
          role: string
          semester?: number | null
          total_fees_owed?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          year?: number | null
        }
        Update: {
          admission_number?: string | null
          approved?: boolean | null
          blocked?: boolean | null
          course?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          financial_status?: string | null
          first_name?: string
          id?: string
          intake?: string | null
          last_name?: string
          level?: number | null
          phone?: string | null
          role?: string
          semester?: number | null
          total_fees_owed?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          notification_type: string[]
          reminder_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          notification_type: string[]
          reminder_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          notification_type?: string[]
          reminder_time?: string
          user_id?: string
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
      report_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: string[]
          report_id: string
          schedule_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients: string[]
          report_id: string
          schedule_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_id?: string
          schedule_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_scheduled: boolean | null
          output_format: string | null
          parameters: Json | null
          query_template: string | null
          report_name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_scheduled?: boolean | null
          output_format?: string | null
          parameters?: Json | null
          query_template?: string | null
          report_name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_scheduled?: boolean | null
          output_format?: string | null
          parameters?: Json | null
          query_template?: string | null
          report_name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      retakes: {
        Row: {
          academic_year: string
          approved_by: string | null
          approved_date: string | null
          created_at: string
          exam_id: string | null
          fee_paid: boolean | null
          fee_required: number | null
          id: string
          original_score: number | null
          payment_reference: string | null
          rejection_reason: string | null
          retake_date: string | null
          retake_reason: string
          retake_score: number | null
          retake_type: string
          semester: number
          status: string | null
          student_email: string
          student_id: string
          student_name: string
          unit_code: string
          unit_id: string | null
          unit_name: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          exam_id?: string | null
          fee_paid?: boolean | null
          fee_required?: number | null
          id?: string
          original_score?: number | null
          payment_reference?: string | null
          rejection_reason?: string | null
          retake_date?: string | null
          retake_reason: string
          retake_score?: number | null
          retake_type: string
          semester: number
          status?: string | null
          student_email: string
          student_id: string
          student_name: string
          unit_code: string
          unit_id?: string | null
          unit_name: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          exam_id?: string | null
          fee_paid?: boolean | null
          fee_required?: number | null
          id?: string
          original_score?: number | null
          payment_reference?: string | null
          rejection_reason?: string | null
          retake_date?: string | null
          retake_reason?: string
          retake_score?: number | null
          retake_type?: string
          semester?: number
          status?: string | null
          student_email?: string
          student_id?: string
          student_name?: string
          unit_code?: string
          unit_id?: string | null
          unit_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retakes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      room_allocations: {
        Row: {
          academic_year_id: string | null
          allocated_by: string | null
          allocation_date: string
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          id: string
          room_id: string
          special_requirements: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          allocated_by?: string | null
          allocation_date: string
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          id?: string
          room_id: string
          special_requirements?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          allocated_by?: string | null
          allocation_date?: string
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          id?: string
          room_id?: string
          special_requirements?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_allocations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          current_occupancy: number | null
          facilities: string[] | null
          floor_number: number | null
          hostel_id: string
          id: string
          max_occupancy: number
          monthly_fee: number | null
          room_number: string
          room_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_occupancy?: number | null
          facilities?: string[] | null
          floor_number?: number | null
          hostel_id: string
          id?: string
          max_occupancy: number
          monthly_fee?: number | null
          room_number: string
          room_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_occupancy?: number | null
          facilities?: string[] | null
          floor_number?: number | null
          hostel_id?: string
          id?: string
          max_occupancy?: number
          monthly_fee?: number | null
          room_number?: string
          room_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      semester_plans: {
        Row: {
          academic_year_id: string
          advisor_approval: boolean | null
          advisor_id: string | null
          approval_date: string | null
          created_at: string | null
          id: string
          planned_units: Json
          semester_id: string
          status: string | null
          student_id: string
          total_credits: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          advisor_approval?: boolean | null
          advisor_id?: string | null
          approval_date?: string | null
          created_at?: string | null
          id?: string
          planned_units: Json
          semester_id: string
          status?: string | null
          student_id: string
          total_credits?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          advisor_approval?: boolean | null
          advisor_id?: string | null
          approval_date?: string | null
          created_at?: string | null
          id?: string
          planned_units?: Json
          semester_id?: string
          status?: string | null
          student_id?: string
          total_credits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semester_plans_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semester_plans_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semester_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_current: boolean | null
          name: string
          number: number
          registration_end: string | null
          registration_start: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name: string
          number: number
          registration_end?: string | null
          registration_start?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name?: string
          number?: number
          registration_end?: string | null
          registration_start?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semesters_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown | null
          login_time: string
          logout_time: string | null
          session_id: string
          status: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          login_time: string
          logout_time?: string | null
          session_id: string
          status?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          login_time?: string
          logout_time?: string | null
          session_id?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          provider: string | null
          recipient_phone: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          provider?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          provider?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          academic_year_id: string
          course_id: string | null
          created_at: string | null
          enrollment_date: string
          id: string
          semester_id: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          course_id?: string | null
          created_at?: string | null
          enrollment_date: string
          id?: string
          semester_id: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          course_id?: string | null
          created_at?: string | null
          enrollment_date?: string
          id?: string
          semester_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exam_registrations: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          registration_date: string
          seat_number: string | null
          special_requirements: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          registration_date: string
          seat_number?: string | null
          special_requirements?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          registration_date?: string
          seat_number?: string | null
          special_requirements?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_registrations_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exam_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          academic_year_id: string
          amount_paid: number | null
          balance: number | null
          created_at: string | null
          due_date: string | null
          fee_structure_id: string | null
          id: string
          semester_id: string | null
          status: string | null
          student_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          semester_id?: string | null
          status?: string | null
          student_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          semester_id?: string | null
          status?: string | null
          student_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_graduations: {
        Row: {
          certificate_number: string | null
          classification: string | null
          course_id: string | null
          created_at: string | null
          gpa: number | null
          graduation_date: string
          id: string
          issued_date: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          certificate_number?: string | null
          classification?: string | null
          course_id?: string | null
          created_at?: string | null
          gpa?: number | null
          graduation_date: string
          id?: string
          issued_date?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          certificate_number?: string | null
          classification?: string | null
          course_id?: string | null
          created_at?: string | null
          gpa?: number | null
          graduation_date?: string
          id?: string
          issued_date?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_suspensions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          reason: string
          reinstatement_conditions: string | null
          start_date: string
          status: string | null
          student_id: string
          suspended_by: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          reason: string
          reinstatement_conditions?: string | null
          start_date: string
          status?: string | null
          student_id: string
          suspended_by: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          reason?: string
          reinstatement_conditions?: string | null
          start_date?: string
          status?: string | null
          student_id?: string
          suspended_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_suspensions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_transfers: {
        Row: {
          approved_by: string | null
          created_at: string | null
          from_course_id: string | null
          id: string
          reason: string | null
          status: string | null
          student_id: string
          to_course_id: string | null
          transfer_date: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          from_course_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          student_id: string
          to_course_id?: string | null
          transfer_date: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          from_course_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          student_id?: string
          to_course_id?: string | null
          transfer_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_transfers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_unit_registrations: {
        Row: {
          created_at: string | null
          grade: string | null
          id: string
          marks: number | null
          registration_date: string
          semester_id: string
          status: string | null
          student_id: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grade?: string | null
          id?: string
          marks?: number | null
          registration_date: string
          semester_id: string
          status?: string | null
          student_id: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grade?: string | null
          id?: string
          marks?: number | null
          registration_date?: string
          semester_id?: string
          status?: string | null
          student_id?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_unit_registrations_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_unit_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_units: {
        Row: {
          created_at: string | null
          grade: string | null
          id: string
          semester: number
          status: string
          student_id: string
          unit_code: string
          unit_id: string
          unit_name: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          grade?: string | null
          id?: string
          semester: number
          status?: string
          student_id: string
          unit_code: string
          unit_id: string
          unit_name: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          grade?: string | null
          id?: string
          semester?: number
          status?: string
          student_id?: string
          unit_code?: string
          unit_id?: string
          unit_name?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      students: {
        Row: {
          admission_number: string
          course_id: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          enrollment_date: string
          expected_graduation_date: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          intake_period_id: string | null
          level: string | null
          semester: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          admission_number: string
          course_id?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          enrollment_date: string
          expected_graduation_date?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          intake_period_id?: string | null
          level?: string | null
          semester?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          admission_number?: string
          course_id?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          enrollment_date?: string
          expected_graduation_date?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          intake_period_id?: string | null
          level?: string | null
          semester?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_intake_period_id_fkey"
            columns: ["intake_period_id"]
            isOneToOne: false
            referencedRelation: "intake_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      timetable: {
        Row: {
          academic_year_id: string | null
          class_type: string | null
          course: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          lecturer_id: string | null
          lecturer_name: string
          notes: string | null
          room_capacity: number | null
          semester: number | null
          semester_id: string | null
          start_time: string
          unit_code: string
          unit_id: string | null
          unit_name: string
          updated_at: string
          venue: string
          year: number | null
        }
        Insert: {
          academic_year_id?: string | null
          class_type?: string | null
          course?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          lecturer_id?: string | null
          lecturer_name: string
          notes?: string | null
          room_capacity?: number | null
          semester?: number | null
          semester_id?: string | null
          start_time: string
          unit_code: string
          unit_id?: string | null
          unit_name: string
          updated_at?: string
          venue: string
          year?: number | null
        }
        Update: {
          academic_year_id?: string | null
          class_type?: string | null
          course?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          lecturer_id?: string | null
          lecturer_name?: string
          notes?: string | null
          room_capacity?: number | null
          semester?: number | null
          semester_id?: string | null
          start_time?: string
          unit_code?: string
          unit_id?: string | null
          unit_name?: string
          updated_at?: string
          venue?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          cumulative_gpa: number | null
          generated_at: string | null
          generated_by: string | null
          gpa: number | null
          id: string
          is_official: boolean | null
          semester_id: string | null
          status: string | null
          student_id: string
          total_credits: number | null
          transcript_data: Json
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          generated_at?: string | null
          generated_by?: string | null
          gpa?: number | null
          id?: string
          is_official?: boolean | null
          semester_id?: string | null
          status?: string | null
          student_id: string
          total_credits?: number | null
          transcript_data: Json
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          generated_at?: string | null
          generated_by?: string | null
          gpa?: number | null
          id?: string
          is_official?: boolean | null
          semester_id?: string | null
          status?: string | null
          student_id?: string
          total_credits?: number | null
          transcript_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_bookings: {
        Row: {
          academic_year_id: string | null
          booking_date: string
          created_at: string | null
          id: string
          journey_type: string | null
          route_id: string
          semester_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          booking_date: string
          created_at?: string | null
          id?: string
          journey_type?: string | null
          route_id: string
          semester_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          booking_date?: string
          created_at?: string | null
          id?: string
          journey_type?: string | null
          route_id?: string
          semester_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_bookings_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_fees: {
        Row: {
          academic_year_id: string | null
          booking_id: string
          created_at: string | null
          id: string
          monthly_fee: number
          months_covered: number | null
          paid_amount: number | null
          semester_id: string | null
          status: string | null
          student_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          booking_id: string
          created_at?: string | null
          id?: string
          monthly_fee: number
          months_covered?: number | null
          paid_amount?: number | null
          semester_id?: string | null
          status?: string | null
          student_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          booking_id?: string
          created_at?: string | null
          id?: string
          monthly_fee?: number
          months_covered?: number | null
          paid_amount?: number | null
          semester_id?: string | null
          status?: string | null
          student_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fees_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "transport_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fees_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          created_at: string | null
          distance_km: number | null
          end_location: string
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          route_code: string
          route_name: string
          start_location: string
          stops: Json | null
          updated_at: string | null
          vehicle_capacity: number | null
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          end_location: string
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          route_code: string
          route_name: string
          start_location: string
          stops?: Json | null
          updated_at?: string | null
          vehicle_capacity?: number | null
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          end_location?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          route_code?: string
          route_name?: string
          start_location?: string
          stops?: Json | null
          updated_at?: string | null
          vehicle_capacity?: number | null
        }
        Relationships: []
      }
      unit_allocations: {
        Row: {
          allocated_by: string
          allocated_date: string
          created_at: string | null
          department_id: string | null
          id: string
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          allocated_by: string
          allocated_date: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allocated_by?: string
          allocated_date?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_approvals: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          review_date: string | null
          reviewed_by: string | null
          status: string | null
          submission_date: string
          submitted_by: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date: string
          submitted_by: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string
          submitted_by?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_assignments: {
        Row: {
          assigned_date: string
          assignment_type: string | null
          created_at: string | null
          id: string
          lecturer_id: string
          semester_id: string
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date: string
          assignment_type?: string | null
          created_at?: string | null
          id?: string
          lecturer_id: string
          semester_id: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string
          assignment_type?: string | null
          created_at?: string | null
          id?: string
          lecturer_id?: string
          semester_id?: string
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_assignments_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_assignments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_prerequisites: {
        Row: {
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          minimum_grade: string | null
          prerequisite_unit_id: string | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          minimum_grade?: string | null
          prerequisite_unit_id?: string | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          minimum_grade?: string | null
          prerequisite_unit_id?: string | null
          unit_id?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          code: string
          course: string
          created_at: string | null
          credits: number
          department: string
          description: string | null
          id: string
          lecturer_id: string
          lecturer_name: string
          name: string
          semester: number
          status: string
          updated_at: string | null
          year: number
        }
        Insert: {
          code: string
          course: string
          created_at?: string | null
          credits?: number
          department: string
          description?: string | null
          id?: string
          lecturer_id: string
          lecturer_name: string
          name: string
          semester: number
          status?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          code?: string
          course?: string
          created_at?: string | null
          credits?: number
          department?: string
          description?: string | null
          id?: string
          lecturer_id?: string
          lecturer_name?: string
          name?: string
          semester?: number
          status?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_labs: {
        Row: {
          access_url: string | null
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          name: string
          unit_code: string | null
        }
        Insert: {
          access_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          name: string
          unit_code?: string | null
        }
        Update: {
          access_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          name?: string
          unit_code?: string | null
        }
        Relationships: []
      }
      waiting_lists: {
        Row: {
          added_date: string
          application_id: string
          course_id: string | null
          created_at: string | null
          id: string
          intake_period_id: string | null
          offer_date: string | null
          position: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_date: string
          application_id: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          intake_period_id?: string | null
          offer_date?: string | null
          position: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_date?: string
          application_id?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          intake_period_id?: string | null
          offer_date?: string | null
          position?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiting_lists_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_lists_intake_period_id_fkey"
            columns: ["intake_period_id"]
            isOneToOne: false
            referencedRelation: "intake_periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_with_bypass: {
        Args: {
          p_approved?: boolean
          p_course?: string
          p_department?: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_role: string
          p_username: string
        }
        Returns: string
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
