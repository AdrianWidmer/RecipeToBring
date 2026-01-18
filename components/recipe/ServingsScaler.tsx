"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Users } from "lucide-react";
import { Ingredient } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface ServingsScalerProps {
  initialServings: number;
  ingredients: Ingredient[];
  onScaleChange: (scaledIngredients: Ingredient[], newServings: number) => void;
}

export function ServingsScaler({
  initialServings,
  ingredients,
  onScaleChange,
}: ServingsScalerProps) {
  const [servings, setServings] = useState(initialServings);

  const parseAmount = (amount: number | undefined): number | null => {
    if (amount === undefined || amount === null) return null;
    return amount;
  };

  const formatAmount = (num: number): number => {
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  };

  const scaleIngredients = (newServings: number): Ingredient[] => {
    const scale = newServings / initialServings;
    
    return ingredients.map((ingredient) => {
      const originalAmount = parseAmount(ingredient.amount);
      
      if (originalAmount === null) {
        // Can't scale, return original
        return ingredient;
      }
      
      const scaledAmount = originalAmount * scale;
      
      return {
        ...ingredient,
        amount: formatAmount(scaledAmount),
      };
    });
  };

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
    
    const scaledIngredients = scaleIngredients(newServings);
    onScaleChange(scaledIngredients, newServings);
  };

  return (
    <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">Portione</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleServingsChange(-1)}
            disabled={servings <= 1}
            className="h-10 w-10 rounded-full border-border hover:bg-accent"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="min-w-[60px] text-center">
            <span className="text-2xl font-bold text-primary">{servings}</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleServingsChange(1)}
            className="h-10 w-10 rounded-full border-border hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {servings !== initialServings && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Rezept agpasst vo {initialServings} uf {servings} Portione
          </p>
        </div>
      )}
    </div>
  );
}
