// Kalon Beauty Land — Web Push Service Worker (for GitHub Pages / HTTPS hosting)
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("push", function (event) {
  var data = { title: "Kalon Beauty Land", body: "پیام جدیدی از کلینیک برای شما ارسال شده است.", url: "./" };
  try {
    if (event.data) {
      var p = event.data.json();
      if (p && typeof p.title === "string" && p.title.trim()) data.title = p.title.trim();
      if (p && typeof p.body === "string" && p.body.trim()) data.body = p.body.trim();
    }
  } catch (_) {
    try { var t = event.data && event.data.text ? event.data.text().trim() : ""; if (t) data.body = t; } catch (__) {}
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    dir: "rtl",
    lang: "fa",
    tag: "kalon-push-" + Date.now(),
    renotify: true,
    vibrate: [180, 90, 180],
    data: { url: "./" },
  }));
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ("focus" in list[i]) return list[i].focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow("./");
  }));
});