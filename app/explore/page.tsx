import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Eye } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Recipe } from "@/lib/supabase/types";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { HoverEffect } from "@/components/ui/card-hover-effect";

export default async function ExplorePage() {
  const { data: recipes } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50) as { data: Recipe[] | null };

  const recipeItems = recipes?.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description || "No description available",
    image: recipe.image_url,
    servings: recipe.servings,
    totalTime: recipe.total_time,
    difficulty: recipe.difficulty,
    tags: recipe.tags,
    viewCount: recipe.view_count,
  })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FloatingNav />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-6">
            <span className="text-sm font-medium text-foreground">✨ Public Recipes</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Explore Recipes
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover recipes shared by our community
          </p>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-16">
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link 
                key={recipe.id} 
                href={`/recipe/${recipe.id}`}
                className="group"
              >
                <div className="relative h-full bg-card/50 backdrop-blur-xl border border-border rounded-3xl overflow-hidden hover:bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
                  {/* Recipe Image */}
                  <div className="relative h-56 overflow-hidden">
                    {recipe.image_url ? (
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/50 to-blue-500/50 flex items-center justify-center">
                        <span className="text-6xl">👨‍🍳</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    
                    {/* Tags Overlay */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge 
                            key={tag} 
                            className="bg-background/50 backdrop-blur-sm text-foreground border-border"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>

                    {recipe.description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                        {recipe.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                      {recipe.servings && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{recipe.servings}</span>
                        </div>
                      )}
                      {recipe.total_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{formatTime(recipe.total_time)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{recipe.view_count}</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    {recipe.difficulty && (
                      <div className="pt-2">
                        <Badge 
                          className={`${
                            recipe.difficulty === 'easy' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : recipe.difficulty === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🍳</div>
            <h3 className="text-2xl font-bold text-muted-foreground mb-4">No recipes yet</h3>
            <p className="text-muted-foreground mb-8">Be the first to share a recipe!</p>
            <Link 
              href="/add"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              Add Your First Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
