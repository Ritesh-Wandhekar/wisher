// public/sw.js — Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "wisher-notification",
    renotify: true,
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "generate", title: "✨ Generate Wish" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "generate") {
    event.waitUntil(clients.openWindow(url));
  } else if (event.action !== "dismiss") {
    event.waitUntil(clients.openWindow(url));
  }
});
