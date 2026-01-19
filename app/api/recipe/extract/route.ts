import { NextRequest, NextResponse } from 'next/server';
import { parseRecipeFromUrl } from '@/lib/recipe-parser';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user (using getUser() for security)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError 
    });
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nöd autorisiert - Bitte mäld dich aa' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL wird bruucht' },
        { status: 400 }
      );
    }

    // Check rate limit (10 recipes per day)
    const { data: extractions, error: extractionError } = await supabase
      .from('recipe_extractions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (extractionError) {
      console.error('Error checking rate limit:', extractionError);
    }

    if (extractions && extractions.length >= 10) {
      return NextResponse.json(
        { error: 'Rate-Limit überschritte. Du chasch bis zu 10 Rezept pro Tag extrahiere.' },
        { status: 429 }
      );
    }

    // Parse the recipe
    const recipe = await parseRecipeFromUrl(url);

    // Record extraction for rate limiting
    const { error: insertError } = await supabase
      .from('recipe_extractions')
      .insert({ user_id: user.id });
    
    if (insertError) {
      console.error('Error recording extraction:', insertError);
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error extracting recipe:', error);
    
    // Handle specific error types with user-friendly Swiss German messages
    if (error instanceof Error) {
      if (error.message.includes('INSUFFICIENT_CONTENT')) {
        // Extract the specific error message (after the prefix)
        const detailMessage = error.message.replace('INSUFFICIENT_CONTENT: ', '');
        return NextResponse.json(
          { error: detailMessage },
          { status: 400 }
        );
      }
      
      // TikTok specific error
      if (error.message.includes('Failed to fetch TikTok') || error.message.includes('TikTok may be blocking')) {
        return NextResponse.json(
          { error: 'TikTok-Videos chönd nöd direkt usglese wärde. TikTok blockiert automatischi Zuegriff. Bitte bruuch de Link us de Bio oder de Website wo im Video erwähnt wird.' },
          { status: 400 }
        );
      }
      
      // Other specific error types
      if (error.message.includes('Failed to fetch YouTube')) {
        return NextResponse.json(
          { error: 'Das YouTube-Video konnt nöd glade wärde. Probier es anders Video oder prüef d URL.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Invalid YouTube URL')) {
        return NextResponse.json(
          { error: 'Ungültigi YouTube-URL. Prüef d URL und probiers nomal.' },
          { status: 400 }
        );
      }
    }
    
    // Generic error message
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rezept konnt nöd extrahiert wärdä' },
      { status: 500 }
    );
  }
}
