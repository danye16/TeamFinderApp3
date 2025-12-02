// public/service-worker.js

const CACHE_NAME = 'teamfinder-v1';
// Lista de archivos vitales. Vite genera nombres con hash, 
// así que en producción lo ideal es usar un plugin de Vite PWA, 
// pero para este ejemplo manual, cacheamos la raíz y assets conocidos.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg' 
  // Nota: Si tus JS/CSS tienen nombres dinámicos (ej: main.2342.js), 
  // el SW manual es difícil. Recomiendo usar 'vite-plugin-pwa'.
  // Pero si estás probando en dev o tienes nombres fijos, añade aquí tus rutas.
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Borrando cache vieja', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Estrategia: Stale-While-Revalidate para recursos, Network-First para API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Si es una llamada a la API, intentamos red primero, si falla, el catch lo maneja el Context
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Si falla la red en una API, retornamos un error 503 o null
        // para que el frontend (Context) use su localStorage
        return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Para archivos estáticos (JS, CSS, HTML), Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});