'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Eye, Lock, Globe } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Recipe } from "@/lib/supabase/types";
import { ResizableNav } from "@/components/layout/ResizableNav";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";

export default function ExplorePage() {
  const { user } = useAuth();
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);

      // Fetch public recipes
      const { data: publicData } = await supabase
        .from("recipes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      setPublicRecipes(publicData || []);

      // If user is logged in, also fetch their private recipes
      if (user) {
        const { data: privateData } = await supabase
          .from("recipes")
          .select("*")
          .eq("created_by", user.id)
          .eq("is_public", false)
          .order("created_at", { ascending: false });

        setPrivateRecipes(privateData || []);
      }

      setLoading(false);
    };

    fetchRecipes();
  }, [user]);

  const RecipeCard = ({ recipe, isPrivate }: { recipe: Recipe; isPrivate?: boolean }) => (
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
          
          {/* Privacy Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`${
              isPrivate 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                : 'bg-green-500/20 text-green-300 border-green-500/30'
            } backdrop-blur-sm`}>
              {isPrivate ? (
                <><Lock className="w-3 h-3 mr-1" /> Private</>
              ) : (
                <><Globe className="w-3 h-3 mr-1" /> Public</>
              )}
            </Badge>
          </div>
          
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
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ResizableNav />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-6">
            <span className="text-sm font-medium text-foreground">✨ Entdeck Rezäpt</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Rezäpt entdeckä
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {user ? "Dini privaten Rezäpt und Community-Favoriten" : "Entdeck Rezäpt vo üserer Community"}
          </p>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-16 space-y-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Rezäpt werded glade...</p>
          </div>
        ) : (
          <>
            {/* Private Recipes Section - Only for logged in users */}
            {user && privateRecipes.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-purple-400" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Mini privaten Rezäpt
                  </h2>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {privateRecipes.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {privateRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} isPrivate />
                  ))}
                </div>
              </div>
            )}

            {/* Public Recipes Section */}
            {publicRecipes.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-400" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Öffentlichi Rezäpt
                  </h2>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    {publicRecipes.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publicRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && publicRecipes.length === 0 && privateRecipes.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🍳</div>
                <h3 className="text-2xl font-bold text-muted-foreground mb-4">No Rezäpt no</h3>
                <p className="text-muted-foreground mb-8">Sii de Erst, wo es Rezäpt teilt!</p>
                <Link 
                  href="/add"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all"
                >
                  Füeg dis erschts Rezäpt hinzue
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
