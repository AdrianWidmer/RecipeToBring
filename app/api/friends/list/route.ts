import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * List all friends and pending requests
 */
export async function GET(request: NextRequest) {
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

    // Get all friendships where user is involved (simplified query without joins)
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Error fetching friendships:', error);
      return NextResponse.json(
        { error: 'Fehler bim Ladä vo dä Fründe' },
        { status: 500 }
      );
    }

    // Get unique user IDs to fetch profiles
    const userIds = new Set<string>();
    for (const friendship of friendships || []) {
      userIds.add(friendship.user_id);
      userIds.add(friendship.friend_id);
    }

    // Fetch profiles (which should have email stored or we'll get from current user)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', Array.from(userIds));

    const profileMap = new Map();
    if (!profilesError && profiles) {
      for (const profile of profiles) {
        profileMap.set(profile.user_id, profile);
      }
    }

    // Fetch user emails using admin client
    const supabaseAdmin = createAdminClient();
    const { data: { users: allUsers }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    const emailMap = new Map();
    if (!usersError && allUsers) {
      for (const authUser of allUsers) {
        emailMap.set(authUser.id, authUser.email);
      }
    }

    // Categorize friendships
    const accepted = [];
    const pending = [];
    const received = [];

    for (const friendship of friendships || []) {
      const isInitiator = friendship.user_id === user.id;
      const friendId = isInitiator ? friendship.friend_id : friendship.user_id;
      const friendProfile = profileMap.get(friendId);

      // Get friend information including email from admin client
      const friendInfo = {
        id: friendship.id,
        friendshipId: friendship.id,
        userId: friendId,
        email: emailMap.get(friendId) || 'Unbekannt',
        displayName: friendProfile?.display_name || emailMap.get(friendId)?.split('@')[0] || friendId.substring(0, 8),
        avatarUrl: friendProfile?.avatar_url || null,
        status: friendship.status,
        createdAt: friendship.created_at,
        isInitiator,
      };

      if (friendship.status === 'accepted') {
        accepted.push(friendInfo);
      } else if (friendship.status === 'pending') {
        if (isInitiator) {
          pending.push(friendInfo);
        } else {
          received.push(friendInfo);
        }
      }
    }

    return NextResponse.json({
      friends: accepted,
      pendingRequests: pending,
      receivedRequests: received,
      total: accepted.length,
    });

  } catch (error) {
    console.error('[API] List friends error:', error);
    return NextResponse.json(
      { error: 'Unerwartete Fehler' },
      { status: 500 }
    );
  }
}
