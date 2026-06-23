const CACHE_VERSION = "v8";
const OFFLINE_PAGE = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-192x192.png",
  "/favicon-512x512.png",
  "/logo-256.avif",
  "/logo-256.webp",
  "/logo-192.png",
];

const STATIC_CACHE = `pro-vision-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pro-vision-dynamic-${CACHE_VERSION}`;
const MAX_DYNAMIC_ENTRIES = 50;

async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(
      keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)),
    );
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INVALIDATE_CACHE") {
    const cacheName = event.data.cacheName;
    if (cacheName) {
      caches.delete(cacheName);
    } else {
      Promise.all(
        caches.keys().then((keys) => keys.map((k) => caches.delete(k))),
      );
    }
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api") || url.pathname.includes("convex")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
          });
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  if (
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|avif|webp)$/,
    )
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkUpdate = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, clone);
                trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
              });
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_PAGE));

        return cached || networkUpdate;
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
            });
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "pending-actions") {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  const cache = await caches.open("pro-vision-sync-v1");
  const requests = await cache.keys();
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      const body = await response?.json();
      if (body) {
        await fetch(request.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await cache.delete(request);
      }
    } catch (error) {
      console.error("Failed to sync action:", request.url, error);
    }
  }
}
