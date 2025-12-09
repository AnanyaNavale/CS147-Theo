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
          id: string; // bigint identity in DB; use string for transport
          created_at: string;
          completed_at: string | null;
          user_id: string;
          title: string;
          total_time: number;
          time_completed: number | null;
          status: "planned" | "active" | "incomplete" | "complete";
          has_goal: boolean;
          goal: string | null;
          has_tasks: boolean;
          summary: string | null;
          reflection_chat: Json[] | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          completed_at?: string | null;
          user_id: string;
          title?: string;
          total_time?: number;
          time_completed?: number | null;
          status?: "planned" | "active" | "incomplete" | "complete";
          has_goal?: boolean;
          goal?: string | null;
          has_tasks?: boolean;
          summary?: Json | null;
          reflection_chat?: Json[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          completed_at?: string | null;
          user_id?: string | null;
          title?: string;
          total_time?: number;
          time_completed?: number | null;
          status?: "planned" | "active" | "incomplete" | "complete";
          has_goal?: boolean;
          goal?: string | null;
          has_tasks?: boolean;
          summary?: Json | null;
          reflection_chat?: Json[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      // ------------------ TASKS TABLE ------------------
      tasks: {
        Row: {
          id: string; // bigint
          session_id: string;
          task_name: string;
          is_completed: boolean;
          order_index: number;
          time_allotted: number | null;
          time_completed: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          task_name: string;
          is_completed?: boolean;
          order_index: number;
          time_allotted?: number | null;
          time_completed?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          task_name?: string;
          is_completed?: boolean;
          order_index?: number;
          time_allotted?: number | null;
          time_completed?: number | null;
          created_at?: string;
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
      // session_settings: {
      //   Row: {
      //     id: string;
      //     session_id: string;
      //     reflection_reminders: boolean;
      //     collab_requests: boolean;
      //     collab_friends: boolean;
      //     user_id: string | null;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     user_id?: string | null;
      //     session_id: string;
      //     reflection_reminders?: boolean;
      //     collab_requests?: boolean;
      //     collab_friends?: boolean;
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     user_id?: string | null;
      //     session_id?: string;
      //     reflection_reminders?: boolean;
      //     collab_requests?: boolean;
      //     collab_friends?: boolean;
      //     created_at?: string;
      //   };
      //   Relationships: [
      //     {
      //       foreignKeyName: "session_settings_session_id_fkey";
      //       columns: ["session_id"];
      //       referencedRelation: "sessions";
      //       referencedColumns: ["id"];
      //     }
      //   ];
      // };

      // ------------------ USERS TABLE ------------------
      user_profiles: {
        // USERS TABLE
        Row: {
          id: string;
          user_id?: string;
          avatar_url: string | null;
          display_name: string | null;
          notifications_enabled: boolean | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          notifications_enabled?: boolean | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          notifications_enabled?: boolean | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      // ------------------ REPORTS TABLE ------------------
      reports: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          problem: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          problem: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "auth.users";
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

export type WorkSession = Database["public"]["Tables"]["sessions"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
// export type SessionSetting =
//   Database["public"]["Tables"]["session_settings"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
