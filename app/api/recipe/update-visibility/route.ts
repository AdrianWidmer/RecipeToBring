import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-client";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Nöd autorisiert" }, { status: 401 });
    }

    // Get recipe ID and new visibility from request
    const body = await request.json();
    const { recipeId, isPublic, visibility } = body;

    // Support both old (isPublic) and new (visibility) format
    let newVisibility: 'public' | 'private' | 'friends_only';
    
    if (visibility !== undefined) {
      // New format
      if (!['public', 'private', 'friends_only'].includes(visibility)) {
        return NextResponse.json(
          { error: "Ungültigi Sichtbarkeit" },
          { status: 400 }
        );
      }
      newVisibility = visibility;
    } else if (isPublic !== undefined) {
      // Old format (backward compatibility)
      newVisibility = isPublic ? 'public' : 'private';
    } else {
      return NextResponse.json(
        { error: "Rezept-ID und Sichtbarkeit sind erforderlich" },
        { status: 400 }
      );
    }

    if (!recipeId) {
      return NextResponse.json(
        { error: "Rezept-ID isch erforderlich" },
        { status: 400 }
      );
    }

    // First, check if the recipe exists and belongs to the user
    const { data: recipe, error: fetchError } = await supabase
      .from("recipes")
      .select("created_by")
      .eq("id", recipeId)
      .single();

    if (fetchError || !recipe) {
      return NextResponse.json(
        { error: "Rezept nöd gfunde" },
        { status: 404 }
      );
    }

    // Verify the user owns this recipe
    if (recipe.created_by !== user.id) {
      return NextResponse.json(
        { error: "Du chasch nur dini eigene Rezept bearbeite" },
        { status: 403 }
      );
    }

    // Update the visibility
    const { error: updateError } = await supabase
      .from("recipes")
      .update({ 
        visibility: newVisibility,
        is_public: newVisibility === 'public' // Keep is_public in sync for backward compatibility
      })
      .eq("id", recipeId);

    if (updateError) {
      console.error("Error updating recipe visibility:", updateError);
      return NextResponse.json(
        { error: "Sichtbarkeit konnt nöd gänderet wärdä" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Sichtbarkeit erfolgriich gänderet",
        visibility: newVisibility,
        isPublic: newVisibility === 'public'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in update visibility API:", error);
    return NextResponse.json(
      { error: "Intärnä Server-Fähler" },
      { status: 500 }
    );
  }
}
