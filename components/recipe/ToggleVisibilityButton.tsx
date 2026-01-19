"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Users, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisibilityDropdownProps {
  recipeId: string;
  initialVisibility: 'public' | 'private' | 'friends_only';
}

type VisibilityOption = {
  value: 'public' | 'private' | 'friends_only';
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
};

const visibilityOptions: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Öffentlich',
    icon: <Globe className="h-4 w-4" />,
    description: 'Alli chönd das Rezept gseh',
    color: 'green',
  },
  {
    value: 'friends_only',
    label: 'Fründe & Familie',
    icon: <Users className="h-4 w-4" />,
    description: 'Nur dini Fründe chönd das Rezept gseh',
    color: 'blue',
  },
  {
    value: 'private',
    label: 'Privat',
    icon: <Lock className="h-4 w-4" />,
    description: 'Nur du chasch das Rezept gseh',
    color: 'orange',
  },
];

export function VisibilityDropdown({
  recipeId,
  initialVisibility,
}: VisibilityDropdownProps) {
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends_only'>(initialVisibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = visibilityOptions.find(opt => opt.value === visibility) || visibilityOptions[2];

  const handleChange = async (newVisibility: 'public' | 'private' | 'friends_only') => {
    if (newVisibility === visibility) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError("");
    setIsOpen(false);

    try {
      const response = await fetch("/api/recipe/update-visibility", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId,
          visibility: newVisibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fähler bim Ändere vo dä Sichtbarkeit");
      }

      setVisibility(newVisibility);
      
      // Reload page to update UI
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Error changing visibility:", err);
      setError(
        err instanceof Error ? err.message : "Es isch en Fähler passiert"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Current Selection Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        variant="outline"
        className={cn(
          "border-border hover:bg-accent transition-all duration-200 w-full justify-between",
          currentOption.color === 'green' && "bg-green-500/10 border-green-500/30 hover:bg-green-500/20",
          currentOption.color === 'blue' && "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
          currentOption.color === 'orange' && "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
        )}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            currentOption.icon
          )}
          <span>{loading ? "Ändere..." : currentOption.label}</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange(option.value)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-accent transition-colors",
                  "flex items-start gap-3 border-b border-border last:border-b-0",
                  visibility === option.value && "bg-accent"
                )}
              >
                <div className={cn(
                  "mt-0.5",
                  option.color === 'green' && "text-green-400",
                  option.color === 'blue' && "text-blue-400",
                  option.color === 'orange' && "text-orange-400"
                )}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {option.label}
                    {visibility === option.value && (
                      <span className="text-xs text-primary">(Aktiv)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Description */}
      {!isOpen && !loading && (
        <p className="text-xs text-muted-foreground mt-2">
          {currentOption.description}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

// Legacy component for backward compatibility
export function ToggleVisibilityButton({
  recipeId,
  initialIsPublic,
}: {
  recipeId: string;
  initialIsPublic: boolean;
}) {
  return (
    <VisibilityDropdown
      recipeId={recipeId}
      initialVisibility={initialIsPublic ? 'public' : 'private'}
    />
  );
}
