// Service Worker for RecipeToBring PWA
// Handles authentication callbacks and session management

const CACHE_NAME = 'recipetobring-v1';
const AUTH_DB_NAME = 'auth-db';
const AUTH_DB_VERSION = 1;
const SESSION_STORE = 'sessions';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
      });
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

// IndexedDB Helper Functions
function openAuthDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUTH_DB_NAME, AUTH_DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE);
      }
    };
  });
}

async function storeSession(session) {
  try {
    const db = await openAuthDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.put(session, 'current');
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Failed to store session:', error);
  }
}

async function getSession() {
  try {
    const db = await openAuthDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSION_STORE], 'readonly');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.get('current');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Failed to get session:', error);
    return null;
  }
}

// Auth Callback Handler
async function handleAuthCallback(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  
  console.log('[SW] Handling auth callback', { code: !!code, error });
  
  // Handle errors
  if (error) {
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return Response.redirect(redirectUrl.toString(), 302);
  }
  
  // No code, just redirect
  if (!code) {
    const redirectTo = url.searchParams.get('redirect') || '/';
    return Response.redirect(new URL(redirectTo, url.origin).toString(), 302);
  }
  
  try {
    // Exchange code for session via API
    const apiUrl = new URL('/api/auth/pwa-session', url.origin);
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error('Session exchange failed');
    }
    
    const data = await response.json();
    
    // Store session in IndexedDB
    if (data.session) {
      await storeSession(data.session);
      console.log('[SW] Session stored successfully');
    }
    
    // Notify all clients about the session update
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
      client.postMessage({
        type: 'SESSION_UPDATED',
        session: data.session,
        user: data.user,
      });
    });
    
    // Redirect to app with success flag
    const redirectTo = url.searchParams.get('redirect') || '/';
    const redirectUrl = new URL(redirectTo, url.origin);
    redirectUrl.searchParams.set('auth_success', 'true');
    
    return Response.redirect(redirectUrl.toString(), 302);
    
  } catch (error) {
    console.error('[SW] Auth callback error:', error);
    
    // Redirect to login with error
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', 'Aamäldä fehlgschlage');
    return Response.redirect(redirectUrl.toString(), 302);
  }
}

// Network Request Handler
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle auth callbacks
  if (url.pathname === '/auth/callback') {
    return handleAuthCallback(request);
  }
  
  // For API requests, always go to network
  if (url.pathname.startsWith('/api/')) {
    return fetch(request);
  }
  
  // For navigation requests, try network first, then cache
  if (request.mode === 'navigate') {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // If offline, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // Return offline page or error
      return new Response('Offline - Bitte prüef dini Internetverbindig', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
  
  // For other requests, try cache first, then network
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return fetch(request);
}

// Fetch Event Listener
self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

// Message Event Listener (for communication with clients)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_SESSION') {
    getSession().then((session) => {
      event.ports[0].postMessage({ session });
    });
  }
  
  if (event.data.type === 'CLEAR_SESSION') {
    openAuthDB().then((db) => {
      const transaction = db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      store.delete('current');
    });
  }
});

console.log('[SW] Service worker loaded');
