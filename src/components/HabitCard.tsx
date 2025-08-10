"use client";
import { useState } from "react";
import { Check, Edit2, Trash2, Flame, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Habit } from "../types/habit";

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string, newCategory: string) => void;
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

const categories = [
  { name: "Health", emoji: "🏃‍♂️", color: "bg-green-500" },
  { name: "Productivity", emoji: "⚡", color: "bg-blue-500" },
  { name: "Learning", emoji: "📚", color: "bg-purple-500" },
  { name: "Mindfulness", emoji: "🧘‍♀️", color: "bg-cyan-500" },
  { name: "Creativity", emoji: "🎨", color: "bg-orange-500" },
  { name: "Social", emoji: "👥", color: "bg-emerald-500" },
  { name: "Other", emoji: "✨", color: "bg-gray-500" },
];

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);
  const [editCategory, setEditCategory] = useState(habit.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const progressPercentage = habit.totalDays > 0 ? (habit.completedDays / habit.totalDays) * 100 : 0;
  const categoryColor = categoryColors[habit.category as keyof typeof categoryColors] || categoryColors.Other;

  const handleEdit = () => {
    if (editTitle.trim() && (editTitle !== habit.title || editCategory !== habit.category)) {
      onEdit(habit.id, editTitle.trim(), editCategory);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(habit.title);
    setEditCategory(habit.category);
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

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="text-2xl">{habit.emoji}</div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                    className="w-full bg-transparent border-b border-primary focus:border-primary-dark focus:outline-none text-lg font-black tracking-tight"
                    autoFocus
                  />
                  <div className="grid grid-cols-3 gap-1">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setEditCategory(category.name)}
                        className={`p-2 text-xs border transition-all duration-200 ${
                          editCategory === category.name
                            ? `border-primary ${category.color} text-white`
                            : "border-primary/30 hover:border-primary/50"
                        }`}
                      >
                        <div className="text-sm mb-1">{category.emoji}</div>
                        <div className="font-bold uppercase tracking-wider">{category.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1 bg-primary text-white text-xs font-bold border border-primary hover:bg-primary-dark transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 border border-primary/30 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-black text-text tracking-tight truncate">
                    {habit.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 border border-primary/30 text-primary font-bold uppercase tracking-wider bg-primary/5">
                      {habit.category}
                    </span>
                    <div className="flex items-center space-x-1 text-accent">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs font-black">{habit.streak}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions - Always visible on mobile */}
          {!isEditing && (
            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 border border-error/30 hover:bg-error hover:text-white transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Progress Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-secondary font-medium">
                {habit.completedDays}/{habit.totalDays} days
              </span>
            </div>
            <div className="text-xs text-text-secondary font-medium">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <p className="text-xs text-text-secondary mb-4 font-medium">
          {getMotivationalMessage()}
        </p>

        {/* Completion Checkbox */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggle(habit.id)}
            className={`relative w-12 h-12 border transition-all duration-300 ${
              habit.doneToday
                ? "bg-success border-success shadow-lg"
                : "border-primary/30 hover:border-primary"
            } group/checkbox`}
          >
            {habit.doneToday && (
              <Check className="w-6 h-6 text-white absolute inset-0 m-auto animate-celebration" />
            )}
            <div className="absolute inset-0 bg-success/20 opacity-0 group-hover/checkbox:opacity-20 transition-opacity" />
          </button>
          
          <span className="text-xs text-text-secondary font-medium">
            {habit.doneToday ? "Completed today! 🎉" : "Mark as complete"}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="bg-warm-card p-6 border border-primary/30 max-w-sm mx-4 animate-scale-in shadow-lg">
            <h3 className="text-lg font-black text-text mb-3">Delete Habit?</h3>
            <p className="text-text-secondary mb-4 font-medium text-sm">
              Are you sure you want to delete &ldquo;{habit.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-error text-white border border-error hover:bg-red-600 transition-all duration-200 font-bold text-sm"
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
