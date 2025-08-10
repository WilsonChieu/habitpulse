"use client";
import { useState } from "react";
import { Check, Edit2, Trash2, Flame, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Habit } from "../types/habit";

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

const categoryColors = {
  Health: "bg-green-500",
  Productivity: "bg-blue-500",
  Learning: "bg-purple-500",
  Mindfulness: "bg-cyan-500",
  Creativity: "bg-orange-500",
  Social: "bg-emerald-500",
  Other: "bg-gray-500",
};

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const progressPercentage = habit.totalDays > 0 ? (habit.completedDays / habit.totalDays) * 100 : 0;
  const categoryColor = categoryColors[habit.category as keyof typeof categoryColors] || categoryColors.Other;

  const handleEdit = () => {
    if (editTitle.trim() && editTitle !== habit.title) {
      onEdit(habit.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(habit.id);
    setShowDeleteConfirm(false);
  };

  const getMotivationalMessage = () => {
    if (habit.streak === 0) return "Start your journey today!";
    if (habit.streak === 1) return "Great start! Keep it up!";
    if (habit.streak < 7) return `${habit.streak} days strong!`;
    if (habit.streak < 30) return `Amazing! ${habit.streak} day streak!`;
    return `Incredible! ${habit.streak} day streak! 🔥`;
  };

  return (
    <Card className="group relative overflow-hidden animate-fade-in border border-primary/30 hover:border-primary/50 transition-all duration-300 bg-warm-card shadow-lg">
      {/* Progress Bar - Subtle and Professional */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
        <div
          className={`h-full ${categoryColor} transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="text-3xl">{habit.emoji}</div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleEdit}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  className="w-full bg-transparent border-b border-primary focus:border-primary-dark focus:outline-none text-xl font-black tracking-tight"
                  autoFocus
                />
              ) : (
                <h3 className="text-xl font-black text-text tracking-tight truncate">
                  {habit.title}
                </h3>
              )}
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs px-3 py-1 border border-primary/30 text-primary font-bold uppercase tracking-wider bg-primary/5">
                  {habit.category}
                </span>
                <div className="flex items-center space-x-2 text-accent">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-black">{habit.streak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 border border-error/30 hover:bg-error hover:text-white transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-secondary font-medium">
                {habit.completedDays}/{habit.totalDays} days
              </span>
            </div>
            <div className="text-sm text-text-secondary font-medium">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <p className="text-sm text-text-secondary mb-6 font-medium">
          {getMotivationalMessage()}
        </p>

        {/* Completion Checkbox */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggle(habit.id)}
            className={`relative w-16 h-16 border transition-all duration-300 ${
              habit.doneToday
                ? "bg-success border-success shadow-lg"
                : "border-primary/30 hover:border-primary"
            } group/checkbox`}
          >
            {habit.doneToday && (
              <Check className="w-8 h-8 text-white absolute inset-0 m-auto animate-celebration" />
            )}
            <div className="absolute inset-0 bg-success/20 opacity-0 group-hover/checkbox:opacity-20 transition-opacity" />
          </button>
          
          <span className="text-sm text-text-secondary font-medium">
            {habit.doneToday ? "Completed today! 🎉" : "Mark as complete"}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="bg-warm-card p-8 border border-primary/30 max-w-sm mx-4 animate-scale-in shadow-lg">
            <h3 className="text-xl font-black text-text mb-4">Delete Habit?</h3>
            <p className="text-text-secondary mb-6 font-medium">
              Are you sure you want to delete "{habit.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-error text-white border border-error hover:bg-red-600 transition-all duration-200 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
