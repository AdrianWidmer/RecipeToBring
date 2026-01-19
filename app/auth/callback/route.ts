import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    // Detect PWA mode
    const isPWA = requestUrl.searchParams.get('pwa') === 'true' ||
                  requestUrl.searchParams.get('mode') === 'pwa';
    
    // Handle OAuth errors
    if (error) {
      console.error('[Auth] OAuth error:', error, errorDescription);
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('error', errorDescription || error);
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange code for session
    if (code) {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('[Auth] Session exchange error:', exchangeError);
        const redirectUrl = new URL('/login', requestUrl.origin);
        redirectUrl.searchParams.set('error', 'Aamäldä fehlgschlage');
        return NextResponse.redirect(redirectUrl);
      }
      
      console.log('[Auth] Session exchanged successfully', { isPWA });
    }

    // Redirect to the page the user was on before login, or home
    const redirectTo = requestUrl.searchParams.get('redirect') || '/';
    const redirectUrl = new URL(redirectTo, requestUrl.origin);
    
    // Add success flag for PWA to trigger UI updates
    if (isPWA) {
      redirectUrl.searchParams.set('auth_success', 'true');
    }
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('[Auth] Callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=unexpected', request.url)
    );
  }
}
