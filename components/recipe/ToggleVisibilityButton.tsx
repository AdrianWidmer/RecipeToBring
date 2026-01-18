"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleVisibilityButtonProps {
  recipeId: string;
  initialIsPublic: boolean;
}

export function ToggleVisibilityButton({
  recipeId,
  initialIsPublic,
}: ToggleVisibilityButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recipe/update-visibility", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId,
          isPublic: !isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fähler bim Ändere vo dä Sichtbarkeit");
      }

      setIsPublic(!isPublic);
      
      // Reload page to update UI
      window.location.reload();
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError(
        err instanceof Error ? err.message : "Es isch en Fähler passiert"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant="outline"
        className={cn(
          "border-border hover:bg-accent transition-all duration-200",
          isPublic
            ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
            : "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : isPublic ? (
          <Globe className="h-4 w-4 mr-2" />
        ) : (
          <Lock className="h-4 w-4 mr-2" />
        )}
        {loading
          ? "Ändere..."
          : isPublic
          ? "Öffentlich"
          : "Privat"}
      </Button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {isPublic
          ? "Alli chönd das Rezept gseh"
          : "Nur du chasch das Rezept gseh"}
      </p>
    </div>
  );
}
