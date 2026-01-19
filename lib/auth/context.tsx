'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import {
  storeSessionInIndexedDB,
  getSessionFromIndexedDB,
  clearSessionFromIndexedDB,
  listenForSessionUpdates,
  broadcastSessionUpdate,
  isPWAMode,
} from './pwa-session';
import { setupServiceWorkerMessageListener } from '@/lib/service-worker/register';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initialize session
    async function initializeSession() {
      try {
        // First, try to get session from Supabase
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('[Auth] Initial session:', { 
            hasSession: !!supabaseSession, 
            userId: supabaseSession?.user?.id,
            isPWA: isPWAMode(),
          });
          
          if (supabaseSession) {
            setSession(supabaseSession);
            setUser(supabaseSession.user);
            
            // Store in IndexedDB for PWA
            await storeSessionInIndexedDB(supabaseSession);
          } else if (isPWAMode()) {
            // If running as PWA and no Supabase session, try IndexedDB
            const cachedSession = await getSessionFromIndexedDB();
            if (cachedSession && mounted) {
              console.log('[Auth] Restored session from IndexedDB');
              setSession(cachedSession);
              setUser(cachedSession.user);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Failed to initialize session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeSession();

    // Listen for auth changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      console.log('[Auth] Auth state changed:', { event: _event, hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Update IndexedDB
      if (session) {
        await storeSessionInIndexedDB(session);
        broadcastSessionUpdate(session);
      } else {
        await clearSessionFromIndexedDB();
        broadcastSessionUpdate(null);
      }
    });

    // Listen for service worker messages (PWA session updates)
    const cleanupServiceWorkerListener = setupServiceWorkerMessageListener((event) => {
      if (!mounted) return;
      
      if (event.data.type === 'SESSION_UPDATED') {
        console.log('[Auth] Session updated by service worker');
        const newSession = event.data.session;
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          // Force Supabase to use the new session
          supabase.auth.setSession(newSession);
        }
      }
    });

    // Listen for cross-tab session updates
    const cleanupCrossTabListener = listenForSessionUpdates((newSession) => {
      if (!mounted) return;
      
      console.log('[Auth] Session updated from another tab');
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      cleanupServiceWorkerListener();
      cleanupCrossTabListener();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await clearSessionFromIndexedDB();
    broadcastSessionUpdate(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
