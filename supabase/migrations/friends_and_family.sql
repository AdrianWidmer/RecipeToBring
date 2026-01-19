-- Friends & Family Feature Migration
-- This creates the tables and policies for managing friends and recipe sharing

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, friend_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- Add visibility field to recipes table (public, private, friends_only)
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('public', 'private', 'friends_only'));

-- Migrate existing recipes: is_public=true -> visibility='public', is_public=false -> visibility='private'
UPDATE public.recipes 
SET visibility = CASE 
    WHEN is_public = true THEN 'public'
    ELSE 'private'
END
WHERE visibility IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can view accepted friendships where they are friend" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friendship requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their own friendship requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update friendships where they are the recipient" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friendships;

-- Create RLS policies for friendships
-- Policy 1: Users can view their own friendship requests
CREATE POLICY "Users can view their own friendships"
    ON public.friendships
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can view friendship requests sent to them
CREATE POLICY "Users can view accepted friendships where they are friend"
    ON public.friendships
    FOR SELECT
    USING (auth.uid() = friend_id);

-- Policy 3: Users can create friendship requests
CREATE POLICY "Users can create friendship requests"
    ON public.friendships
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own friendship requests (to cancel)
CREATE POLICY "Users can update their own friendship requests"
    ON public.friendships
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy 5: Users can update friendships where they are the recipient (to accept/reject)
CREATE POLICY "Users can update friendships where they are the recipient"
    ON public.friendships
    FOR UPDATE
    USING (auth.uid() = friend_id);

-- Policy 6: Users can delete their own friendships
CREATE POLICY "Users can delete their own friendships"
    ON public.friendships
    FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Update recipes RLS policies to support friends_only visibility
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can view friends-only recipes" ON public.recipes;

-- Policy 1: Anyone can view public recipes
CREATE POLICY "Public recipes are viewable by everyone"
    ON public.recipes
    FOR SELECT
    USING (visibility = 'public');

-- Policy 2: Users can view friends-only recipes if they are friends with the creator
CREATE POLICY "Users can view friends-only recipes"
    ON public.recipes
    FOR SELECT
    USING (
        visibility = 'friends_only' 
        AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.friendships
                WHERE status = 'accepted'
                AND (
                    (user_id = created_by AND friend_id = auth.uid())
                    OR (user_id = auth.uid() AND friend_id = created_by)
                )
            )
        )
    );

-- Function to get friend count
CREATE OR REPLACE FUNCTION public.get_friend_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.friendships
    WHERE status = 'accepted'
    AND (user_id = user_uuid OR friend_id = user_uuid);
$$;

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.friendships
        WHERE status = 'accepted'
        AND (
            (user_id = user1_uuid AND friend_id = user2_uuid)
            OR (user_id = user2_uuid AND friend_id = user1_uuid)
        )
    );
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for friendships updated_at
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friend_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends TO authenticated;
