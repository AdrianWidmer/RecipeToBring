import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Heart, Eye } from "lucide-react";
import { getDifficultyColor, formatTime } from "@/lib/utils";
import { Ingredient, Instruction, Recipe } from "@/lib/supabase/types";
import { BringImportButton } from "@/components/recipe/BringImportButton";
import { FloatingNav } from "@/components/layout/FloatingNav";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single() as { data: Recipe | null; error: any };
    
  const recipe = data;

  if (error || !recipe) {
    notFound();
  }

  // Increment view count
  await supabaseAdmin
    .from("recipes")
    // @ts-ignore - Supabase types issue with update
    .update({ view_count: recipe.view_count + 1 })
    .eq("id", recipe.id);

  const ingredients = recipe.ingredients as unknown as Ingredient[];
  const instructions = recipe.instructions as unknown as Instruction[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FloatingNav />

      {/* Hero Section with Image */}
      {recipe.image_url && (
        <div className="relative w-full h-[60vh] md:h-[70vh]">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                {recipe.tags && recipe.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="bg-primary/20 backdrop-blur-sm text-primary border-primary/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                {recipe.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                {recipe.servings && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
                {recipe.total_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{formatTime(recipe.total_time)}</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span>{recipe.view_count + 1} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Description */}
        {recipe.description && (
          <div className="mb-16">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-[2fr,3fr] gap-12 md:gap-16">
          {/* Ingredients */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                  Ingredients
                </h2>
                
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-card transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          {ingredient.amount && (
                            <span className="text-primary font-semibold">
                              {ingredient.amount}
                            </span>
                          )}
                          {ingredient.unit && (
                            <span className="text-muted-foreground text-sm">
                              {ingredient.unit}
                            </span>
                          )}
                          <span className="text-foreground font-medium">
                            {ingredient.name}
                          </span>
                        </div>
                        {ingredient.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {ingredient.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bring Import Button */}
                <div className="mt-8 pt-6 border-t border-border">
                  <BringImportButton recipeUrl={recipe.source_url} />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">
              Instructions
            </h2>

            <div className="space-y-6">
              {instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 hover:bg-card transition-all group"
                >
                  {/* Step Number */}
                  <div className="absolute -left-4 top-6 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {instruction.step_number}
                  </div>
                  
                  <div className="ml-12">
                    <p className="text-lg leading-relaxed text-foreground">
                      {instruction.description}
                    </p>
                    {instruction.duration && (
                      <div className="flex items-center gap-2 mt-4 text-primary">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{formatTime(instruction.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Link */}
        {recipe.source_url && (
          <div className="mt-16 pt-12 border-t border-border text-center">
            <p className="text-muted-foreground mb-4">Original Recipe</p>
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <span className="text-lg">View Source</span>
              <span className="text-xl">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
