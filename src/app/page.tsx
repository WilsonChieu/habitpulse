"use client";
import { useState, useEffect } from "react";
import { Plus, Zap, Sparkles, Bell } from "lucide-react";
import { HabitCard } from "../components/HabitCard";
import { AddHabitDialog } from "../components/AddHabitDialog";
import { ProgressStats } from "../components/ProgressStats";
import { NotificationSettings } from "../components/NotificationSettings";
import { notificationManager, showNotification } from "../utils/notifications";
import { Habit } from "../types/habit";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [lastCompletedHabit, setLastCompletedHabit] = useState<string | null>(null);

  // Load habits from localStorage
  useEffect(() => {
    const storedHabits = localStorage.getItem("habitpulse-habits");
    if (storedHabits) {
      try {
        const parsedHabits = JSON.parse(storedHabits);
        setHabits(parsedHabits);
      } catch (error) {
        console.error("Error loading habits:", error);
      }
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habitpulse-habits", JSON.stringify(habits));
  }, [habits]);

  // Initialize notification system
  useEffect(() => {
    notificationManager.initialize();
  }, []);

  // Check for daily reset
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem("habitpulse-last-reset");
      
      if (lastReset !== today) {
        setHabits(prevHabits =>
          prevHabits.map(habit => ({
            ...habit,
            doneToday: false
          }))
        );
        localStorage.setItem("habitpulse-last-reset", today);
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Add new habit
  const addHabit = (title: string, emoji: string, category: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      emoji,
      category,
      streak: 0,
      doneToday: false,
      totalDays: 0,
      completedDays: 0,
      createdAt: new Date().toISOString(),
    };

    setHabits(prev => [...prev, newHabit]);
    setShowAddDialog(false);
  };

  // Toggle habit completion
  const toggleHabit = (id: string) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === id) {
          const wasCompleted = habit.doneToday;
          const newDoneToday = !wasCompleted;
          
          let newStreak = habit.streak;
          let newCompletedDays = habit.completedDays;
          let newTotalDays = habit.totalDays;

          if (newDoneToday) {
            // Marking as completed today
            newCompletedDays += 1;
            newTotalDays += 1;
            newStreak += 1;
            
            // Show completion notification
            setLastCompletedHabit(habit.title);
            setTimeout(() => setLastCompletedHabit(null), 3000);

            // Send streak milestone notifications
            if (newStreak === 1) {
              showNotification(
                'First Day! 🎉',
                `Great start with "${habit.title}"! Keep it up!`,
                'success'
              );
            } else if (newStreak === 7) {
              showNotification(
                'Week Streak! 🔥',
                `Amazing! 7-day streak with "${habit.title}"!`,
                'success'
              );
            } else if (newStreak === 30) {
              showNotification(
                'Month Streak! 🏆',
                `Incredible! 30-day streak with "${habit.title}"!`,
                'success'
              );
            }
          } else {
            // Marking as incomplete today
            newStreak = 0; // Reset streak if unchecking
          }

          return {
            ...habit,
            doneToday: newDoneToday,
            streak: newStreak,
            completedDays: newCompletedDays,
            totalDays: newTotalDays,
          };
        }
        return habit;
      });

      return updatedHabits;
    });
  };

  // Edit habit title
  const editHabit = (id: string, newTitle: string, newCategory: string) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === id ? { ...habit, title: newTitle, category: newCategory } : habit
      )
    );
  };

  // Delete habit
  const deleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  return (
    <div className="min-h-screen bg-warm">
      {/* Compact Header */}
      <div className="relative border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border border-primary flex items-center justify-center bg-primary shadow-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tighter text-text">
                  HABITPULSE
                </h1>
                <p className="text-xs text-text-secondary font-medium">
                  Transform your life
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAddDialog(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 sm:w-auto sm:px-4 sm:py-2 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-300 shadow-lg flex items-center justify-center"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-2 text-sm font-bold uppercase tracking-wide">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Habits Grid - Immediately Visible */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 border border-primary flex items-center justify-center bg-primary shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black text-text mb-4 tracking-tighter">
              START YOUR HABIT JOURNEY
            </h3>
            <p className="text-base text-text-secondary mb-6 max-w-md mx-auto font-medium">
              Create your first habit and begin building the life you&apos;ve always wanted.
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-300 font-black tracking-wide uppercase shadow-lg"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
          <div className="mt-8">
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

      {/* Notification Settings Dialog */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Completion Toast */}
      {lastCompletedHabit && (
        <div className="fixed bottom-4 right-4 bg-success text-white px-4 py-3 border border-success animate-slide-in z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border border-white flex items-center justify-center bg-white/20">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <p className="font-black uppercase tracking-wide text-xs">Great job!</p>
              <p className="text-xs font-medium">&ldquo;{lastCompletedHabit}&rdquo; completed!</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <footer className="border-t border-primary/20 py-4 mt-8 bg-warm-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">
            HabitPulse • Transform Your Life
          </p>
        </div>
      </footer>
    </div>
  );
}
