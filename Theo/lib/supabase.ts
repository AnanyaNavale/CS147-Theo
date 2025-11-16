import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type {
  CompletedSession,
  CompletedSessionTask,
  ScheduledSession,
  SessionSetting,
  SessionTask,
  UserProfile,
  UserSettings,
} from "@/types/database.types";

const SUPABASE_URL = assertEnv(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  "EXPO_PUBLIC_SUPABASE_URL"
);
const SUPABASE_ANON_KEY = assertEnv(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  "EXPO_PUBLIC_SUPABASE_ANON_KEY"
);

export const supabase = createSupabaseClient();

/**
 * Ensures required Supabase environment variables are present.
 */
function assertEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(
      `Missing Supabase environment variable: ${key}. Update your .env.`
    );
  }

  return value;
}

/**
 * Casts raw session task rows into typed session task entries.
 */
function mapSessionTasks(items: unknown): SessionTask[] {
  return (items as SessionTask[]) ?? [];
}

/**
 * Casts raw completed task rows into typed completed task entries.
 */
function mapCompletedSessionTasks(items: unknown): CompletedSessionTask[] {
  return (items as CompletedSessionTask[]) ?? [];
}

/**
 * Creates a Supabase client configured for Expo with AsyncStorage-backed auth session persistence.
 */
function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

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
export async function upsertUserSettings(
  payload: UpsertUserSettingsPayload
): Promise<UserSettings> {
  const {
    userId,
    defaultSessionMinutes,
    defaultBreakMinutes,
    weeklyFocusGoalMinutes,
    notificationsEnabled,
    timezone,
  } = payload;
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      default_session_minutes: defaultSessionMinutes ?? null,
      default_break_minutes: defaultBreakMinutes ?? null,
      weekly_focus_goal_minutes: weeklyFocusGoalMinutes ?? null,
      notifications_enabled: notificationsEnabled ?? null,
      timezone: timezone ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert user settings: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves user settings or null if none exist.
 */
export async function fetchUserSettings(
  userId: string
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user settings: ${error.message}`);
  }

  return data;
}

export interface SessionSettingPayload {
  userId: string;
  title: string;
  focusMinutes?: number | null;
  breakMinutes?: number | null;
  autoStartBreaks?: boolean | null;
  autoRotateTasks?: boolean | null;
}

export interface UpdateSessionSettingPayload {
  sessionSettingId: string;
  userId: string;
  title?: string;
  focusMinutes?: number | null;
  breakMinutes?: number | null;
  autoStartBreaks?: boolean | null;
  autoRotateTasks?: boolean | null;
}

export interface SessionTaskPayload {
  title: string;
  estimatedMinutes?: number | null;
  orderIndex?: number | null;
}

export interface ScheduleSessionPayload {
  userId: string;
  sessionSettingId?: string | null;
  scheduledFor: string;
  durationTargetMinutes?: number | null;
  status?: string | null;
  agenda?: string | null;
  tasks?: SessionTaskPayload[];
}

export interface LogCompletedSessionPayload {
  userId: string;
  scheduledSessionId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  totalFocusMinutes?: number | null;
  totalBreakMinutes?: number | null;
  reflection?: string | null;
  focusScore?: number | null;
  energyLevel?: number | null;
  tasks?: Array<
    SessionTaskPayload & {
      actualMinutes?: number | null;
      completed?: boolean | null;
      notes?: string | null;
    }
  >;
}

/**
 * Creates a reusable session setting preset for a user.
 */
export async function createSessionSetting(
  payload: SessionSettingPayload
): Promise<SessionSetting> {
  const {
    userId,
    title,
    focusMinutes,
    breakMinutes,
    autoStartBreaks,
    autoRotateTasks,
  } = payload;
  const { data, error } = await supabase
    .from("session_settings")
    .insert({
      user_id: userId,
      title,
      focus_minutes: focusMinutes ?? null,
      break_minutes: breakMinutes ?? null,
      auto_start_breaks: autoStartBreaks ?? null,
      auto_rotate_tasks: autoRotateTasks ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session setting: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves all session presets for a given user.
 */
export async function listSessionSettings(
  userId: string
): Promise<SessionSetting[]> {
  const { data, error } = await supabase
    .from("session_settings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list session settings: ${error.message}`);
  }

  return data;
}

/**
 * Updates a session preset that belongs to the user.
 */
export async function updateSessionSetting(
  payload: UpdateSessionSettingPayload
): Promise<SessionSetting> {
  const {
    sessionSettingId,
    userId,
    title,
    focusMinutes,
    breakMinutes,
    autoStartBreaks,
    autoRotateTasks,
  } = payload;
  const { data, error } = await supabase
    .from("session_settings")
    .update({
      title,
      focus_minutes: focusMinutes ?? null,
      break_minutes: breakMinutes ?? null,
      auto_start_breaks: autoStartBreaks ?? null,
      auto_rotate_tasks: autoRotateTasks ?? null,
    })
    .eq("id", sessionSettingId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update session setting: ${error.message}`);
  }

  return data;
}

/**
 * Deletes a session preset owned by the user.
 */
export async function deleteSessionSetting(
  sessionSettingId: string,
  userId: string
) {
  const { error } = await supabase
    .from("session_settings")
    .delete()
    .eq("id", sessionSettingId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete session setting: ${error.message}`);
  }
}

/**
 * Schedules a future session with optional tasks.
 */
export async function scheduleSession(
  payload: ScheduleSessionPayload
): Promise<{ session: ScheduledSession; tasks: SessionTask[] }> {
  const {
    userId,
    sessionSettingId,
    scheduledFor,
    durationTargetMinutes,
    status,
    agenda,
    tasks = [],
  } = payload;

  const { data: session, error: sessionError } = await supabase
    .from("scheduled_sessions")
    .insert({
      user_id: userId,
      session_setting_id: sessionSettingId ?? null,
      scheduled_for: scheduledFor,
      duration_target_minutes: durationTargetMinutes ?? null,
      status: status ?? null,
      agenda: agenda ?? null,
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to schedule session: ${sessionError.message}`);
  }

  let insertedTasks: SessionTask[] = [];

  if (tasks.length > 0) {
    const formattedTasks = tasks.map((task, index) => ({
      scheduled_session_id: session.id,
      title: task.title,
      estimated_minutes: task.estimatedMinutes ?? null,
      order_index: task.orderIndex ?? index,
    }));

    const { data: taskData, error: taskError } = await supabase
      .from("session_tasks")
      .insert(formattedTasks)
      .select();

    if (taskError) {
      await supabase.from("scheduled_sessions").delete().eq("id", session.id);
      throw new Error(`Failed to insert session tasks: ${taskError.message}`);
    }

    insertedTasks = taskData ?? [];
  }

  return { session, tasks: insertedTasks };
}

/**
 * Lists upcoming or past sessions for a user.
 */
export async function fetchScheduledSessions(
  userId: string
): Promise<Array<{ session: ScheduledSession; tasks: SessionTask[] }>> {
  const { data, error } = await supabase
    .from("scheduled_sessions")
    .select(
      `*,
      session_tasks(*)`
    )
    .eq("user_id", userId)
    .order("scheduled_for", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch scheduled sessions: ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    session: {
      agenda: item.agenda,
      created_at: item.created_at,
      duration_target_minutes: item.duration_target_minutes,
      id: item.id,
      scheduled_for: item.scheduled_for,
      session_setting_id: item.session_setting_id,
      status: item.status,
      updated_at: item.updated_at,
      user_id: item.user_id,
    },
    tasks: mapSessionTasks(item.session_tasks),
  }));
}

/**
 * Logs a completed session and snapshots the associated tasks.
 */
export async function logCompletedSession(
  payload: LogCompletedSessionPayload
): Promise<{ session: CompletedSession; tasks: CompletedSessionTask[] }> {
  const {
    userId,
    scheduledSessionId,
    startedAt,
    endedAt,
    totalFocusMinutes,
    totalBreakMinutes,
    reflection,
    focusScore,
    energyLevel,
    tasks = [],
  } = payload;

  const { data: completedSession, error: completedError } = await supabase
    .from("completed_sessions")
    .insert({
      user_id: userId,
      scheduled_session_id: scheduledSessionId ?? null,
      started_at: startedAt ?? null,
      ended_at: endedAt ?? null,
      total_focus_minutes: totalFocusMinutes ?? null,
      total_break_minutes: totalBreakMinutes ?? null,
      reflection: reflection ?? null,
      focus_score: focusScore ?? null,
      energy_level: energyLevel ?? null,
    })
    .select()
    .single();

  if (completedError) {
    throw new Error(
      `Failed to log completed session: ${completedError.message}`
    );
  }

  let insertedTasks: CompletedSessionTask[] = [];

  if (tasks.length > 0) {
    const formattedTasks = tasks.map((task) => ({
      completed_session_id: completedSession.id,
      title: task.title,
      estimated_minutes: task.estimatedMinutes ?? null,
      actual_minutes:
        (task as { actualMinutes?: number | null }).actualMinutes ?? null,
      completed: (task as { completed?: boolean | null }).completed ?? null,
      notes: (task as { notes?: string | null }).notes ?? null,
    }));

    const { data: completedTaskData, error: completedTaskError } =
      await supabase
        .from("completed_session_tasks")
        .insert(formattedTasks)
        .select();

    if (completedTaskError) {
      await supabase
        .from("completed_sessions")
        .delete()
        .eq("id", completedSession.id);
      throw new Error(
        `Failed to snapshot completed session tasks: ${completedTaskError.message}`
      );
    }

    insertedTasks = completedTaskData ?? [];
  }

  return { session: completedSession, tasks: insertedTasks };
}

/**
 * Fetches completed sessions and their task snapshots for a user.
 */
export async function fetchCompletedSessions(
  userId: string
): Promise<
  Array<{ session: CompletedSession; tasks: CompletedSessionTask[] }>
> {
  const { data, error } = await supabase
    .from("completed_sessions")
    .select(
      `*,
      completed_session_tasks(*)`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch completed sessions: ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    session: {
      created_at: item.created_at,
      ended_at: item.ended_at,
      energy_level: item.energy_level,
      focus_score: item.focus_score,
      id: item.id,
      reflection: item.reflection,
      scheduled_session_id: item.scheduled_session_id,
      started_at: item.started_at,
      total_break_minutes: item.total_break_minutes,
      total_focus_minutes: item.total_focus_minutes,
      user_id: item.user_id,
    },
    tasks: mapCompletedSessionTasks(item.completed_session_tasks),
  }));
}
