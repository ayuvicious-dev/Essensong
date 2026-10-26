const V = 'essensong-v4';
const SHELL = ['./', 'index.html', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon-v3.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);

  // Library Firebase (gstatic): cache-first agar app bisa dibuka offline
  if (u.hostname === 'www.gstatic.com') {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(r);
      if (hit) return hit;
      const net = await fetch(r);
      if (net.ok) c.put(r, net.clone());
      return net;
    }));
    return;
  }

  // Selain origin sendiri (Firebase API, Storage, dll) tidak disentuh
  if (u.origin !== location.origin) return;

  // Halaman: network-first, fallback ke cache saat offline
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(n => {
        const cp = n.clone();
        caches.open(V).then(c => c.put('index.html', cp));
        return n;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(n => {
    const cp = n.clone();
    caches.open(V).then(c => c.put(r, cp));
    return n;
  })));
});
