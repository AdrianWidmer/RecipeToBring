'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { ParsedRecipe } from "@/lib/recipe-parser";
import { RecipePreview } from "@/components/forms/RecipePreview";
import { useAuth } from "@/lib/auth/context";
import { ResizableNav } from "@/components/layout/ResizableNav";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { motion } from "framer-motion";

export default function AddRecipePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedRecipe, setExtractedRecipe] = useState<ParsedRecipe | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/add');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Bitte gib en URL ii');
      return;
    }

    setLoading(true);
    setError("");
    setExtractedRecipe(null);

    try {
      const response = await fetch("/api/recipe/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Rezäpt konnt nöd extrahiert wärdä");
      }

      setExtractedRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezäpt konnt nöd extrahiert wärdä");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isPublic: boolean) => {
    if (!extractedRecipe) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recipe/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...extractedRecipe,
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Rezäpt konnt nöd gspeicheret wärdä");
      }

      router.push(`/recipe/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezäpt konnt nöd gspeicheret wärdä");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ResizableNav />
      <BackgroundBeams className="opacity-40" />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-24 pt-32 px-4">
        <div className="w-full max-w-5xl">
          {!extractedRecipe ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
            {/* Hero Text */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">AI-gstützti Rezäpt-Extraktion</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Füeg dis Rezäpt hinzue
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Füeg irgendän Rezäpt-URL ii und lass üsi AI d'Magie machä
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
              <form onSubmit={handleExtract} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Rezäpt URL</label>
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="https://www.example.com/rezept oder https://youtube.com/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      className="text-base h-14 bg-background/50 border-border focus:border-primary rounded-xl pl-12 text-foreground placeholder:text-muted-foreground"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 rounded-xl font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Extrahiere Rezäpt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      Rezäpt extrahiere
                    </>
                  )}
                </Button>
              </form>

              {/* Supported Sources */}
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-4">Unterstützti Quellä:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Websitene', icon: '🌐' },
                    { name: 'YouTube', icon: '📺' },
                    { name: 'TikTok', icon: '🎵' },
                    { name: 'Blogs', icon: '📝' },
                  ].map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center gap-2 bg-card/50 rounded-lg px-4 py-3 border border-border"
                    >
                      <span className="text-2xl">{source.icon}</span>
                      <span className="text-sm text-muted-foreground">{source.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features List */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {[
                  'AI-gstützti Extraktion',
                  'Sofort Zuetate-Lischte',
                  'Schritt-für-Schritt Aaleitige',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <RecipePreview
              recipe={extractedRecipe}
              onSave={handleSave}
              onCancel={() => setExtractedRecipe(null)}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
