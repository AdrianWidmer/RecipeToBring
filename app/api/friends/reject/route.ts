import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

/**
 * Reject friend request
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
        { error: 'Du darfsch nume dini eigene Aafräge ablehne' },
        { status: 403 }
      );
    }

    // Delete the friendship request
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (deleteError) {
      console.error('[API] Error rejecting friendship:', deleteError);
      return NextResponse.json(
        { error: 'Fehler bim Ablehne' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fründschaftsaafrag abglehnt',
    });

  } catch (error) {
    console.error('[API] Reject friend error:', error);
    return NextResponse.json(
      { error: 'Unerwartete Fehler' },
      { status: 500 }
    );
  }
}
