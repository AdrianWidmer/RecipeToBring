import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat, ArrowLeft, Heart } from "lucide-react";
import { getDifficultyColor, formatTime } from "@/lib/utils";
import { Ingredient, Instruction } from "@/lib/supabase/types";
import { BringImportButton } from "@/components/recipe/BringImportButton";

export default async function RecipePage({ params }: { params: { id: string } }) {
  const { data: recipe, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  // Increment view count
  await supabaseAdmin
    .from("recipes")
    .update({ view_count: recipe.view_count + 1 })
    .eq("id", recipe.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Image */}
      {recipe.image_url && (
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="container max-w-4xl py-8 px-4 space-y-8">
        {/* Title & Meta */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
          
          {recipe.description && (
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {recipe.servings} servings
            </Badge>
            {recipe.total_time && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(recipe.total_time)}
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                <ChefHat className="w-3 h-3 mr-1" />
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-secondary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          <ul className="space-y-3">
            {(recipe.ingredients as Ingredient[]).map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-muted-foreground mt-1">•</span>
                <span className="flex-1">
                  <span className="font-medium">
                    {ingredient.amount} {ingredient.unit}
                  </span>{" "}
                  {ingredient.name}
                  {ingredient.notes && (
                    <span className="text-muted-foreground text-sm ml-1">
                      ({ingredient.notes})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Instructions</h2>
          <ol className="space-y-6">
            {(recipe.instructions as Instruction[]).map((instruction) => (
              <li key={instruction.step_number} className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {instruction.step_number}
                </span>
                <div className="flex-1 pt-2">
                  <p className="text-base leading-relaxed">{instruction.description}</p>
                  {instruction.duration && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatTime(instruction.duration)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Source */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          <p>
            Source:{" "}
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {recipe.source_type === "youtube"
                ? "YouTube"
                : recipe.source_type === "tiktok"
                ? "TikTok"
                : "Original Recipe"}
            </a>
          </p>
        </div>
      </div>

      {/* Bring Import Button - Sticky on Mobile */}
      <BringImportButton recipeUrl={`${process.env.NEXT_PUBLIC_APP_URL}/recipe/${recipe.id}`} />
    </div>
  );
}
