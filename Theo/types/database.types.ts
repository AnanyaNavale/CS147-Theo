export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      completed_session_tasks: {
        Row: {
          actual_minutes: number | null;
          completed: boolean | null;
          completed_session_id: string;
          estimated_minutes: number | null;
          id: string;
          notes: string | null;
          title: string;
        };
        Insert: {
          actual_minutes?: number | null;
          completed?: boolean | null;
          completed_session_id: string;
          estimated_minutes?: number | null;
          id?: string;
          notes?: string | null;
          title: string;
        };
        Update: {
          actual_minutes?: number | null;
          completed?: boolean | null;
          completed_session_id?: string;
          estimated_minutes?: number | null;
          id?: string;
          notes?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completed_session_tasks_completed_session_id_fkey";
            columns: ["completed_session_id"];
            referencedRelation: "completed_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      completed_sessions: {
        Row: {
          created_at: string;
          ended_at: string | null;
          energy_level: number | null;
          focus_score: number | null;
          id: string;
          reflection: string | null;
          scheduled_session_id: string | null;
          started_at: string | null;
          total_break_minutes: number | null;
          total_focus_minutes: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          ended_at?: string | null;
          energy_level?: number | null;
          focus_score?: number | null;
          id?: string;
          reflection?: string | null;
          scheduled_session_id?: string | null;
          started_at?: string | null;
          total_break_minutes?: number | null;
          total_focus_minutes?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          ended_at?: string | null;
          energy_level?: number | null;
          focus_score?: number | null;
          id?: string;
          reflection?: string | null;
          scheduled_session_id?: string | null;
          started_at?: string | null;
          total_break_minutes?: number | null;
          total_focus_minutes?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completed_sessions_scheduled_session_id_fkey";
            columns: ["scheduled_session_id"];
            referencedRelation: "scheduled_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      scheduled_sessions: {
        Row: {
          agenda: string | null;
          created_at: string;
          duration_target_minutes: number | null;
          id: string;
          scheduled_for: string;
          session_setting_id: string | null;
          status: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          agenda?: string | null;
          created_at?: string;
          duration_target_minutes?: number | null;
          id?: string;
          scheduled_for: string;
          session_setting_id?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          agenda?: string | null;
          created_at?: string;
          duration_target_minutes?: number | null;
          id?: string;
          scheduled_for?: string;
          session_setting_id?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_sessions_session_setting_id_fkey";
            columns: ["session_setting_id"];
            referencedRelation: "session_settings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      session_settings: {
        Row: {
          auto_rotate_tasks: boolean | null;
          auto_start_breaks: boolean | null;
          break_minutes: number | null;
          created_at: string;
          focus_minutes: number | null;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          auto_rotate_tasks?: boolean | null;
          auto_start_breaks?: boolean | null;
          break_minutes?: number | null;
          created_at?: string;
          focus_minutes?: number | null;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          auto_rotate_tasks?: boolean | null;
          auto_start_breaks?: boolean | null;
          break_minutes?: number | null;
          created_at?: string;
          focus_minutes?: number | null;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      session_tasks: {
        Row: {
          created_at: string;
          estimated_minutes: number | null;
          id: string;
          order_index: number | null;
          scheduled_session_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          order_index?: number | null;
          scheduled_session_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          order_index?: number | null;
          scheduled_session_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_tasks_scheduled_session_id_fkey";
            columns: ["scheduled_session_id"];
            referencedRelation: "scheduled_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          created_at: string;
          default_break_minutes: number | null;
          default_session_minutes: number | null;
          id: string;
          notifications_enabled: boolean | null;
          timezone: string | null;
          updated_at: string;
          user_id: string;
          weekly_focus_goal_minutes: number | null;
        };
        Insert: {
          created_at?: string;
          default_break_minutes?: number | null;
          default_session_minutes?: number | null;
          id?: string;
          notifications_enabled?: boolean | null;
          timezone?: string | null;
          updated_at?: string;
          user_id: string;
          weekly_focus_goal_minutes?: number | null;
        };
        Update: {
          created_at?: string;
          default_break_minutes?: number | null;
          default_session_minutes?: number | null;
          id?: string;
          notifications_enabled?: boolean | null;
          timezone?: string | null;
          updated_at?: string;
          user_id?: string;
          weekly_focus_goal_minutes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      handle_user_updated: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

export type CompletedSession =
  Database["public"]["Tables"]["completed_sessions"]["Row"];
export type CompletedSessionTask =
  Database["public"]["Tables"]["completed_session_tasks"]["Row"];
export type ScheduledSession =
  Database["public"]["Tables"]["scheduled_sessions"]["Row"];
export type SessionSetting =
  Database["public"]["Tables"]["session_settings"]["Row"];
export type SessionTask = Database["public"]["Tables"]["session_tasks"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
