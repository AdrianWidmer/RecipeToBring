'use client';

import { useAuth } from '@/lib/auth/context';
import { DeleteRecipeButton } from './DeleteRecipeButton';

interface RecipeActionsProps {
  recipeId: string;
  recipeTitle: string;
  recipeOwnerId: string | null;
}

export function RecipeActions({ recipeId, recipeTitle, recipeOwnerId }: RecipeActionsProps) {
  const { user } = useAuth();

  // Only show delete button if user owns the recipe
  if (!user || !recipeOwnerId || user.id !== recipeOwnerId) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <DeleteRecipeButton recipeId={recipeId} recipeTitle={recipeTitle} />
    </div>
  );
}
