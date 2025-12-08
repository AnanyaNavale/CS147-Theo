import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import type {
  Database,
  Json,
  WorkSession,
  Task,
  UserProfile,
  Report
} from "@/types/database.types";

export type ReflectionChatMessage = {
  id: string;
  text: string;
  from: "user" | "assistant";
  created_at: string;
  isVoice?: boolean;
  displayText?: string | null;
};

///////////////////////////////////////////////// SUPABASE SETUP

/**
 * Load and validate required Supabase environment variables.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
  );
}

/**
 * Creates a Supabase client configured for Expo with AsyncStorage-backed
 * auth session persistence.
 */
let supabase: ReturnType<typeof createTypedClient> | null = null;

function createTypedClient() {
  return createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabase() {
  if (!supabase) {
    supabase = createTypedClient();
  }
  return supabase;
}

export const supabaseClient = getSupabase();

///////////////////////////////////////////////// USER ACCOUNT SETUP

export interface EmailSignUpPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface EmailSignInPayload {
  email: string;
  password: string;
}

/**
 * Registers a user with email/password and provisions the profile record.
 */
export async function signUpWithEmail(payload: EmailSignUpPayload) {
  const { email, password, displayName } = payload;
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("registered") || lowered.includes("already exists")) {
      throw new Error("Email already registered. Try logging in instead.");
    }
    throw new Error(`Failed to sign up: ${error.message}`);
  }

  // Only upsert profile when we have an authenticated session so RLS passes.
  if (data.session?.user) {
    await ensureUserProfile({
      id: data.session.user.id,
      displayName:
        data.session.user.user_metadata?.display_name ?? displayName ?? null,
    });
  }

  return data;
}

/**
 * Authenticates a user via email/password.
 */
export async function signInWithEmail(
  payload: EmailSignInPayload
): Promise<Session | null> {
  const { email, password } = payload;
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  if (data.session?.user) {
    await ensureUserProfile({
      id: data.session.user.id,
      displayName:
        data.session.user.user_metadata?.display_name ?? null,
    });
  }

  return data.session;
}

/**
 * Signs out the active user session.
 */
export async function signOut() {
  const { error } = await getSupabase().auth.signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

/**
 * Retrieves the current cached session, if available.
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null; // skip on Node/EAS build

  const { data, error } = await getSupabase().auth.getSession();

  if (error) {
    const normalized = error.message?.toLowerCase?.() ?? "";
    const isInvalidRefreshToken =
      normalized.includes("invalid refresh token") ||
      normalized.includes("refresh token not found");

    if (isInvalidRefreshToken) {
      // Clear any stale session data quietly so the app can continue logged-out.
      await getSupabase().auth.signOut({ scope: "local" });
      console.info(
        "Cleared invalid refresh token and continued without a session."
      );
      return null;
    }

    throw new Error(`Failed to get current session: ${error.message}`);
  }

  return data.session;
}

/**
 * Subscribes to auth state changes and returns an unsubscribe handler.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export interface UpsertUserProfilePayload {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface UpsertUserSettingsPayload {
  userId: string;
  defaultSessionMinutes?: number | null;
  defaultBreakMinutes?: number | null;
  weeklyFocusGoalMinutes?: number | null;
  notificationsEnabled?: boolean | null;
  timezone?: string | null;
}

/**
 * Ensures the user profile row exists and updates optional profile fields.
 */
export async function ensureUserProfile(payload: UpsertUserProfilePayload) {
  const { id, displayName, avatarUrl } = payload;
  const { error } = await getSupabase()
    .from("user_profiles")
    .upsert({
      id,
      display_name: displayName ?? null,
      avatar_url: avatarUrl ?? null,
    });

  if (error) {
    throw new Error(`Failed to upsert user profile: ${error.message}`);
  }
}

/**
 * Fetches an individual user profile.
 */
export async function fetchUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Inserts or updates user settings for the supplied user.
 */
// export async function upsertUserSettings(
//   payload: UpsertUserSettingsPayload
// ): Promise<UserSettings> {
//   const {
//     userId,
//     defaultSessionMinutes,
//     defaultBreakMinutes,
//     weeklyFocusGoalMinutes,
//     notificationsEnabled,
//     timezone,
//   } = payload;
//   const { data, error } = await supabase
//     .from("user_settings")
//     .upsert({
//       user_id: userId,
//       default_session_minutes: defaultSessionMinutes ?? null,
//       default_break_minutes: defaultBreakMinutes ?? null,
//       weekly_focus_goal_minutes: weeklyFocusGoalMinutes ?? null,
//       notifications_enabled: notificationsEnabled ?? null,
//       timezone: timezone ?? null,
//     })
//     .select()
//     .single();

//   if (error) {
//     throw new Error(`Failed to upsert user settings: ${error.message}`);
//   }

//   return data;
// }

/**
 * Retrieves user settings or null if none exist.
 */
// export async function fetchUserSettings(
//   userId: string
// ): Promise<UserSettings | null> {
//   const { data, error } = await supabase
//     .from("user_settings")
//     .select("*")
//     .eq("user_id", userId)
//     .maybeSingle();

//   if (error) {
//     throw new Error(`Failed to fetch user settings: ${error.message}`);
//   }

//   return data;
// }

///////////////////////////////////////////////// SESSIONS TABLE HANDLING

///////////////////////////////
// SESSIONS
///////////////////////////////

export interface CreateSessionPayload {
  user_id: string;
  title: string;
  has_settings: boolean;
  total_time: number;
  status: string;
  has_goal: boolean;
  goal: string | null;
  has_tasks: boolean;
}

/**
 * Creates a new active work session for a user.
 */
export async function createSession(
  userId: string,
  title: string,
  hasGoal: boolean,
  goal?: string | null,
  hasTasks: boolean = false,
  totalTime: number = 0,
): Promise<WorkSession> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .insert({
      user_id: userId,
      title: title, // required
      total_time: totalTime, // required
      status: "active",
      has_goal: hasGoal,
      goal: goal,
      has_tasks: hasTasks,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data;
}

/**
 * Creates a new work plan for a user.
 * 
 * Used for ARCHIVE.
 */
export async function createPlan(
  userId: string,
  hasGoal: boolean,
  hasTasks: boolean = false,
  total_time: number,
  title?: string,
  goal?: string | null
): Promise<WorkSession> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .insert({
      user_id: userId,
      title: title,
      total_time: total_time, // required
      status: "planned",
      has_goal: hasGoal,
      goal: goal,
      has_tasks: hasTasks,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data;
}

/**
 * Fetches all sessions for a user.
 */
export async function fetchSessions(userId: string): Promise<WorkSession[]> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
  return data ?? [];
}

/**
 * Fetches all distinct dates in a given month where the user has sessions.
 * @param userId - the user's ID
 * @param year - 4-digit year, e.g., 2025
 * @param month - 1-12 for the month
 * @returns array of date strings in 'YYYY-MM-DD' format
 * 
 * Used for ARCHIVE.
 */
export async function fetchSessionDatesForMonth(
  month: number,
  year: number,
  userId: string
): Promise<string[]> {
  // 1. Month boundaries in LOCAL TIME
  const startLocal = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endLocal = new Date(year, month, 0, 23, 59, 59, 999);

  // 2. Convert to UTC ISO for Supabase
  const startDate = startLocal.toISOString();
  const endDate = endLocal.toISOString();

  const { data, error } = await getSupabase()
    .from("sessions")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch session dates: ${error.message}`);
  if (!data) return [];

  // 3. Convert each timestamp to LOCAL day string (yyyy-mm-dd)
  const uniqueDates = Array.from(
    new Set(
      data.map((row) => {
        const d = new Date(row.created_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`; // local day
      })
    )
  );

  return uniqueDates;
}

export async function fetchSessionsForDaySorted(
  date: string, // "YYYY-MM-DD"
  userId: string
) {
  // Parse local date start and end
  const [year, month, day] = date.split("-").map(Number);

  const startLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endLocal = new Date(year, month - 1, day, 23, 59, 59, 999);

  // Convert to UTC for the database query
  const startDateUTC = startLocal.toISOString();
  const endDateUTC = endLocal.toISOString();

  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDateUTC)
    .lte("created_at", endDateUTC)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sessions for ${date}: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetches the 10 most recent sessions for a user.
 */
export async function fetchRecentSessions(userId: string): Promise<WorkSession[]> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(`Failed to fetch recent sessions: ${error.message}`);
  return data ?? [];
}

/**
 * Fetches a single session by ID.
 */
export async function fetchSessionById(sessionId: string): Promise<WorkSession | null> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch session: ${error.message}`);
  return data;
}

/**
 * Updates a session (goal, summary, reflection, etc.)
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<WorkSession, "id" | "created_at" | "user_id">>
): Promise<WorkSession> {
  const { data, error } = await getSupabase()
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  return data;
}

/**
 * Persists reflection chat history on a session.
 */
export async function saveReflectionChat(
  sessionId: string,
  messages: ReflectionChatMessage[]
): Promise<void> {
  const sanitized = messages.map((m) => ({
    id: m.id,
    text: m.text,
    from: m.from,
    created_at: m.created_at ?? new Date().toISOString(),
    isVoice: m.isVoice ?? false,
    displayText: m.displayText ?? (m.isVoice ? "Voice message" : null),
  })) as unknown as Json[];

  const { error } = await getSupabase()
    .from("sessions")
    .update({ reflection_chat: sanitized })
    .eq("id", sessionId);

  if (error) {
    throw new Error(`Failed to save reflection chat: ${error.message}`);
  }
}

/**
 * Deletes a session and optionally related tasks and settings.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw new Error(`Failed to delete session: ${error.message}`);
}

///////////////////////////////
// TASKS
///////////////////////////////

export interface CreateTaskPayload {
  session_id: string;
  task_name: string;
  is_completed?: boolean;
  order_index: number;
  time_allotted?: number | null;
  time_completed?: number | null;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return data;
}

export async function fetchTasksForSession(sessionId: string): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
  return data;
}

export async function updateTask(
  taskId: string,
  updates: Partial<CreateTaskPayload>
): Promise<Task | null> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) throw new Error(`Failed to update task: ${error.message}`);
  return data; // data might be null
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await getSupabase().from("tasks").delete().eq("id", taskId);

  if (error) throw new Error(`Failed to delete task: ${error.message}`);
}

///////////////////////////////
// REPORTS
///////////////////////////////

export interface CreateReportPayload {
  user_id: string;
  problem: string;
}

/**
 * Creates a new active work session for a user.
 */
export async function createReport(
  userId: string,
  problem: string,
): Promise<Report> {
  console.log("In createReport");
  const { data, error } = await getSupabase()
    .from("reports")
    .insert({
      user_id: userId,
      problem: problem, // required
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create report: ${error.message}`);
  return data;
}

///////////////////////////////
// SESSION SETTINGS --------NOT IN USE ANYMORE
///////////////////////////////

// export interface CreateSessionSettingPayload {
//   user_id?: string | null;
//   session_id: string;
//   reflection_reminders: boolean;
//   collab_requests: boolean;
//   collab_friends: boolean;
// }

// export async function createSessionSetting(payload: CreateSessionSettingPayload): Promise<SessionSetting> {
//   const { data, error } = await supabase
//     .from("session_settings")
//     .insert(payload)
//     .select()
//     .single();

//   if (error) throw new Error(`Failed to create session setting: ${error.message}`);
//   return data;
// }

// export async function fetchSessionSetting(sessionId: string): Promise<SessionSetting | null> {
//   const { data, error } = await supabase
//     .from("session_settings")
//     .select("*")
//     .eq("session_id", sessionId)
//     .maybeSingle();

//   if (error) throw new Error(`Failed to fetch session setting: ${error.message}`);
//   return data;
// }

// export async function updateSessionSetting(sessionId: string, updates: Partial<CreateSessionSettingPayload>): Promise<SessionSetting> {
//   const { data, error } = await supabase
//     .from("session_settings")
//     .update(updates)
//     .eq("session_id", sessionId)
//     .select()
//     .single();

//   if (error) throw new Error(`Failed to update session setting: ${error.message}`);
//   return data;
// }

// export async function deleteSessionSetting(sessionId: string): Promise<void> {
//   const { error } = await supabase
//     .from("session_settings")
//     .delete()
//     .eq("session_id", sessionId);

//   if (error) throw new Error(`Failed to delete session setting: ${error.message}`);
// }

// export interface SessionSettingPayload {
//   userId: string;
//   title: string;
//   focusMinutes?: number | null;
//   breakMinutes?: number | null;
//   autoStartBreaks?: boolean | null;
//   autoRotateTasks?: boolean | null;
// }

// export interface UpdateSessionSettingPayload {
//   sessionSettingId: string;
//   userId: string;
//   title?: string;
//   focusMinutes?: number | null;
//   breakMinutes?: number | null;
//   autoStartBreaks?: boolean | null;
//   autoRotateTasks?: boolean | null;
// }

// export interface SessionTaskPayload {
//   title: string;
//   estimatedMinutes?: number | null;
//   orderIndex?: number | null;
// }

// export interface ScheduleSessionPayload {
//   userId: string;
//   sessionSettingId?: string | null;
//   scheduledFor: string;
//   durationTargetMinutes?: number | null;
//   status?: string | null;
//   agenda?: string | null;
//   tasks?: SessionTaskPayload[];
// }

// export interface LogCompletedSessionPayload {
//   userId: string;
//   scheduledSessionId?: string | null;
//   startedAt?: string | null;
//   endedAt?: string | null;
//   totalFocusMinutes?: number | null;
//   totalBreakMinutes?: number | null;
//   reflection?: string | null;
//   focusScore?: number | null;
//   energyLevel?: number | null;
//   tasks?: Array<
//     SessionTaskPayload & {
//       actualMinutes?: number | null;
//       completed?: boolean | null;
//       notes?: string | null;
//     }
//   >;
// }

// /**
//  * Deletes a session preset owned by the user.
//  */
// export async function deleteSessionSetting(
//   sessionSettingId: string,
//   userId: string
// ) {
//   const { error } = await supabase
//     .from("session_settings")
//     .delete()
//     .eq("id", sessionSettingId)
//     .eq("user_id", userId);

//   if (error) {
//     throw new Error(`Failed to delete session setting: ${error.message}`);
//   }
// }
