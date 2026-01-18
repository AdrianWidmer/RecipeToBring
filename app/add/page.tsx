"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link as LinkIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ParsedRecipe } from "@/lib/recipe-parser";
import { RecipePreview } from "@/components/forms/RecipePreview";

export default function AddRecipePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedRecipe, setExtractedRecipe] = useState<ParsedRecipe | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedRecipe(null);

    try {
      // For now, we'll use a dummy user ID since auth isn't set up yet
      const userId = "00000000-0000-0000-0000-000000000000";
      
      const response = await fetch("/api/recipe/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract recipe");
      }

      setExtractedRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isPublic: boolean) => {
    if (!extractedRecipe) return;

    setLoading(true);
    setError("");

    try {
      const userId = "00000000-0000-0000-0000-000000000000";

      const response = await fetch("/api/recipe/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...extractedRecipe,
          created_by: userId,
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save recipe");
      }

      // Redirect to recipe page
      window.location.href = `/recipe/${data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-xl font-bold">Add Recipe</h1>
        </div>
      </header>

      <div className="container max-w-4xl py-8 px-4">
        {!extractedRecipe ? (
          <Card>
            <CardHeader>
              <CardTitle>Extract Recipe from URL</CardTitle>
              <CardDescription>
                Paste a link to any recipe website, YouTube video, or TikTok. Our AI will extract the ingredients and instructions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExtract} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://www.example.com/recipe or https://youtube.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className="text-base"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting Recipe...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Extract Recipe
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Supported Sources:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Recipe websites (AllRecipes, FoodNetwork, BBC Good Food, etc.)</li>
                  <li>• YouTube cooking videos</li>
                  <li>• TikTok recipe videos</li>
                  <li>• Any website with recipe content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RecipePreview
            recipe={extractedRecipe}
            onSave={handleSave}
            onCancel={() => setExtractedRecipe(null)}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
