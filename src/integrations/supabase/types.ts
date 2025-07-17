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
      [_ in never]: never
    }
    Enums: {
      domain_type: "science" | "engineering" | "medical"
      experiment_difficulty: "beginner" | "intermediate" | "advanced"
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
      experiment_difficulty: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
