/* Sachkunde Lernkarten – Service Worker. VERSION wird von build_pwa.py hochgezählt. */
const VERSION = "1";
const CACHE = "sachkunde-v" + VERSION;
const SHELL = ["./", "index.html", "data.enc", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png", "icons/favicon-32.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: "reload"})))));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    (await self.clients.matchAll({type: "window"})).forEach(c => c.postMessage({type: "HT_UPDATE", version: VERSION}));
  })());
});
self.addEventListener("message", e => { if (e.data && e.data.type === "HT_SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).catch(() =>
    req.mode === "navigate" ? caches.match("index.html") : Response.error())));
});
