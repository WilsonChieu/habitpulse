"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Volume2, VolumeX, Smartphone } from "lucide-react";
import { Card } from "./ui/card";
import { 
  notificationManager, 
  requestNotificationPermission, 
  isNotificationSupported, 
  isNotificationEnabled, 
  getNotificationSettings, 
  updateNotificationSettings,
  type NotificationSettings 
} from "../utils/notifications";

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyReminder: true,
    streakWarning: true,
    reminderTime: "09:00",
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const supported = isNotificationSupported();
    const enabled = isNotificationEnabled();
    const currentSettings = getNotificationSettings();

    setIsSupported(supported);
    setIsEnabled(enabled);
    setSettings(currentSettings);
  };

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setIsEnabled(granted);
      if (granted) {
        setSettings(prev => ({ ...prev, enabled: true }));
        await notificationManager.initialize();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="animate-scale-in border border-primary/30 bg-warm-card shadow-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 border border-primary flex items-center justify-center bg-primary shadow-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-text tracking-tight">NOTIFICATIONS</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            {/* Permission Status */}
            {!isSupported ? (
              <div className="text-center py-8">
                <BellOff className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-black text-text mb-2">Not Supported</h3>
                <p className="text-sm text-text-secondary">
                  Notifications are not supported in your browser or device.
                </p>
              </div>
            ) : !isEnabled ? (
              <div className="text-center py-6 mb-6">
                <Bell className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-black text-text mb-2">Enable Notifications</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Get reminded about your habits and never break your streaks!
                </p>
                <button
                  onClick={handlePermissionRequest}
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-200 font-bold uppercase tracking-wide shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Requesting..." : "Enable Notifications"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Daily Reminder */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-black text-text">Daily Reminder</h3>
                        <p className="text-xs text-text-secondary">Get reminded to complete your habits</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dailyReminder}
                        onChange={(e) => handleSettingChange('dailyReminder', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  {settings.dailyReminder && (
                    <div className="ml-8">
                      <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                        className="px-3 py-2 border border-primary/30 focus:border-primary focus:outline-none bg-warm-card text-text font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Streak Warning */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border border-primary flex items-center justify-center bg-primary">
                      <span className="text-xs text-white font-bold">🔥</span>
                    </div>
                    <div>
                      <h3 className="font-black text-text">Streak Warning</h3>
                      <p className="text-xs text-text-secondary">Get warned before breaking streaks</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.streakWarning}
                      onChange={(e) => handleSettingChange('streakWarning', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-text-muted" />
                    )}
                    <div>
                      <h3 className="font-black text-text">Sound</h3>
                      <p className="text-xs text-text-secondary">Play notification sounds</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Vibration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-black text-text">Vibration</h3>
                      <p className="text-xs text-text-secondary">Vibrate on notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.vibrationEnabled}
                      onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Test Notification */}
                <div className="pt-4 border-t border-primary/20">
                  <button
                    onClick={() => notificationManager.showNotification(
                      'HabitPulse Test',
                      'This is a test notification! 🎉',
                      'reminder'
                    )}
                    className="w-full px-4 py-3 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold uppercase tracking-wide"
                  >
                    Test Notification
                  </button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-primary/20">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-200 font-bold uppercase tracking-wide shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
