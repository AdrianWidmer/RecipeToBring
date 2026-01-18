import { NextRequest, NextResponse } from 'next/server';
import { RecipeInsert } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const recipeData: Omit<RecipeInsert, 'created_by'> = await request.json();

    // Insert recipe with authenticated user ID
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      return NextResponse.json(
        { error: 'Failed to save recipe', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in save route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
