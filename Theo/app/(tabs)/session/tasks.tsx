// app/(tabs)/session/tasks.ts

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface Task {
  name: string;
  time: number; // seconds
}

// These are template tasks. Session-specific status is tracked in SessionScreen.
export const TASKS: Task[] = [
  { name: "Read pages 20–30", time: 10 * 60 },
  { name: "Write summary", time: 15 * 60 },
  { name: "Create flashcards", time: 8 * 60 },
];
