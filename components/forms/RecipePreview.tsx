"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Loader2, Globe, Lock } from "lucide-react";
import Image from "next/image";
import { ParsedRecipe } from "@/lib/recipe-parser";
import { getDifficultyColor, formatTime } from "@/lib/utils";
import { Ingredient, Instruction } from "@/lib/supabase/types";
import { useState } from "react";

interface RecipePreviewProps {
  recipe: ParsedRecipe;
  onSave: (isPublic: boolean) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

export function RecipePreview({ recipe, onSave, onCancel, loading, error }: RecipePreviewProps) {
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Preview</CardTitle>
          <CardDescription>
            Review the extracted recipe and save it to your collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image */}
          {recipe.image_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>

          {/* Meta Info */}
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

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {(recipe.ingredients as Ingredient[]).map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                    {ingredient.notes && (
                      <span className="text-muted-foreground"> ({ingredient.notes})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="space-y-4">
              {(recipe.instructions as Instruction[]).map((instruction) => (
                <li key={instruction.step_number} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {instruction.step_number}
                  </span>
                  <div className="flex-1 pt-1">
                    <p>{instruction.description}</p>
                    {instruction.duration && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTime(instruction.duration)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium mb-1">Recipe Visibility</h4>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? "This recipe will be visible to everyone" 
                  : "Only you can see this recipe"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Private
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onSave(isPublic)}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Recipe"
              )}
            </Button>
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
