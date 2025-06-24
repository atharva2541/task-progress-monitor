export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          category: string
          details: Json
          id: string
          instance_id: string | null
          level: string
          task_id: string | null
          timestamp: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action_type: string
          category: string
          details: Json
          id?: string
          instance_id?: string | null
          level: string
          task_id?: string | null
          timestamp?: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action_type?: string
          category?: string
          details?: Json
          id?: string
          instance_id?: string | null
          level?: string
          task_id?: string | null
          timestamp?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aws_settings: {
        Row: {
          created_at: string | null
          id: number
          region: string
          s3_bucket_name: string
          ses_from_email: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          region: string
          s3_bucket_name: string
          ses_from_email: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          region?: string
          s3_bucket_name?: string
          ses_from_email?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          delivery_status: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          notification_type: string | null
          priority: string | null
          reference_id: string | null
          task_id: string | null
          timestamp: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          notification_type?: string | null
          priority?: string | null
          reference_id?: string | null
          task_id?: string | null
          timestamp?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          notification_type?: string | null
          priority?: string | null
          reference_id?: string | null
          task_id?: string | null
          timestamp?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          is_first_login: boolean | null
          name: string
          password_expiry_date: string
          role: Database["public"]["Enums"]["user_role"]
          roles: Json
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id: string
          is_first_login?: boolean | null
          name: string
          password_expiry_date?: string
          role?: Database["public"]["Enums"]["user_role"]
          roles?: Json
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_first_login?: boolean | null
          name?: string
          password_expiry_date?: string
          role?: Database["public"]["Enums"]["user_role"]
          roles?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_approvals: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          instance_id: string
          status: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          instance_id: string
          status: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string
          status?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "task_approvals_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_approvals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          storage_path: string | null
          task_id: string
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          storage_path?: string | null
          task_id: string
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          storage_path?: string | null
          task_id?: string
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_instances: {
        Row: {
          assigned_to: string | null
          base_task_id: string
          checker1: string | null
          checker2: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string
          id: string
          instance_reference: string | null
          observation_status:
            | Database["public"]["Enums"]["observation_status"]
            | null
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["task_status"]
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          base_task_id: string
          checker1?: string | null
          checker2?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          instance_reference?: string | null
          observation_status?:
            | Database["public"]["Enums"]["observation_status"]
            | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          base_task_id?: string
          checker1?: string | null
          checker2?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          instance_reference?: string | null
          observation_status?:
            | Database["public"]["Enums"]["observation_status"]
            | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_base_task_id_fkey"
            columns: ["base_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_checker1_fkey"
            columns: ["checker1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_checker2_fkey"
            columns: ["checker2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notification_settings: {
        Row: {
          enable_post_notifications: boolean | null
          enable_pre_notifications: boolean | null
          escalate_after: number | null
          notify_checker1: boolean | null
          notify_checker2: boolean | null
          notify_checkers: boolean | null
          notify_maker: boolean | null
          post_notification_frequency: string | null
          pre_days: Json | null
          remind_before: number | null
          send_emails: boolean | null
          task_id: string
        }
        Insert: {
          enable_post_notifications?: boolean | null
          enable_pre_notifications?: boolean | null
          escalate_after?: number | null
          notify_checker1?: boolean | null
          notify_checker2?: boolean | null
          notify_checkers?: boolean | null
          notify_maker?: boolean | null
          post_notification_frequency?: string | null
          pre_days?: Json | null
          remind_before?: number | null
          send_emails?: boolean | null
          task_id: string
        }
        Update: {
          enable_post_notifications?: boolean | null
          enable_pre_notifications?: boolean | null
          escalate_after?: number | null
          notify_checker1?: boolean | null
          notify_checker2?: boolean | null
          notify_checkers?: boolean | null
          notify_maker?: boolean | null
          post_notification_frequency?: string | null
          pre_days?: Json | null
          remind_before?: number | null
          send_emails?: boolean | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notification_settings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string
          checker1: string | null
          checker2: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          current_instance_id: string | null
          description: string | null
          due_date: string | null
          escalated_at: string | null
          escalated_by: string | null
          escalation_priority:
            | Database["public"]["Enums"]["escalation_priority"]
            | null
          escalation_reason: string | null
          frequency: Database["public"]["Enums"]["task_frequency"]
          id: string
          is_escalated: boolean | null
          is_recurring: boolean | null
          is_template: boolean | null
          name: string
          next_instance_date: string | null
          observation_status:
            | Database["public"]["Enums"]["observation_status"]
            | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          checker1?: string | null
          checker2?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          current_instance_id?: string | null
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalation_priority?:
            | Database["public"]["Enums"]["escalation_priority"]
            | null
          escalation_reason?: string | null
          frequency?: Database["public"]["Enums"]["task_frequency"]
          id?: string
          is_escalated?: boolean | null
          is_recurring?: boolean | null
          is_template?: boolean | null
          name: string
          next_instance_date?: string | null
          observation_status?:
            | Database["public"]["Enums"]["observation_status"]
            | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          checker1?: string | null
          checker2?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          current_instance_id?: string | null
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalation_priority?:
            | Database["public"]["Enums"]["escalation_priority"]
            | null
          escalation_reason?: string | null
          frequency?: Database["public"]["Enums"]["task_frequency"]
          id?: string
          is_escalated?: boolean | null
          is_recurring?: boolean | null
          is_template?: boolean | null
          name?: string
          next_instance_date?: string | null
          observation_status?:
            | Database["public"]["Enums"]["observation_status"]
            | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_escalated_by_fkey"
            columns: ["escalated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          digest_frequency: string | null
          due_date_reminders: boolean | null
          email_enabled: boolean | null
          in_app_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          system_notifications: boolean | null
          task_assignment: boolean | null
          task_updates: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          digest_frequency?: string | null
          due_date_reminders?: boolean | null
          email_enabled?: boolean | null
          in_app_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_notifications?: boolean | null
          task_assignment?: boolean | null
          task_updates?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          digest_frequency?: string | null
          due_date_reminders?: boolean | null
          email_enabled?: boolean | null
          in_app_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_notifications?: boolean | null
          task_assignment?: boolean | null
          task_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      escalation_priority: "low" | "medium" | "high" | "critical"
      observation_status: "yes" | "no" | "mixed"
      task_frequency:
        | "once"
        | "daily"
        | "weekly"
        | "bi-weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "pending"
        | "in_progress"
        | "under_review"
        | "completed"
        | "rejected"
      user_role: "admin" | "maker" | "checker1" | "checker2"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      escalation_priority: ["low", "medium", "high", "critical"],
      observation_status: ["yes", "no", "mixed"],
      task_frequency: [
        "once",
        "daily",
        "weekly",
        "bi-weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "pending",
        "in_progress",
        "under_review",
        "completed",
        "rejected",
      ],
      user_role: ["admin", "maker", "checker1", "checker2"],
    },
  },
} as const
