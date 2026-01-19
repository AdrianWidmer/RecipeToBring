'use client';

import { useAuth } from '@/lib/auth/context';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { VisibilityDropdown } from './ToggleVisibilityButton';

interface RecipeActionsProps {
  recipeId: string;
  recipeTitle: string;
  recipeOwnerId: string | null;
  isPublic?: boolean;
  visibility?: 'public' | 'private' | 'friends_only';
}

export function RecipeActions({ 
  recipeId, 
  recipeTitle, 
  recipeOwnerId, 
  isPublic, 
  visibility 
}: RecipeActionsProps) {
  const { user } = useAuth();

  // Only show actions if user owns the recipe
  if (!user || !recipeOwnerId || user.id !== recipeOwnerId) {
    return null;
  }

  // Determine visibility from either new or old format
  const currentVisibility = visibility || (isPublic ? 'public' : 'private');

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
      <VisibilityDropdown 
        recipeId={recipeId} 
        initialVisibility={currentVisibility}
      />
      <DeleteRecipeButton recipeId={recipeId} recipeTitle={recipeTitle} />
    </div>
  );
}
