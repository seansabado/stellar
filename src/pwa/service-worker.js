const CACHE_NAME = "stellarpay-cache-v1";
const OFFLINE_URL = "/offline.html";
const ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/robots.txt",
  // Add more static assets as needed
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(event.request)
        .then((res) => res || caches.match(OFFLINE_URL)),
    ),
  );
});
