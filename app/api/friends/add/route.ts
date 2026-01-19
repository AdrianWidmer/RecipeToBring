import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Send friend request by email
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail isch erforderlich' },
        { status: 400 }
      );
    }

    // Check if user is trying to add themselves
    if (email === user.email) {
      return NextResponse.json(
        { error: 'Du chasch di nöd sälber hinzuefüegä' },
        { status: 400 }
      );
    }

    // Find user by email using admin client
    const supabaseAdmin = createAdminClient();
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: 'Fehler bim Suechä vom Benutzer' },
        { status: 500 }
      );
    }

    const friendUser = users?.find(u => u.email === email);

    if (!friendUser) {
      return NextResponse.json(
        { error: 'Benutzer mit dere E-Mail nöd gfunde' },
        { status: 404 }
      );
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${user.id})`)
      .single();

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'Fründschaftsaafrag isch scho pendent' },
          { status: 400 }
        );
      } else if (existing.status === 'accepted') {
        return NextResponse.json(
          { error: 'Dir sind scho Fründe' },
          { status: 400 }
        );
      }
    }

    // Create friendship request
    const { data: friendship, error: insertError } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendUser.id,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[API] Error creating friendship:', insertError);
      return NextResponse.json(
        { error: 'Fehler bim Erstelle vo de Fründschaftsaafrag' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      friendship,
      message: 'Fründschaftsaafrag gschickt',
    });

  } catch (error) {
    console.error('[API] Add friend error:', error);
    return NextResponse.json(
      { error: 'Unerwartete Fehler' },
      { status: 500 }
    );
  }
}
