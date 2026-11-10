// Hive Mind offline cache. Bump VERSION when you upload a new build.
const VERSION = 'hivemind-v1.3';
const SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './audio/sfx/button-click.mp3', './audio/sfx/button-tick-b.mp3', './audio/sfx/button-tick.mp3', './audio/sfx/chime-a.mp3', './audio/sfx/chime-b.mp3', './audio/sfx/chime-c.mp3', './audio/sfx/coin-cascade.mp3', './audio/sfx/coin-ding.mp3', './audio/sfx/ding.mp3', './audio/sfx/game-over.mp3', './audio/sfx/glass-smash.mp3', './audio/sfx/rattle.mp3', './audio/sfx/thump-a.mp3', './audio/sfx/thump-b.mp3', './audio/sfx/win-bell-short.mp3', './audio/sfx/win-bell.mp3', './audio/theme.mp3'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // The game page: try the network first so new uploads show straight away, fall back to the cache offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Everything else (icons, fonts): cache first, refresh in the background.
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
