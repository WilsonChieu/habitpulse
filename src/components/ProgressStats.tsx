"use client";
import { Trophy, Target, Flame, TrendingUp, Star } from "lucide-react";
import { Card } from "./ui/card";
import { Habit } from "../types/habit";

interface ProgressStatsProps {
  habits: Habit[];
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  delay?: number;
}

function StatCard({ icon, title, value, subtitle, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className={`p-8 animate-fade-in border border-primary/30 hover:border-primary/50 transition-all duration-300 bg-warm-card shadow-lg`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-black text-text mb-2 tracking-tight">
            {value}
          </p>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
        <div className="w-16 h-16 border border-primary flex items-center justify-center bg-primary">
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProgressStats({ habits }: ProgressStatsProps) {
  // Calculate statistics
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.doneToday).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  const streaks = habits.map(h => h.streak);
  const averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;
  const longestStreak = Math.max(...streaks, 0);
  
  const totalCompletedDays = habits.reduce((sum, habit) => sum + habit.completedDays, 0);
  const totalDays = habits.reduce((sum, habit) => sum + habit.totalDays, 0);
  const overallProgress = totalDays > 0 ? Math.round((totalCompletedDays / totalDays) * 100) : 0;

  const getMotivationalMessage = () => {
    if (totalHabits === 0) return "Start your habit journey today!";
    if (completionRate === 100) return "Perfect day! You're on fire! 🔥";
    if (completionRate >= 80) return "Amazing progress! Keep it up!";
    if (completionRate >= 60) return "Great work! You're building momentum!";
    if (completionRate >= 40) return "Good start! Every step counts!";
    return "Don't give up! Tomorrow is a new opportunity!";
  };

  const getCompletionEmoji = () => {
    if (completionRate === 100) return "🎉";
    if (completionRate >= 80) return "🔥";
    if (completionRate >= 60) return "💪";
    if (completionRate >= 40) return "👍";
    return "🌟";
  };

  if (totalHabits === 0) {
    return (
      <Card className="p-12 text-center animate-fade-in border border-primary/30 bg-warm-card shadow-lg">
        <div className="w-20 h-20 mx-auto mb-6 border border-primary flex items-center justify-center bg-primary shadow-lg">
          <Star className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-black text-text mb-4 tracking-tight">
          WELCOME TO HABITPULSE
        </h3>
        <p className="text-text-secondary mb-6 font-medium">
          Start building amazing habits that will transform your life.
        </p>
        <div className="text-sm text-primary uppercase tracking-widest font-bold">
          Add your first habit to see your progress dashboard
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Today's Progress */}
      <Card className="p-8 border border-primary/30 animate-fade-in bg-warm-card shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-text tracking-tight">
              TODAY&apos;S PROGRESS
            </h3>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-4xl">{getCompletionEmoji()}</div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-text-secondary font-bold uppercase tracking-wider">Completion Rate</span>
            <span className="font-black text-text">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="h-2 bg-primary transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-text-secondary font-medium">
          {getMotivationalMessage()}
        </p>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Target className="w-6 h-6" />}
          title="Today's Progress"
          value={`${completedToday}/${totalHabits}`}
          subtitle="habits completed"
          delay={0}
        />
        
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          title="Average Streak"
          value={averageStreak}
          subtitle="days across habits"
          delay={100}
        />
        
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          title="Longest Streak"
          value={longestStreak}
          subtitle="days achieved"
          delay={200}
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Overall Progress"
          value={`${overallProgress}%`}
          subtitle="total completion"
          delay={300}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center animate-fade-in border border-primary/30 bg-warm-card shadow-lg" style={{ animationDelay: '400ms' }}>
          <div className="text-3xl font-black text-text mb-2">{totalHabits}</div>
          <div className="text-sm text-text-secondary font-bold uppercase tracking-wider">Total Habits</div>
        </Card>
        
        <Card className="p-6 text-center animate-fade-in border border-success/30 bg-warm-card shadow-lg" style={{ animationDelay: '500ms' }}>
          <div className="text-3xl font-black text-success mb-2">{totalCompletedDays}</div>
          <div className="text-sm text-text-secondary font-bold uppercase tracking-wider">Days Completed</div>
        </Card>
        
        <Card className="p-6 text-center animate-fade-in border border-accent/30 bg-warm-card shadow-lg" style={{ animationDelay: '600ms' }}>
          <div className="text-3xl font-black text-accent mb-2">
            {habits.filter(h => h.streak > 0).length}
          </div>
          <div className="text-sm text-text-secondary font-bold uppercase tracking-wider">Active Streaks</div>
        </Card>
      </div>
    </div>
  );
}
