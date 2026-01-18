"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    bringwidgets?: {
      import: {
        render: (element: HTMLElement, config: any) => void;
        setUrl: (url: string) => void;
        setRequestedQuantity: (quantity: number) => void;
        setBaseQuantity: (quantity: number) => void;
      };
    };
  }
}

interface BringImportButtonProps {
  baseServings: number;
  currentServings: number;
}

export function BringImportButton({ baseServings, currentServings }: BringImportButtonProps) {
  useEffect(() => {
    // Load Bring! widget script
    const script = document.createElement("script");
    script.src = "https://platform.getbring.com/widgets/import.js";
    script.async = true;
    script.id = "bring-widget-script";

    // Only add if not already present
    if (!document.getElementById("bring-widget-script")) {
      document.body.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById("bring-widget-script");
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Update requested quantity when servings change
  useEffect(() => {
    if (typeof window !== "undefined" && window.bringwidgets?.import) {
      window.bringwidgets.import.setRequestedQuantity(currentServings);
    }
  }, [currentServings]);

  return (
    <div
      data-bring-import=""
      data-bring-theme="dark"
      data-bring-language="de"
      data-bring-base-quantity={baseServings}
      data-bring-requested-quantity={currentServings}
      className="bring-button-container"
    >
      {/* Fallback link for when widget doesn't load */}
      <a
        href="https://www.getbring.com"
        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl rounded-lg px-6 py-3 text-center"
      >
        Zu Bring! hinzuefüegä
      </a>
    </div>
  );
}


