"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchFilterProps {
  onSearchChange: (query: string) => void;
  totalResults?: number;
}

export function SearchFilter({ onSearchChange, totalResults }: SearchFilterProps) {
  const [query, setQuery] = useState("");

  // Debounce search to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  const handleClear = () => {
    setQuery("");
    onSearchChange("");
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rezept, Zuetate oder Schlagwörter sueche..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-12 h-14 text-lg bg-card border-border focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Suechi lösche"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {query && totalResults !== undefined && (
        <p className="text-sm text-muted-foreground text-center">
          {totalResults === 0 
            ? "Kei Rezept gfunde" 
            : `${totalResults} Rezept${totalResults !== 1 ? "" : ""} gfunde`}
        </p>
      )}
    </div>
  );
}
