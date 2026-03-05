// 1. Subimos la versión para forzar la invalidación del caché viejo
const CACHE_NAME = 'calendarioback-v2'; 

const urlsToCache = [
  '/',
  // '/index.html', // En Next.js suele ser redundante con '/', mejor quitarlo si da problemas
  '/manifest.json',
  '/icon.svg',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
];

// Install event - Cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[PWA] Precaching resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza al SW a activarse sin esperar a cerrar pestañas
  );
});

// Activate event - Limpieza de versiones antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[PWA] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de las pestañas abiertas inmediatamente
  );
});

// Fetch event - Estrategia: Stale-While-Revalidate
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Solo manejar peticiones de nuestro propio origen
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        
        // Ejecutamos la petición a la red siempre
        const networkFetch = fetch(event.request).then(networkResponse => {
          // Si la respuesta es válida, la guardamos/actualizamos en el caché
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si falla la red (offline), no hacemos nada, ya tenemos el cachedResponse
        });

        // Retornamos el caché si existe, si no, esperamos a la red
        return cachedResponse || networkFetch;
      });
    })
  );
});