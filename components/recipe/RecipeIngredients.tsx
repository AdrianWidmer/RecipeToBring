"use client";

import { useState } from "react";
import { Ingredient } from "@/lib/supabase/types";
import { ServingsScaler } from "./ServingsScaler";
import { BringImportButton } from "./BringImportButton";

interface RecipeIngredientsProps {
  initialServings: number;
  initialIngredients: Ingredient[];
  recipeTitle: string;
}

export function RecipeIngredients({
  initialServings,
  initialIngredients,
  recipeTitle,
}: RecipeIngredientsProps) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [servings, setServings] = useState(initialServings);

  const handleScaleChange = (
    scaledIngredients: Ingredient[],
    newServings: number
  ) => {
    setIngredients(scaledIngredients);
    setServings(newServings);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-24">
        <ServingsScaler
          initialServings={initialServings}
          ingredients={initialIngredients}
          onScaleChange={handleScaleChange}
        />

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Zuetate
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
              <BringImportButton 
                ingredients={ingredients} 
                recipeTitle={recipeTitle}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
