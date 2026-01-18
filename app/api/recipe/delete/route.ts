import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Nöd autorisiert" }, { status: 401 });
    }

    // Get recipe ID from request
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: "Rezept-ID wird bruucht" },
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
        { error: "Du chasch nur dini eigene Rezept lösche" },
        { status: 403 }
      );
    }

    // Delete the recipe
    const { error: deleteError } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId);

    if (deleteError) {
      console.error("Error deleting recipe:", deleteError);
      return NextResponse.json(
        { error: "Rezept konnt nöd glöscht wärdä" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Rezept erfolgriich glöscht" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in delete recipe API:", error);
    return NextResponse.json(
      { error: "Intärnä Server-Fähler" },
      { status: 500 }
    );
  }
}
