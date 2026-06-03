// Service Worker for push notifications
// Place this file in your project's public/ folder

self.addEventListener("push", event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Peeps Reminder", {
      body: data.body || "Time to reach out!",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/peeps"));
});
