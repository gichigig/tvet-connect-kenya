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
      [_ in never]: never
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
