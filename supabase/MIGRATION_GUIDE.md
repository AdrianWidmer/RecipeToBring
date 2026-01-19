# Friends & Family Feature - Database Migration

This migration adds support for friends/family management and recipe sharing with specific visibility controls.

## What's New

### Database Changes
- **`friendships` table**: Manages friend relationships between users
  - Supports pending, accepted, and rejected friend requests
  - Bi-directional friendships
  - Row Level Security (RLS) policies for privacy

- **`visibility` field in `recipes` table**: Three visibility options
  - `public`: Everyone can see the recipe
  - `private`: Only the creator can see the recipe
  - `friends_only`: Only the creator and their friends can see the recipe

### Features
- Send friend requests by email
- Accept/reject friend requests
- Remove friends
- View friends list
- Set recipe visibility to friends-only
- Automatic filtering of recipes based on friendship status

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/friends_and_family.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

### Option 3: Manual SQL Execution

1. Open your PostgreSQL client
2. Connect to your Supabase database
3. Execute the SQL file:

```sql
\i supabase/migrations/friends_and_family.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if friendships table exists
SELECT * FROM public.friendships LIMIT 1;

-- Check if visibility column exists
SELECT id, title, visibility FROM public.recipes LIMIT 1;

-- Check if functions exist
SELECT get_friend_count('YOUR_USER_ID');
```

## API Endpoints

### Friends Management
- `GET /api/friends/list` - List all friends and requests
- `POST /api/friends/add` - Send friend request (body: `{ email }`)
- `POST /api/friends/accept` - Accept request (body: `{ friendshipId }`)
- `POST /api/friends/reject` - Reject request (body: `{ friendshipId }`)
- `DELETE /api/friends/remove` - Remove friend (body: `{ friendshipId }`)

### Recipe Visibility
- `PATCH /api/recipe/update-visibility` - Update recipe visibility
  - Body: `{ recipeId, visibility: 'public' | 'private' | 'friends_only' }`
  - Old format still supported: `{ recipeId, isPublic: boolean }`

## UI Components

### New Pages
- `/friends` - Friends & Family management page
  - Add friends by email
  - View friends list
  - Accept/reject friend requests
  - Remove friends

### Updated Components
- `VisibilityDropdown` - Three-option dropdown for recipe visibility
  - Public (green) - Everyone can see
  - Friends & Family (blue) - Only friends can see
  - Private (orange) - Only you can see

## Security

### Row Level Security (RLS)
All tables have RLS enabled with proper policies:

**Friendships:**
- Users can view their own friendships
- Users can view friendships where they're the friend
- Users can create friendship requests
- Users can update their own requests (to cancel)
- Users can update requests sent to them (to accept/reject)
- Users can delete their own friendships

**Recipes:**
- Public recipes viewable by everyone
- Private recipes viewable only by creator
- Friends-only recipes viewable by creator and their friends
- Only creators can modify their recipes

## Testing

### Test Friend Requests
1. Create two test users in Supabase Auth
2. Log in as User A
3. Go to `/friends`
4. Add User B by email
5. Log in as User B
6. Go to `/friends`
7. Accept the request
8. Verify both users see each other as friends

### Test Recipe Visibility
1. Create a recipe as User A
2. Set visibility to "Friends & Family"
3. Log in as User B (friend of A)
4. Go to `/explore`
5. Verify you can see User A's recipe
6. Log in as User C (not a friend)
7. Verify you cannot see User A's recipe

## Rollback

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.friendships CASCADE;

-- Remove new column
ALTER TABLE public.recipes DROP COLUMN IF EXISTS visibility;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_friend_count(UUID);
DROP FUNCTION IF EXISTS public.are_friends(UUID, UUID);
```

## Notes

- The `is_public` field is kept for backward compatibility
- When `visibility` is set, `is_public` is automatically synced
- Existing recipes will have `visibility` set based on `is_public` value
- Friend relationships are bi-directional (if A is friends with B, B is friends with A)
- Deleting a user will cascade delete their friendships
