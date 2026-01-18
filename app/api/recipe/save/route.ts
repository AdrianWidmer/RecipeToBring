import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { RecipeInsert } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const recipeData: RecipeInsert = await request.json();

    if (!recipeData.created_by) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('recipes')
      // @ts-ignore - Supabase types need proper setup
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      return NextResponse.json(
        { error: 'Failed to save recipe' },
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
