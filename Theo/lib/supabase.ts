import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import type { Json, WorkSession, Task, SessionSetting, UserProfile } from "@/types/database.types";

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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    throw new Error(`Failed to sign up: ${error.message}`);
  }

  if (data.user) {
    await ensureUserProfile({
      id: data.user.id,
      displayName: displayName ?? null,
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  return data.session;
}

/**
 * Signs out the active user session.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

/**
 * Retrieves the current cached session, if available.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
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
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
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
  const { error } = await supabase.from("user_profiles").upsert({
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
  const { data, error } = await supabase
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
  user_id?: string | null;
  status: string;
  has_goal: boolean;
  goal?: string | null;
  has_tasks: boolean;
  summary?: Json | null;
  reflection_chat?: Json | null;
}

/**
 * Creates a new work session for a user.
 */
export async function createSession(
  userId: string,
  hasGoal: boolean,
  goal?: string | null,
  hasTasks: boolean = false
): Promise<WorkSession> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      status: "active",
      has_goal: hasGoal,
      goal: goal ?? null,
      has_tasks: hasTasks,
      summary: null,
      reflection_chat: null,
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
  const { data, error } = await supabase
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
  month: number, // 1-12
  year: number,
  userId?: string
): Promise<string[]> {
  // Construct the start and end ISO dates for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    new Date(year, month, 0).getDate()
  ).padStart(2, "0")}`;

  // console.log("DEBUG: startDate =", startDate, "endDate =", endDate);

  const { data, error } = await supabase
    .from("sessions")
    .select("created_at", { count: "exact" })
    // .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch session dates: ${error.message}`);
  }

  if (!data) return [];

  // Use a Set to ensure unique dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(data.map((row) => row.created_at.slice(0, 10)))
  );

  return uniqueDates;
}

export interface SessionWithSettings extends WorkSession {
  settings?: SessionSetting | null;
}

/**
 * Fetches all sessions for a specific day with settings.
 * @param userId - the user's ID
 * @param date - YYYY-MM-DD
 * 
 * Used for ARCHIVE.
 */
export async function fetchSessionsForDayWithSettingsSorted(
  userId: string,
  date: string
): Promise<SessionWithSettings[]> {
  const startDate = new Date(`${date}T00:00:00.000Z`).toISOString();
  const endDate = new Date(`${date}T23:59:59.999Z`).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      session_settings(*)
    `
    )
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    // order by "has settings" first
    .order("session_settings.id", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch sessions with settings for ${date}: ${error.message}`
    );
  }

  // Map settings into a single field for easier access
  const sessionsWithSettings: SessionWithSettings[] = data.map((row) => ({
    ...row,
    settings: row.session_settings ?? null,
  }));

  return sessionsWithSettings;
}


/**
 * Fetches a single session by ID.
 */
export async function fetchSessionById(sessionId: string): Promise<WorkSession | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  return data;
}

/**
 * Deletes a session and optionally related tasks and settings.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw new Error(`Failed to delete session: ${error.message}`);
}

///////////////////////////////
// TASKS
///////////////////////////////

export interface CreateTaskPayload {
  scheduled_session_id: string;
  title: string;
  estimated_minutes?: number | null;
  order_index?: number | null;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return data;
}

export async function fetchTasksForSession(sessionId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("scheduled_session_id", sessionId);

  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
  return data;
}

export async function updateTask(taskId: string, updates: Partial<CreateTaskPayload>): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update task: ${error.message}`);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(`Failed to delete task: ${error.message}`);
}

///////////////////////////////
// SESSION SETTINGS
///////////////////////////////

export interface CreateSessionSettingPayload {
  user_id?: string | null;
  session_id: string;
  reflection_reminders: boolean;
  collab_requests: boolean;
  collab_friends: boolean;
}

export async function createSessionSetting(payload: CreateSessionSettingPayload): Promise<SessionSetting> {
  const { data, error } = await supabase
    .from("session_settings")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session setting: ${error.message}`);
  return data;
}

export async function fetchSessionSetting(sessionId: string): Promise<SessionSetting | null> {
  const { data, error } = await supabase
    .from("session_settings")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch session setting: ${error.message}`);
  return data;
}

export async function updateSessionSetting(sessionId: string, updates: Partial<CreateSessionSettingPayload>): Promise<SessionSetting> {
  const { data, error } = await supabase
    .from("session_settings")
    .update(updates)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session setting: ${error.message}`);
  return data;
}

export async function deleteSessionSetting(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("session_settings")
    .delete()
    .eq("session_id", sessionId);

  if (error) throw new Error(`Failed to delete session setting: ${error.message}`);
}










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
