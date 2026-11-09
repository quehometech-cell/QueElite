const CACHE = "gcr-static-v2";
const STATIC_ASSETS = ["/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("gcr-") && key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authenticated pages, API responses, or user-specific content.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/members") ||
    url.pathname.startsWith("/coach") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/client-join") ||
    url.pathname.startsWith("/join") ||
    url.pathname.startsWith("/checkout") ||
    url.pathname.startsWith("/account")
  ) return;

  const isStaticAsset = /\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname);
  const isPwaAsset = url.pathname === "/manifest.webmanifest" || url.pathname === "/icon.svg";
  if (!isStaticAsset && !isPwaAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })
  );
});
