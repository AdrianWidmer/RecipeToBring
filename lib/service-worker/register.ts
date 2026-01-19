/**
 * Service Worker Registration
 * Handles registration, updates, and lifecycle management
 */

export interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  isPWA: boolean;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  const isPWA = isPWAMode();
  
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Workers not supported');
    return { registration: null, isPWA };
  }
  
  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('[SW] Service Worker registered successfully', {
      scope: registration.scope,
      isPWA,
    });
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] New service worker found, installing...');
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('[SW] Service worker state:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW] New version available');
            
            // Optionally prompt user to update
            if (confirm('Neui Version verfüegbar. Jetzt aktualisierä?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });
    
    // Handle controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page');
      window.location.reload();
    });
    
    // Check for updates periodically (every 60 minutes)
    setInterval(() => {
      registration.update().catch((error) => {
        console.warn('[SW] Update check failed:', error);
      });
    }, 60 * 60 * 1000);
    
    return { registration, isPWA };
    
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return { registration: null, isPWA };
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    const results = await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
    
    console.log('[SW] Service Workers unregistered:', results);
    return results.every((result) => result === true);
    
  } catch (error) {
    console.error('[SW] Failed to unregister service workers:', error);
    return false;
  }
}

/**
 * Check if the app is running as a PWA
 */
export function isPWAMode(): boolean {
  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check Android TWA (Trusted Web Activity)
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  return false;
}

/**
 * Send a message to the active service worker
 */
export async function sendMessageToServiceWorker(
  message: any
): Promise<any> {
  if (!navigator.serviceWorker.controller) {
    console.warn('[SW] No active service worker to send message to');
    return null;
  }
  
  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    navigator.serviceWorker.controller!.postMessage(message, [
      messageChannel.port2,
    ]);
  });
}

/**
 * Get the current session from service worker
 */
export async function getSessionFromServiceWorker(): Promise<any> {
  return sendMessageToServiceWorker({ type: 'GET_SESSION' });
}

/**
 * Clear the session in service worker
 */
export async function clearSessionInServiceWorker(): Promise<void> {
  await sendMessageToServiceWorker({ type: 'CLEAR_SESSION' });
}

/**
 * Setup service worker message listener
 */
export function setupServiceWorkerMessageListener(
  callback: (event: MessageEvent) => void
): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }
  
  navigator.serviceWorker.addEventListener('message', callback);
  
  return () => {
    navigator.serviceWorker.removeEventListener('message', callback);
  };
}
