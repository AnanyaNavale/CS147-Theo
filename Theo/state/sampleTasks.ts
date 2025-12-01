export interface Task {
  name: string;
  time: number; // seconds
}

// Template tasks used only as placeholders.
export const SAMPLE_TASKS: Task[] = [
  { name: "Read pages 20-30", time: 10 * 60 },
  { name: "Write summary", time: 15 * 60 },
  { name: "Create flashcards", time: 8 * 60 },
];
