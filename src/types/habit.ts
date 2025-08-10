export interface Habit {
  id: string;
  title: string;
  emoji: string;
  category: string;
  streak: number;
  doneToday: boolean;
  totalDays: number;
  completedDays: number;
  createdAt: string;
}
