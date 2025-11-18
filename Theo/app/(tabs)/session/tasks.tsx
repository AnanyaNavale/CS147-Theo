export interface Task {
  name: string;
  time: number;
}

// TODO: Replace mock data with real tasks from backend/state.
export const TASKS: Task[] = [
  { name: "Read pages 20–30", time: 10 },
  { name: "Write summary", time: 15 },
  { name: "Create flashcards", time: 8 * 60 },
];
