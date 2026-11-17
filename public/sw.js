/* Service worker de Flow it!: guarda la app para que abra sin conexión.
   - Páginas: primero la red; si no hay conexión, la copia guardada de index.html.
   - Archivos (JS, CSS, imágenes, fuentes): primero la copia guardada. */

const VERSION = 'flowit-v1'
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll([BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const copia = r.clone()
          caches.open(VERSION).then((c) => c.put(`${BASE}index.html`, copia))
          return r
        })
        .catch(() => caches.match(`${BASE}index.html`)),
    )
    return
  }

  const mismoOrigen = url.origin === self.location.origin
  const fuentes = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  if (!mismoOrigen && !fuentes) return

  e.respondWith(
    caches.match(request).then(
      (guardada) =>
        guardada ||
        fetch(request).then((r) => {
          if (r.ok || r.type === 'opaque') {
            const copia = r.clone()
            caches.open(VERSION).then((c) => c.put(request, copia))
          }
          return r
        }),
    ),
  )
})
