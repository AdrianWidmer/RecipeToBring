import { NextRequest, NextResponse } from 'next/server';
import { RecipeInsert } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user (using getUser() for security)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nöd autorisiert - Bitte mäld dich aa' },
        { status: 401 }
      );
    }

    const recipeData: Omit<RecipeInsert, 'created_by'> = await request.json();

    // Insert recipe with authenticated user ID
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      return NextResponse.json(
        { error: 'Rezept konnt nöd gspeicheret wärdä', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in save route:', error);
    return NextResponse.json(
      { error: 'Intärnä Server-Fähler' },
      { status: 500 }
    );
  }
}
