"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

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

export function BringImportButton({ recipeUrl }: { recipeUrl: string }) {
  useEffect(() => {
    // Load Bring widget script
    const script = document.createElement("script");
    script.src = "https://platform.getbring.com/widgets/import.js";
    script.async = true;
    document.body.appendChild(script);

    // Wait for script to load and render widget
    script.onload = () => {
      const element = document.getElementById("bring-button-container");
      if (element && window.bringwidgets) {
        window.bringwidgets.import.render(element, {
          url: recipeUrl,
          theme: "light",
          language: "en",
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [recipeUrl]);

  return (
    <>
      {/* Sticky button container for mobile */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 md:hidden">
        <div id="bring-button-container" data-bring-import={recipeUrl} data-bring-theme="light">
          <Button className="w-full" size="lg">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Zu Bring! Iikaufslischte hinzuefüegä
          </Button>
        </div>
      </div>

      {/* Desktop button */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <div id="bring-button-desktop" data-bring-import={recipeUrl} data-bring-theme="light">
          <Button size="lg" className="shadow-lg">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Zu Bring! hinzuefüegä
          </Button>
        </div>
      </div>
    </>
  );
}
