'use client';

import { useEffect } from 'react';
import { registerServiceWorker, isPWAMode } from '@/lib/service-worker/register';

/**
 * Service Worker Registration Component
 * Registers the service worker when the app loads
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production or if explicitly enabled
    const shouldRegister = 
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!shouldRegister) {
      console.log('[SW] Service worker registration skipped (not in production)');
      return;
    }

    // Register service worker
    registerServiceWorker()
      .then(({ registration, isPWA }) => {
        if (registration) {
          console.log('[SW] Service worker registered successfully', {
            scope: registration.scope,
            isPWA,
          });
        }
      })
      .catch((error) => {
        console.error('[SW] Service worker registration failed:', error);
      });

    // Log PWA status
    console.log('[App] Running as PWA:', isPWAMode());
  }, []);

  // This component doesn't render anything
  return null;
}
