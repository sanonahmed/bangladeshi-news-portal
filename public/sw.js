// Service Worker for "দৈনিক বাংলাদেশ বার্তা" Web Push & Breaking Alerts
const CACHE_NAME = 'bd-barta-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push event from server
self.addEventListener('push', (event) => {
  let data = {
    title: 'দৈনিক বাংলাদেশ বার্তা - ব্রেকিং নিউজ',
    body: 'একটি নতুন গুরুত্বপূর্ণ সংবাদ প্রকাশিত হয়েছে।',
    url: '/',
    category: 'breaking',
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      category: data.category || 'breaking',
    },
    actions: [
      { action: 'read', title: 'এখনই পড়ুন' },
      { action: 'close', title: 'পরে দেখুন' }
    ],
    tag: data.id || 'breaking-alert-' + Date.now(),
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ব্রেকিং অ্যালার্ট', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
