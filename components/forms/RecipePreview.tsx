"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Loader2, Globe, Lock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { ParsedRecipe } from "@/lib/recipe-parser";
import { getDifficultyColor, formatTime } from "@/lib/utils";
import { Ingredient, Instruction } from "@/lib/supabase/types";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Success Banner */}
      <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 flex items-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-green-400 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-green-300">Rezept erfolgriich extrahiert!</h3>
          <p className="text-muted-foreground">Prüef d'Details und speicher's i dinere Sammlig</p>
        </div>
      </div>

      {/* Main Preview Card */}
      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl overflow-hidden">
        {/* Image */}
        {recipe.image_url && (
          <div className="relative w-full h-80 md:h-96">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="p-8 md:p-12 space-y-8">
          {/* Title & Description */}
          <div>
            <h2 className="text-4xl font-bold mb-4 text-foreground">{recipe.title}</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">{recipe.description}</p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {recipe.servings} Portione
            </Badge>
            {recipe.total_time && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(recipe.total_time)}
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge className={`${
                recipe.difficulty === 'easy' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : recipe.difficulty === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              } px-4 py-2`}>
                <ChefHat className="w-4 h-4 mr-2" />
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="bg-card border-border text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-primary">Zuetate</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {(recipe.ingredients as Ingredient[]).map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
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
                      <span className="text-foreground">
                        {ingredient.name}
                      </span>
                    </div>
                    {ingredient.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{ingredient.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-blue-500">Aaleitige</h3>
            <div className="space-y-4">
              {(recipe.instructions as Instruction[]).map((instruction) => (
                <div
                  key={instruction.step_number}
                  className="relative bg-card backdrop-blur-xl border border-border rounded-2xl p-6"
                >
                  <div className="absolute -left-4 top-6 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-lg font-bold">
                    {instruction.step_number}
                  </div>
                  <div className="ml-10">
                    <p className="text-foreground leading-relaxed">{instruction.description}</p>
                    {instruction.duration && (
                      <div className="flex items-center gap-2 mt-3 text-primary">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{formatTime(instruction.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-6 bg-card backdrop-blur-xl border border-border rounded-2xl">
            <div>
              <h4 className="font-semibold mb-1 text-lg text-foreground">Rezept-Sichtbarkeit</h4>
              <p className="text-muted-foreground">
                {isPublic 
                  ? "Alli chönd das Rezept uf dä Entdeck-Siite gseh" 
                  : "Nur du chasch das Rezept gseh"}
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsPublic(!isPublic)}
              className={`border-border ${isPublic ? 'bg-primary/20 border-primary/30' : ''}`}
            >
              {isPublic ? (
                <>
                  <Globe className="w-5 h-5 mr-2" />
                  Öffentlich
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Privat
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={() => onSave(isPublic)}
              disabled={loading}
              className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 rounded-xl font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-3 h-5 w-5" />
                  Rezept speichere
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              size="lg"
              className="border-border hover:bg-card h-14 text-lg px-8 rounded-xl"
            >
              Abbreche
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
