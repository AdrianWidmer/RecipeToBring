import { NextRequest, NextResponse } from 'next/server';
import { parseRecipeFromUrl } from '@/lib/recipe-parser';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json();

    if (!url || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rate limit (10 recipes per day)
    const { data: extractions, error: extractionError } = await supabaseAdmin
      .from('recipe_extractions')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (extractionError) {
      console.error('Error checking rate limit:', extractionError);
    }

    if (extractions && extractions.length >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can extract up to 10 recipes per day.' },
        { status: 429 }
      );
    }

    // Parse the recipe
    const recipe = await parseRecipeFromUrl(url);

    // Record extraction for rate limiting
    await supabaseAdmin
      .from('recipe_extractions')
      .insert({ user_id: userId });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error extracting recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract recipe' },
      { status: 500 }
    );
  }
}
