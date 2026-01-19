/**
 * PWA Session Utilities
 * Handles session storage and synchronization in PWA context
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Session } from '@supabase/supabase-js';

// IndexedDB Schema
interface AuthDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
  };
}

const DB_NAME = 'auth-db';
const DB_VERSION = 1;
const SESSION_STORE = 'sessions';
const CURRENT_SESSION_KEY = 'current';

/**
 * Open the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase<AuthDB>> {
  return openDB<AuthDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE);
      }
    },
  });
}

/**
 * Store session in IndexedDB
 */
export async function storeSessionInIndexedDB(
  session: Session
): Promise<void> {
  try {
    const db = await getDB();
    await db.put(SESSION_STORE, session, CURRENT_SESSION_KEY);
    console.log('[Auth] Session stored in IndexedDB');
  } catch (error) {
    console.error('[Auth] Failed to store session:', error);
  }
}

/**
 * Retrieve session from IndexedDB
 */
export async function getSessionFromIndexedDB(): Promise<Session | null> {
  try {
    const db = await getDB();
    const session = await db.get(SESSION_STORE, CURRENT_SESSION_KEY);
    return session || null;
  } catch (error) {
    console.error('[Auth] Failed to get session:', error);
    return null;
  }
}

/**
 * Clear session from IndexedDB
 */
export async function clearSessionFromIndexedDB(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(SESSION_STORE, CURRENT_SESSION_KEY);
    console.log('[Auth] Session cleared from IndexedDB');
  } catch (error) {
    console.error('[Auth] Failed to clear session:', error);
  }
}

/**
 * Check if the app is running as a PWA
 */
export function isPWAMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  // Check Android TWA (Trusted Web Activity)
  if (typeof document !== 'undefined' && document.referrer.includes('android-app://')) {
    return true;
  }

  return false;
}

/**
 * Broadcast session update to other tabs/windows
 */
export function broadcastSessionUpdate(session: Session | null): void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return;
  }

  try {
    const channel = new BroadcastChannel('auth-channel');
    channel.postMessage({
      type: 'SESSION_UPDATE',
      session,
      timestamp: Date.now(),
    });
    channel.close();
  } catch (error) {
    console.error('[Auth] Failed to broadcast session update:', error);
  }
}

/**
 * Listen for session updates from other tabs/windows
 */
export function listenForSessionUpdates(
  callback: (session: Session | null) => void
): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }

  try {
    const channel = new BroadcastChannel('auth-channel');

    const handler = (event: MessageEvent) => {
      if (event.data.type === 'SESSION_UPDATE') {
        console.log('[Auth] Received session update from another tab');
        callback(event.data.session);
      }
    };

    channel.addEventListener('message', handler);

    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  } catch (error) {
    console.error('[Auth] Failed to setup session listener:', error);
    return () => {};
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: Session | null): boolean {
  if (!session) {
    return true;
  }

  const expiresAt = session.expires_at;
  if (!expiresAt) {
    return false;
  }

  // Add a 5-minute buffer
  const bufferSeconds = 5 * 60;
  const now = Math.floor(Date.now() / 1000);

  return expiresAt - bufferSeconds < now;
}

/**
 * Get time until session expires (in seconds)
 */
export function getSessionTimeRemaining(session: Session | null): number {
  if (!session || !session.expires_at) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, session.expires_at - now);
}

/**
 * Format session expiry time
 */
export function formatSessionExpiry(session: Session | null): string {
  if (!session || !session.expires_at) {
    return 'Unbekannt';
  }

  const remaining = getSessionTimeRemaining(session);

  if (remaining <= 0) {
    return 'Abgloffe';
  }

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
