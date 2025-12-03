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
  self.skipWaiting();
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

// Estrategias de caché
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Estrategia para API: Network First (Red primero, si falla usa caché/error)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Estrategia para Archivos Estáticos: Stale-While-Revalidate o Cache First con Dynamic Caching
  // Aquí usamos "Cache First, falling back to Network" pero GUARDANDO en caché lo nuevo.
 event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si ya lo tenemos, lo devolvemos
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no, lo pedimos a internet
      return fetch(event.request).then((networkResponse) => {
        // Verificamos que la respuesta sea válida (Status 200)
        // Quitamos la restricción estricta de 'basic' para permitir fuentes externas (CORS)
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Guardamos copia en caché
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Aquí podrías retornar una imagen placeholder si falla la red y no hay caché
        console.log("Fallo al recuperar recurso:", event.request.url);
      });
    })
  );
});