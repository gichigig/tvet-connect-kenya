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
