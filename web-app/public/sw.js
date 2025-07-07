// Service Worker for Spotlight Portfolio Platform
// Provides offline functionality, caching, and push notifications

const CACHE_NAME = 'spotlight-v1';
const STATIC_CACHE_NAME = 'spotlight-static-v1';
const DYNAMIC_CACHE_NAME = 'spotlight-dynamic-v1';
const IMAGE_CACHE_NAME = 'spotlight-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/templates',
  '/examples',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add critical CSS and JS files
];

// Cache strategy configurations
const CACHE_STRATEGIES = {
  // Cache first for static assets
  static: {
    cache: STATIC_CACHE_NAME,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100
  },
  
  // Network first for dynamic content
  dynamic: {
    cache: DYNAMIC_CACHE_NAME,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 50
  },
  
  // Cache first for images
  images: {
    cache: IMAGE_CACHE_NAME,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 200
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Handle different request types
    if (isImageRequest(url)) {
      return handleImageRequest(request);
    } else if (isStaticAsset(url)) {
      return handleStaticRequest(request);
    } else if (isAPIRequest(url)) {
      return handleAPIRequest(request);
    } else {
      return handlePageRequest(request);
    }
  } catch (error) {
    console.error('[SW] Error handling request:', error);
    return fetch(request);
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
    const isExpired = Date.now() - cacheDate.getTime() > CACHE_STRATEGIES.images.maxAge;
    
    if (!isExpired) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response and add cache date
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      cleanupCache(cache, CACHE_STRATEGIES.images.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return new Response('Image not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      cleanupCache(cache, CACHE_STRATEGIES.static.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Static asset not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      cleanupCache(cache, CACHE_STRATEGIES.dynamic.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache if network fails
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('sw-offline', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    return new Response(JSON.stringify({ error: 'API not available offline' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      cleanupCache(cache, CACHE_STRATEGIES.dynamic.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve cached version
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback page
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response('Page not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Utility functions
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return /\.(css|js|woff|woff2|ttf|eot|ico)$/i.test(url.pathname) ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/_next/static/');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Clean up cache by removing old entries
async function cleanupCache(cache, maxEntries) {
  const requests = await cache.keys();
  
  if (requests.length > maxEntries) {
    const requestsToDelete = requests.slice(0, requests.length - maxEntries);
    await Promise.all(requestsToDelete.map(request => cache.delete(request)));
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'portfolio-upload') {
    event.waitUntil(syncPortfolioUploads());
  } else if (event.tag === 'portfolio-update') {
    event.waitUntil(syncPortfolioUpdates());
  }
});

// Sync portfolio uploads when back online
async function syncPortfolioUploads() {
  try {
    // Get pending uploads from IndexedDB
    const pendingUploads = await getPendingUploads();
    
    for (const upload of pendingUploads) {
      try {
        await fetch('/api/portfolios/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(upload.data)
        });
        
        // Remove from pending uploads
        await removePendingUpload(upload.id);
        
        // Notify client of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { uploadId: upload.id }
            });
          });
        });
        
      } catch (error) {
        console.error('[SW] Error syncing upload:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error in background sync:', error);
  }
}

// Sync portfolio updates when back online
async function syncPortfolioUpdates() {
  // Similar implementation for portfolio updates
  console.log('[SW] Syncing portfolio updates');
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'spotlight-notification',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Check if there's already a window open
      const existingClient = clients.find(client => 
        client.url.includes(self.location.origin)
      );
      
      if (existingClient) {
        // Focus existing window and navigate
        existingClient.focus();
        if (data.url) {
          existingClient.navigate(data.url);
        }
      } else {
        // Open new window
        self.clients.openWindow(data.url || '/');
      }
    })
  );
});

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_PORTFOLIO':
        cachePortfolio(event.data.portfolioUrl);
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
        
      default:
        console.log('[SW] Unknown message type:', event.data.type);
    }
  }
});

// Cache specific portfolio for offline viewing
async function cachePortfolio(portfolioUrl) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.add(portfolioUrl);
    console.log('[SW] Portfolio cached for offline viewing');
  } catch (error) {
    console.error('[SW] Error caching portfolio:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingUploads() {
  // Implementation would use IndexedDB to store offline actions
  return [];
}

async function removePendingUpload(id) {
  // Implementation would remove from IndexedDB
  console.log('[SW] Removing pending upload:', id);
}