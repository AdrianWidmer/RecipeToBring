import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

/**
 * PWA Session API Route
 * Exchanges auth code for session (called by service worker)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Ke Auth-Code gfunde' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[API] Session exchange error:', error);
      return NextResponse.json(
        { error: error.message || 'Aamäldä fehlgschlage' },
        { status: 400 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: 'Ke Session erstellt worde' },
        { status: 400 }
      );
    }

    // Return session and user data
    return NextResponse.json({
      session: data.session,
      user: data.user,
      success: true,
    });

  } catch (error) {
    console.error('[API] PWA session error:', error);
    return NextResponse.json(
      { error: 'Unerwartete Fehler bim Aamäldä' },
      { status: 500 }
    );
  }
}

/**
 * GET method for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PWA Session API is running',
  });
}
