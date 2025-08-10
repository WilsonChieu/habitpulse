// Service Worker for HabitPulse PWA
const CACHE_NAME = 'habitpulse-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to check your habits!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'complete',
        title: 'Complete Now',
        icon: '/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HabitPulse Reminder', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'complete') {
    // Open the app to complete habits
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just dismiss the notification
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for habit reminders
self.addEventListener('sync', (event) => {
  if (event.tag === 'habit-reminder') {
    event.waitUntil(sendHabitReminder());
  }
});

// Function to send habit reminder
async function sendHabitReminder() {
  try {
    // Get stored habits from IndexedDB or localStorage
    const habits = await getStoredHabits();
    
    if (habits && habits.length > 0) {
      const incompleteHabits = habits.filter(habit => !habit.doneToday);
      
      if (incompleteHabits.length > 0) {
        const options = {
          body: `You have ${incompleteHabits.length} habit${incompleteHabits.length > 1 ? 's' : ''} to complete today!`,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'habit-reminder',
          requireInteraction: true,
          actions: [
            {
              action: 'complete',
              title: 'Complete Now',
              icon: '/icon-72x72.png'
            }
          ]
        };

        await self.registration.showNotification('HabitPulse Reminder', options);
      }
    }
  } catch (error) {
    console.error('Error sending habit reminder:', error);
  }
}

// Helper function to get stored habits
async function getStoredHabits() {
  try {
    // Try to get from localStorage via postMessage
    const client = await clients.get(event.clientId);
    if (client) {
      client.postMessage({ type: 'GET_HABITS' });
    }
  } catch (error) {
    console.error('Error getting stored habits:', error);
  }
  return [];
}
