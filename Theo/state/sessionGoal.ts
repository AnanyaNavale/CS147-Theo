type Listener = (goal: string) => void;

let currentGoal = "";
const listeners = new Set<Listener>();

export function setSessionGoal(goal: string) {
  currentGoal = goal;
  listeners.forEach((fn) => fn(currentGoal));
}

export function getSessionGoal() {
  return currentGoal;
}

export function subscribeSessionGoal(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
