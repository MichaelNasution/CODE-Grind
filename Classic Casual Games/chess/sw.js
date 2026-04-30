const CACHE_NAME = "chess-pwa-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./script/state.js",
  "./script/game.js",
  "./script/ai.js",
  "./script/ui.js",
  "../shared/styles/tokens.css",
  "../shared/styles/base.css",
  "../shared/styles/components.css",
  "../shared/styles/layout.css",
  "../shared/styles/animations.css",
  "../shared/scripts/utils.js",
  "../shared/scripts/sound.js",
  "../shared/scripts/ai-utils.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
