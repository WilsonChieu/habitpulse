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
  showNotification,
  showSimpleNotification,
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
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    console.log('Loading notification settings...');
    console.log('Window object:', typeof window);
    console.log('Notification API available:', 'Notification' in window);
    console.log('Service Worker available:', 'serviceWorker' in navigator);
    
    const supported = isNotificationSupported();
    const enabled = isNotificationEnabled();
    const currentSettings = getNotificationSettings();

    console.log('Notification supported:', supported);
    console.log('Notification enabled:', enabled);
    console.log('Current settings:', currentSettings);
    console.log('Browser permission:', Notification.permission);

    setIsSupported(supported);
    setIsEnabled(enabled);
    setSettings(currentSettings);
  };

  const handlePermissionRequest = async () => {
    console.log('Requesting notification permission...');
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      console.log('Permission granted:', granted);
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

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="animate-scale-in border border-primary/30 bg-warm-card shadow-lg">
          <div className="p-4 sm:p-6">
            {/* Header */}
                         <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-2 sm:space-x-3">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 border border-primary flex items-center justify-center bg-primary shadow-lg">
                   <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                 </div>
                 <h2 className="text-lg sm:text-xl font-black text-text tracking-tight">NOTIFICATIONS</h2>
               </div>
                             <button
                 onClick={onClose}
                 className="p-1.5 sm:p-2 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
               >
                 <span className="text-base sm:text-lg">×</span>
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
                   className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-200 font-bold uppercase tracking-wide shadow-lg disabled:opacity-50 text-sm sm:text-base"
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
                     onClick={async () => {
                       console.log('Test notification clicked');
                       console.log('Notification permission:', Notification.permission);
                       console.log('Notification supported:', 'Notification' in window);
                       
                       setIsTesting(true);
                       setTestResult('');
                       
                       try {
                         // Try the main notification function first
                         await showNotification(
                           'HabitPulse Test',
                           'This is a test notification! 🎉',
                           'reminder'
                         );
                         setTestResult('✅ Notification sent successfully! Check your system notifications.');
                       } catch (error) {
                         console.log('Main notification failed, trying fallback:', error);
                         // Fallback to simple notification
                         showSimpleNotification(
                           'HabitPulse Test',
                           'This is a test notification! 🎉'
                         );
                         setTestResult('⚠️ Main notification failed, but fallback was sent. Check your system notifications.');
                       }
                     }}
                     disabled={isTesting}
                     className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold uppercase tracking-wide text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isTesting ? 'Sending...' : 'Test Notification'}
                   </button>
                   
                   {/* Test Result Display */}
                   {testResult && (
                     <div className="mt-3 p-3 border border-primary/20 bg-primary/5 rounded">
                       <p className="text-sm text-text font-medium">{testResult}</p>
                     </div>
                   )}
                   
                   {/* Debug Info */}
                   <div className="mt-3 p-3 border border-primary/10 bg-primary/5 rounded text-xs">
                     <p className="text-text-secondary mb-1">
                       <strong>Permission:</strong> {Notification.permission}
                     </p>
                     <p className="text-text-secondary mb-1">
                       <strong>Supported:</strong> {'Notification' in window ? 'Yes' : 'No'}
                     </p>
                     <p className="text-text-secondary mb-1">
                       <strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Yes' : 'No'}
                     </p>
                     <p className="text-text-secondary">
                       <strong>Browser:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
                     </p>
                   </div>
                   
                   {/* Simple Browser Test */}
                   <div className="mt-3 pt-3 border-t border-primary/10">
                     <button
                       onClick={() => {
                         if (Notification.permission === 'granted') {
                           new Notification('Simple Test', { body: 'This is a direct browser notification test!' });
                           setTestResult('🔔 Simple browser notification sent! You should see it now.');
                         } else if (Notification.permission === 'default') {
                           Notification.requestPermission().then(permission => {
                             if (permission === 'granted') {
                               new Notification('Simple Test', { body: 'Permission granted! This is a test notification.' });
                               setTestResult('🔔 Permission granted and simple notification sent!');
                             } else {
                               setTestResult('❌ Permission denied. Please enable notifications in your browser settings.');
                             }
                           });
                         } else {
                           setTestResult('❌ Permission denied. Please enable notifications in your browser settings.');
                         }
                       }}
                       className="w-full px-3 py-2 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all duration-200 font-bold uppercase tracking-wide text-xs"
                     >
                       Test Simple Browser Notification
                     </button>
                     
                     <button
                       onClick={() => {
                         setTestResult('');
                         setIsTesting(false);
                       }}
                       className="w-full mt-2 px-3 py-2 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-bold uppercase tracking-wide text-xs"
                     >
                       Clear Results
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-primary/20">
                             <button
                 onClick={onClose}
                 className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-white border border-primary hover:bg-primary-dark transition-all duration-200 font-bold uppercase tracking-wide shadow-lg text-sm sm:text-base"
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
