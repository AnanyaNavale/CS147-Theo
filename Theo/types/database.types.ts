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
      // ------------------ SESSIONS TABLE ------------------
      sessions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          status: string;
          has_goal: boolean;
          goal: string | null;
          has_tasks: boolean;
          summary: Json | null;
          reflection_chat: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          status: string;
          has_goal: boolean;
          goal?: string | null;
          has_tasks: boolean;
          summary?: Json | null;
          reflection_chat?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          status?: string;
          has_goal?: boolean;
          goal?: string | null;
          has_tasks?: boolean;
          summary?: Json | null;
          reflection_chat?: Json | null;
        };
        Relationships: [];
      };

      // ------------------ TASKS TABLE ------------------
      tasks: {
        Row: {
          id: string;
          created_at: string;
          scheduled_session_id: string;
          title: string;
          estimated_minutes: number | null;
          order_index: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          scheduled_session_id: string;
          title: string;
          estimated_minutes?: number | null;
          order_index?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          scheduled_session_id?: string;
          title?: string;
          estimated_minutes?: number | null;
          order_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };

      // ------------------ SESSION SETTINGS TABLE ------------------
      session_settings: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          reflection_reminders: boolean;
          collab_requests: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id: string;
          reflection_reminders?: boolean;
          collab_requests?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string;
          reflection_reminders?: boolean;
          collab_requests?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "session-settings_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };

      // ------------------ USERS TABLE ------------------
      user_profiles: {
        // USERS TABLE
        Row: {};
        Insert: {};
        Update: {};
        Relationships: [];
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

export type WorkSession = Database["public"]["Tables"]["sessions"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type SessionSetting = Database["public"]["Tables"]["session_settings"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];