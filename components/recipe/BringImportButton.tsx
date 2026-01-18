"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BringImportButtonProps {
  baseServings: number;
  currentServings: number;
}

export function BringImportButton({ baseServings, currentServings }: BringImportButtonProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Get current page URL
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleImport = () => {
    if (!currentUrl) return;

    // Use Bring!'s deep link API (more reliable than widget)
    const bringUrl = new URL("https://api.getbring.com/rest/bringrecipes/deeplink");
    bringUrl.searchParams.set("url", currentUrl); // searchParams.set() already encodes
    bringUrl.searchParams.set("source", "web");
    bringUrl.searchParams.set("baseQuantity", baseServings.toString());
    bringUrl.searchParams.set("requestedQuantity", currentServings.toString());

    // Open in new window/tab (will redirect to Bring! app if installed)
    window.open(bringUrl.toString(), "_blank");
  };

  return (
    <Button
      onClick={handleImport}
      disabled={!currentUrl}
      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
      size="lg"
    >
      <ShoppingBag className="mr-2 h-5 w-5" />
      Zu Bring! hinzuefüegä
    </Button>
  );
}

