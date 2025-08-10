"use client";
import { useState, useEffect } from "react";
import { Plus, Sparkles, Zap } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { Habit } from "@/types/habit";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { ProgressStats } from "@/components/ProgressStats";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lastCompletedHabit, setLastCompletedHabit] = useState<string | null>(null);

  // Load habits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("habitpulse");
    if (saved) {
      try {
        const parsedHabits = JSON.parse(saved);
        // Migrate old habit format if needed
        const migratedHabits = parsedHabits.map((habit: Habit) => {
          if (!habit.emoji) habit.emoji = "✨";
          if (!habit.category) habit.category = "Other";
          if (!habit.totalDays) habit.totalDays = 0;
          if (!habit.completedDays) habit.completedDays = 0;
          if (!habit.createdAt) habit.createdAt = new Date().toISOString();
          return habit;
        });
        setHabits(migratedHabits);
      } catch (error) {
        console.error("Error loading habits:", error);
      }
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habitpulse", JSON.stringify(habits));
  }, [habits]);

  // Reset daily completion at midnight
  useEffect(() => {
    const checkAndResetDaily = () => {
      const now = new Date();
      const lastReset = localStorage.getItem("habitpulse_lastReset");
      const lastResetDate = lastReset ? new Date(lastReset) : null;
      
      if (!lastResetDate || lastResetDate.toDateString() !== now.toDateString()) {
        setHabits(prevHabits => 
          prevHabits.map(habit => ({
            ...habit,
            doneToday: false,
            totalDays: habit.totalDays + 1
          }))
        );
        localStorage.setItem("habitpulse_lastReset", now.toISOString());
      }
    };

    checkAndResetDaily();
    const interval = setInterval(checkAndResetDaily, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Add a new habit
  const addHabit = (habitData: Omit<Habit, "id" | "streak" | "doneToday" | "totalDays" | "completedDays" | "createdAt">) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      ...habitData,
      streak: 0,
      doneToday: false,
      totalDays: 0,
      completedDays: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits([newHabit, ...habits]);
  };

  // Toggle habit completion for today
  const toggleHabit = (id: string) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          const wasCompleted = habit.doneToday;
          const newStreak = wasCompleted 
            ? Math.max(0, habit.streak - 1) 
            : habit.streak + 1;
          
          if (!wasCompleted) {
            setLastCompletedHabit(habit.title);
            setTimeout(() => setLastCompletedHabit(null), 3000);
          }
          
          return {
            ...habit,
            doneToday: !wasCompleted,
            streak: newStreak,
            completedDays: wasCompleted ? habit.completedDays - 1 : habit.completedDays + 1,
            totalDays: wasCompleted ? habit.totalDays - 1 : habit.totalDays + 1
          };
        }
        return habit;
      })
    );
  };

  // Edit habit title
  const editHabit = (id: string, newTitle: string) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === id ? { ...habit, title: newTitle } : habit
      )
    );
  };

  // Delete habit
  const deleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  return (
    <div className="min-h-screen bg-warm">
      {/* Compact Hero Header */}
      <div className="relative border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border border-primary flex items-center justify-center bg-primary shadow-lg">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-text">
                  HABITPULSE
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary font-medium">
                  Transform your life one habit at a time
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-300 shadow-lg text-sm font-bold uppercase tracking-wide"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Habit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Habits First */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Quick Progress Summary */}
        {habits.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-warm-card border border-primary/30 p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-black text-text">Today&apos;s Progress</h2>
                <span className="text-2xl sm:text-3xl font-black text-primary">
                  {habits.filter(h => h.doneToday).length}/{habits.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-3 bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${habits.length > 0 ? (habits.filter(h => h.doneToday).length / habits.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Habits Grid - Immediately Visible */}
        {habits.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 border border-primary flex items-center justify-center bg-primary shadow-lg">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text mb-4 tracking-tighter">
              START YOUR HABIT JOURNEY
            </h3>
            <p className="text-base sm:text-lg text-text-secondary mb-6 max-w-md mx-auto font-medium">
              Create your first habit and begin building the life you&apos;ve always wanted.
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-300 font-black tracking-wide uppercase shadow-lg"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="japanese-grid">
            {habits.map((habit, index) => (
              <div
                key={habit.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <HabitCard
                  habit={habit}
                  onToggle={toggleHabit}
                  onEdit={editHabit}
                  onDelete={deleteHabit}
                />
              </div>
            ))}
          </div>
        )}

        {/* Detailed Stats - Below Habits */}
        {habits.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <ProgressStats habits={habits} />
          </div>
        )}
      </div>

      {/* Add Habit Dialog */}
      <AddHabitDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={addHabit}
      />

      {/* Completion Toast - Professional */}
      {lastCompletedHabit && (
        <div className="fixed bottom-8 right-8 bg-success text-white px-6 py-4 border border-success animate-slide-in z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border border-white flex items-center justify-center bg-white/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black uppercase tracking-wide text-sm">Great job!</p>
              <p className="text-xs font-medium">&ldquo;{lastCompletedHabit}&rdquo; completed!</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <footer className="border-t border-primary/20 py-4 mt-8 bg-warm-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-primary uppercase tracking-widest font-bold">
            HabitPulse • Transform Your Life One Habit at a Time
          </p>
        </div>
      </footer>
    </div>
  );
}
