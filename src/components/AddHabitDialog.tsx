"use client";
import { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Habit } from "../types/habit";

interface AddHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, "id" | "streak" | "doneToday" | "totalDays" | "completedDays" | "createdAt">) => void;
}

const categories = [
  { name: "Health", emoji: "🏃‍♂️", color: "bg-green-500" },
  { name: "Productivity", emoji: "⚡", color: "bg-blue-500" },
  { name: "Learning", emoji: "📚", color: "bg-purple-500" },
  { name: "Mindfulness", emoji: "🧘‍♀️", color: "bg-cyan-500" },
  { name: "Creativity", emoji: "🎨", color: "bg-orange-500" },
  { name: "Social", emoji: "👥", color: "bg-emerald-500" },
  { name: "Other", emoji: "✨", color: "bg-gray-500" },
];

const commonEmojis = [
  "🏃‍♂️", "💪", "🧘‍♀️", "🥗", "💧", "😴", "📚", "✍️", "🎨", "🎵", "🏋️‍♀️", "🚴‍♂️",
  "🧠", "💡", "🎯", "⭐", "🔥", "💎", "🌟", "🌈", "🌱", "🌊", "☀️", "🌙"
];

export function AddHabitDialog({ isOpen, onClose, onAdd }: AddHabitDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(commonEmojis[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        emoji: selectedEmoji,
        category: selectedCategory.name,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setSelectedCategory(categories[0]);
    setSelectedEmoji(commonEmojis[0]);
    setShowEmojiPicker(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg animate-scale-in border border-primary/30 bg-warm-card shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 border border-primary flex items-center justify-center bg-primary shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-text tracking-tight">ADD NEW HABIT</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-3 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Habit Title */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
                Habit Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Exercise, Read 30 minutes..."
                className="w-full px-6 py-4 border border-primary/30 focus:border-primary focus:outline-none bg-warm-card text-text placeholder-text-muted transition-colors font-medium"
                autoFocus
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 border transition-all duration-200 ${
                      selectedCategory.name === category.name
                        ? `border-primary ${category.color} text-white shadow-lg`
                        : "border-primary/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xl mb-2">{category.emoji}</div>
                    <div className="text-sm font-bold uppercase tracking-wider">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Selection */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
                Choose an Emoji
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-16 h-16 text-3xl border border-primary/30 hover:border-primary/50 transition-colors flex items-center justify-center bg-warm-card"
                >
                  {selectedEmoji}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-sm text-text-secondary hover:text-primary transition-colors font-bold uppercase tracking-wider"
                >
                  {showEmojiPicker ? "Hide" : "Change emoji"}
                </button>
              </div>

              {showEmojiPicker && (
                <div className="mt-4 p-4 border border-primary/30 bg-warm-card animate-fade-in shadow-lg">
                  <div className="grid grid-cols-6 gap-3">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="w-12 h-12 text-2xl hover:bg-primary/10 transition-colors flex items-center justify-center border border-primary/30"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 px-6 py-4 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-bold uppercase tracking-wider shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Habit</span>
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
