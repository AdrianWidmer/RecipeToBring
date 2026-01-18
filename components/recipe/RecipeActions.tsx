'use client';

import { useAuth } from '@/lib/auth/context';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { ToggleVisibilityButton } from './ToggleVisibilityButton';

interface RecipeActionsProps {
  recipeId: string;
  recipeTitle: string;
  recipeOwnerId: string | null;
  isPublic: boolean;
}

export function RecipeActions({ recipeId, recipeTitle, recipeOwnerId, isPublic }: RecipeActionsProps) {
  const { user } = useAuth();

  // Only show actions if user owns the recipe
  if (!user || !recipeOwnerId || user.id !== recipeOwnerId) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
      <ToggleVisibilityButton recipeId={recipeId} initialIsPublic={isPublic} />
      <DeleteRecipeButton recipeId={recipeId} recipeTitle={recipeTitle} />
    </div>
  );
}
