// Notification utility for HabitPulse
export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  streakWarning: boolean;
  reminderTime: string; // "09:00" format
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

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

class NotificationManager {
  private settings: NotificationSettings;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.init();
  }

  private loadSettings(): NotificationSettings {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    
    const stored = localStorage.getItem('habitpulse-notification-settings');
    if (stored) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: false,
      dailyReminder: true,
      streakWarning: true,
      reminderTime: "09:00",
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('habitpulse-notification-settings', JSON.stringify(this.settings));
  }

  private async init() {
    if (typeof window === 'undefined') return;
    
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'GET_HABITS') {
          const habits = this.getStoredHabits();
          event.ports[0]?.postMessage({ habits });
        }
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private getStoredHabits(): Habit[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('habitpulse-habits');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored habits:', error);
      return [];
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.settings.enabled = permission === 'granted';
      this.saveSettings();
      return this.settings.enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return this.settings.enabled && Notification.permission === 'granted';
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Reschedule reminders if settings changed
    if (newSettings.enabled !== undefined || newSettings.reminderTime !== undefined) {
      this.scheduleReminders();
    }
  }

  // Schedule daily reminders
  async scheduleReminders() {
    if (!this.isEnabled() || !this.settings.dailyReminder) {
      this.clearReminders();
      return;
    }

    try {
      // Parse reminder time
      const [hours, minutes] = this.settings.reminderTime.split(':').map(Number);
      
      // Calculate next reminder time
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // If today's reminder time has passed, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const delay = reminderTime.getTime() - now.getTime();

      // Schedule the reminder
      setTimeout(() => {
        this.sendDailyReminder();
        // Schedule next day's reminder
        this.scheduleReminders();
      }, delay);

      console.log(`Daily reminder scheduled for ${reminderTime.toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  // Clear all scheduled reminders
  clearReminders() {
    // Clear any existing timeouts (in a real app, you'd use more sophisticated scheduling)
    console.log('Reminders cleared');
  }

  // Send daily reminder notification
  async sendDailyReminder() {
    if (!this.isEnabled()) return;

    const habits = this.getStoredHabits();
    if (habits.length === 0) return;

    const incompleteHabits = habits.filter(habit => !habit.doneToday);
    
    if (incompleteHabits.length === 0) {
      // All habits completed - send motivational message
      this.showNotification(
        'HabitPulse',
        'Amazing! All your habits are completed for today! 🎉',
        'success'
      );
      return;
    }

    // Send reminder for incomplete habits
    const message = incompleteHabits.length === 1
      ? `Don't forget to complete "${incompleteHabits[0].title}" today!`
      : `You have ${incompleteHabits.length} habits to complete today!`;

    this.showNotification('HabitPulse Reminder', message, 'reminder');
  }

  // Send streak warning notification
  async sendStreakWarning(habit: Habit) {
    if (!this.isEnabled() || !this.settings.streakWarning) return;

    const message = `Don't break your ${habit.streak}-day streak! Complete "${habit.title}" today! 🔥`;
    this.showNotification('Streak Warning', message, 'warning');
  }

  // Show a notification
  async showNotification(title: string, body: string, type: 'reminder' | 'warning' | 'success' = 'reminder') {
    if (!this.isEnabled()) return;

    try {
      const options: NotificationOptions = {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: `habitpulse-${type}`,
        requireInteraction: type === 'warning'
      };

      // Add vibration if enabled (only in service worker context)
      if (this.settings.vibrationEnabled && 'vibrate' in options) {
        (options as any).vibrate = [200, 100, 200];
      }

      // Show notification
      if (this.registration) {
        await this.registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Check and send streak warnings for habits that might break streaks
  checkStreakWarnings() {
    if (!this.isEnabled() || !this.settings.streakWarning) return;

    const habits = this.getStoredHabits();
    const now = new Date();

    habits.forEach(habit => {
      if (!habit.doneToday && habit.streak > 0) {
        // Check if it's getting late in the day (after 6 PM)
        const hour = now.getHours();
        if (hour >= 18) {
          this.sendStreakWarning(habit);
        }
      }
    });
  }

  // Initialize notification system
  async initialize() {
    if (!this.isSupported()) {
      console.log('Notifications not supported');
      return false;
    }

    // Schedule reminders
    this.scheduleReminders();

    // Set up periodic checks for streak warnings
    setInterval(() => {
      this.checkStreakWarnings();
    }, 30 * 60 * 1000); // Check every 30 minutes

    return true;
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export utility functions
export const requestNotificationPermission = () => notificationManager.requestPermission();
export const isNotificationSupported = () => notificationManager.isSupported();
export const isNotificationEnabled = () => notificationManager.isEnabled();
export const getNotificationSettings = () => notificationManager.getSettings();
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => 
  notificationManager.updateSettings(settings);
export const showNotification = (title: string, body: string, type?: 'reminder' | 'warning' | 'success') =>
  notificationManager.showNotification(title, body, type);
