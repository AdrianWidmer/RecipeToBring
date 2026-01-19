import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

/**
 * Accept friend request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nöd autorisiert' },
        { status: 401 }
      );
    }

    const { friendshipId } = await request.json();

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Fründschafts-ID isch erforderlich' },
        { status: 400 }
      );
    }

    // Get the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json(
        { error: 'Fründschaftsaafrag nöd gfunde' },
        { status: 404 }
      );
    }

    // Verify user is the recipient
    if (friendship.friend_id !== user.id) {
      return NextResponse.json(
        { error: 'Du darfsch nume dini eigene Aafräge akzeptierä' },
        { status: 403 }
      );
    }

    // Update status to accepted
    const { error: updateError } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (updateError) {
      console.error('[API] Error accepting friendship:', updateError);
      return NextResponse.json(
        { error: 'Fehler bim Akzeptiere' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fründschaftsaafrag akzeptiert',
    });

  } catch (error) {
    console.error('[API] Accept friend error:', error);
    return NextResponse.json(
      { error: 'Unerwartete Fehler' },
      { status: 500 }
    );
  }
}
