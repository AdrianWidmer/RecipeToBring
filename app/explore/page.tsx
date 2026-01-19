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
import { SearchFilter, FilterOptions } from "@/components/explore/SearchFilter";

type VisibilityType = 'public' | 'private' | 'friends_only';

export default function ExplorePage() {
  const { user } = useAuth();
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [friendsRecipes, setFriendsRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    timeFilter: null,
    tagFilters: [],
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);

      // Fetch public recipes
      const { data: publicData } = await supabase
        .from("recipes")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(50);

      setPublicRecipes(publicData || []);

      let privateData: Recipe[] = [];
      let friendsData: Recipe[] = [];

      // If user is logged in, also fetch their private and friends-only recipes
      if (user) {
        const { data: privateResult } = await supabase
          .from("recipes")
          .select("*")
          .eq("created_by", user.id)
          .eq("visibility", "private")
          .order("created_at", { ascending: false });

        privateData = privateResult || [];
        setPrivateRecipes(privateData);

        const { data: friendsResult } = await supabase
          .from("recipes")
          .select("*")
          .eq("visibility", "friends_only")
          .order("created_at", { ascending: false });

        friendsData = friendsResult || [];
        setFriendsRecipes(friendsData);
      }

      // Extract unique tags from all recipes
      const allRecipes = [...(publicData || []), ...privateData, ...friendsData];
      const tagsSet = new Set<string>();
      allRecipes.forEach((recipe) => {
        if (recipe.tags && Array.isArray(recipe.tags)) {
          recipe.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setAvailableTags(Array.from(tagsSet).sort());

      setLoading(false);
    };

    fetchRecipes();
  }, [user]);

  // Filter recipes based on search query, time, and tags
  const filterRecipes = (recipes: Recipe[]) => {
    let filtered = recipes;

    // Apply search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((recipe) => {
        // Search in title
        if (recipe.title.toLowerCase().includes(query)) return true;
        
        // Search in description
        if (recipe.description?.toLowerCase().includes(query)) return true;
        
        // Search in tags
        if (recipe.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;
        
        // Search in ingredients
        if (recipe.ingredients) {
          const ingredientsString = JSON.stringify(recipe.ingredients).toLowerCase();
          if (ingredientsString.includes(query)) return true;
        }
        
        return false;
      });
    }

    // Apply time filter
    if (filters.timeFilter) {
      filtered = filtered.filter((recipe) => {
        if (!recipe.total_time) return false;
        
        const totalTimeMinutes = recipe.total_time;
        
        if (filters.timeFilter === "30") {
          return totalTimeMinutes <= 30;
        } else if (filters.timeFilter === "60") {
          return totalTimeMinutes <= 60;
        } else if (filters.timeFilter === "120") {
          return totalTimeMinutes <= 120;
        } else if (filters.timeFilter === "120+") {
          return totalTimeMinutes > 120;
        }
        
        return true;
      });
    }

    // Apply tag filters
    if (filters.tagFilters.length > 0) {
      filtered = filtered.filter((recipe) => {
        if (!recipe.tags || recipe.tags.length === 0) return false;
        // Recipe must have at least one of the selected tags
        return filters.tagFilters.some((tag) => recipe.tags?.includes(tag));
      });
    }

    return filtered;
  };

  const filteredPublicRecipes = filterRecipes(publicRecipes);
  const filteredPrivateRecipes = filterRecipes(privateRecipes);
  const filteredFriendsRecipes = filterRecipes(friendsRecipes);
  const totalResults = filteredPublicRecipes.length + filteredPrivateRecipes.length + filteredFriendsRecipes.length;

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    // Determine visibility from the visibility field, with fallback to is_public
    const visibility: VisibilityType = recipe.visibility || (recipe.is_public ? 'public' : 'private');
    
    return (
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
            
            {/* Visibility Badge */}
            <div className="absolute top-4 right-4">
              <Badge className={`${
                visibility === 'public'
                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                  : visibility === 'friends_only'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              } backdrop-blur-sm`}>
                {visibility === 'public' ? (
                  <><Globe className="w-3 h-3 mr-1" /> Öffentlich</>
                ) : visibility === 'friends_only' ? (
                  <><Users className="w-3 h-3 mr-1" /> Fründe</>
                ) : (
                  <><Lock className="w-3 h-3 mr-1" /> Privat</>
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
};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ResizableNav />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-6">
            <span className="text-sm font-medium text-foreground">✨ Entdeck Rezept</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Rezept entdecke
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {user ? "Dini privaten Rezept und Community-Favoriten" : "Entdeck Rezept vo üserer Community"}
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="container max-w-7xl mx-auto px-4 -mt-8 mb-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <SearchFilter 
            onFilterChange={setFilters}
            totalResults={filters.searchQuery || filters.timeFilter || filters.tagFilters.length > 0 ? totalResults : undefined}
            availableTags={availableTags}
          />
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-16 space-y-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Rezept werded glade...</p>
          </div>
        ) : (
          <>
            {/* Private Recipes Section - Only for logged in users */}
            {user && filteredPrivateRecipes.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-orange-400" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Mini privaten Rezept
                  </h2>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {filteredPrivateRecipes.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPrivateRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {/* Friends-Only Recipes Section - Only for logged in users */}
            {user && filteredFriendsRecipes.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Fründe & Familie
                  </h2>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {filteredFriendsRecipes.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredFriendsRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {/* Public Recipes Section */}
            {filteredPublicRecipes.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-400" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Öffentlichi Rezept
                  </h2>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    {filteredPublicRecipes.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPublicRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPublicRecipes.length === 0 && filteredPrivateRecipes.length === 0 && filteredFriendsRecipes.length === 0 && (
              <div className="text-center py-20">
                {filters.searchQuery || filters.timeFilter || filters.tagFilters.length > 0 ? (
                  <>
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-bold text-muted-foreground mb-4">Kei Rezept gfunde</h3>
                    <p className="text-muted-foreground mb-8">Probier en anderen Suechbegriff oder Filter</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-6">🍳</div>
                    <h3 className="text-2xl font-bold text-muted-foreground mb-4">No Rezept no</h3>
                    <p className="text-muted-foreground mb-8">Sii de Erst, wo es Rezept teilt!</p>
                    <Link 
                      href="/add"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all"
                    >
                      Füeg dis erschts Rezept hinzue
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
