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
    const { recipeId, isPublic } = await request.json();

    if (!recipeId || typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "Rezept-ID und Sichtbarkeit sind erforderlich" },
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
      .update({ is_public: isPublic })
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
        isPublic 
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
