"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Ingredient } from "@/lib/supabase/types";

declare global {
  interface Window {
    bringwidgets?: {
      import: {
        render: (element: HTMLElement, config: any) => void;
        setUrl: (url: string) => void;
      };
    };
  }
}

interface BringImportButtonProps {
  ingredients: Ingredient[];
  recipeTitle: string;
}

export function BringImportButton({ ingredients, recipeTitle }: BringImportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Get current page URL for Bring to scrape
    setCurrentUrl(window.location.href);
  }, []);

  const handleBringImport = async () => {
    try {
      setIsLoading(true);

      // Format ingredients for Bring API
      const formattedIngredients = ingredients
        .map((ing) => {
          const amount = ing.amount ? `${ing.amount} ` : "";
          const unit = ing.unit ? `${ing.unit} ` : "";
          const notes = ing.notes ? ` (${ing.notes})` : "";
          return `${amount}${unit}${ing.name}${notes}`;
        })
        .join("\n");

      // Create a Bring deep link with ingredients
      const bringUrl = new URL("https://api.getbring.com/rest/v2/bringrecipes/deeplink");
      bringUrl.searchParams.set("source", currentUrl || window.location.href);
      bringUrl.searchParams.set("url", currentUrl || window.location.href);

      // Try to open Bring app or fallback to widget
      if (typeof window !== "undefined") {
        // First try: Use Bring widget if available
        const element = document.getElementById("bring-button-container");
        if (element && window.bringwidgets) {
          window.bringwidgets.import.setUrl(currentUrl || window.location.href);
        } else {
          // Second try: Use deep link to open Bring app
          window.open(bringUrl.toString(), "_blank");
        }
      }
    } catch (error) {
      console.error("Bring import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load Bring widget script
    const script = document.createElement("script");
    script.src = "https://platform.getbring.com/widgets/import.js";
    script.async = true;
    script.id = "bring-widget-script";

    // Only add if not already present
    if (!document.getElementById("bring-widget-script")) {
      document.body.appendChild(script);

      script.onload = () => {
        const element = document.getElementById("bring-button-container");
        if (element && window.bringwidgets && currentUrl) {
          try {
            window.bringwidgets.import.render(element, {
              url: currentUrl,
              theme: "dark",
              language: "de",
            });
          } catch (error) {
            console.error("Bring widget render error:", error);
          }
        }
      };
    }

    return () => {
      const existingScript = document.getElementById("bring-widget-script");
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, [currentUrl]);

  return (
    <div id="bring-button-container" data-bring-import={currentUrl} data-bring-theme="dark">
      <Button
        onClick={handleBringImport}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Wird glädä...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Zu Bring! hinzuefüegä
          </>
        )}
      </Button>
    </div>
  );
}

