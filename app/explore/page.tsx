import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Recipe } from "@/lib/supabase/types";
import { Header } from "@/components/layout/Header";

export default async function ExplorePage() {
  const { data: recipes } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50) as { data: Recipe[] | null };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4">
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {recipe.image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                      {recipe.total_time && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(recipe.total_time)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No public recipes yet. Be the first to share one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
