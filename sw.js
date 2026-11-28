// Kalon Beauty Land — Full PWA + Web Push Service Worker (GitHub Pages / PWABuilder TWA)
var CACHE_NAME = "kalon-pwa-v3";
var SHELL_ASSETS = ["./", "./index.html", "./manifest.json", "./pwa-192x192.png", "./pwa-512x512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS).catch(function () {});
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (!req || req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var isHtmlNav = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  var netReq = isHtmlNav ? new Request(req.url, { cache: "no-store", credentials: "same-origin" }) : req;
  event.respondWith(
    fetch(netReq).then(function (res) {
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(req, copy).catch(function () {});
        }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match("./index.html") || caches.match("./");
      });
    })
  );
});

self.addEventListener("push", function (event) {
  var data = {
    title: "Kalon Beauty Land",
    body: "پیام جدیدی از کلینیک برای شما ارسال شده است.",
    url: "./",
  };
  try {
    if (event.data) {
      var p = event.data.json();
      if (p && typeof p.title === "string" && p.title.trim()) data.title = p.title.trim();
      if (p && typeof p.body === "string" && p.body.trim()) data.body = p.body.trim();
      if (p && typeof p.url === "string" && p.url.trim()) data.url = p.url.trim();
    }
  } catch (_) {
    try {
      var t = event.data && event.data.text ? event.data.text().trim() : "";
      if (t) data.body = t;
    } catch (__) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./pwa-192x192.png",
      badge: "./pwa-192x192.png",
      dir: "rtl",
      lang: "fa",
      tag: "kalon-push-" + Date.now(),
      renotify: true,
      vibrate: [180, 90, 180],
      data: { url: data.url || "./" },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var targetUrl = (event.notification && event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ("focus" in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
