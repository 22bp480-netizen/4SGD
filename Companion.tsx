export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  value: boolean;
  type: 'health' | 'study' | 'custom';
}

export interface EmotionEntry {
  id: string;
  emotion: string; // e.g. "happy", "anxious", "focused"
  note: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  image?: string;
  drawing?: string;
  annotation?: string;
  timestamp: string;
}
