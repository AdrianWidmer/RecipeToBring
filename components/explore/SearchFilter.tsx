"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Clock, Filter } from "lucide-react";

export interface FilterOptions {
  searchQuery: string;
  timeFilter: string | null;
  tagFilters: string[];
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalResults?: number;
  availableTags: string[];
}

const TIME_FILTERS = [
  { value: "30", label: "Under 30 min" },
  { value: "60", label: "Under 1 Stund" },
  { value: "120", label: "Under 2 Stunde" },
  { value: "120+", label: "Über 2 Stunde" },
];

export function SearchFilter({ onFilterChange, totalResults, availableTags }: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search and notify parent of filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        searchQuery: query,
        timeFilter: selectedTime,
        tagFilters: selectedTags,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedTime, selectedTags, onFilterChange]);

  const handleClear = () => {
    setQuery("");
    setSelectedTime(null);
    setSelectedTags([]);
    onFilterChange({
      searchQuery: "",
      timeFilter: null,
      tagFilters: [],
    });
  };

  const toggleTimeFilter = (timeValue: string) => {
    setSelectedTime(selectedTime === timeValue ? null : timeValue);
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasActiveFilters = selectedTime !== null || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rezept, Zuetate oder Schlagwörter sueche..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-24 h-14 text-lg bg-card border-border focus:border-primary transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {(query || hasActiveFilters) && (
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Alles lösche"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-all ${
              hasActiveFilters
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Filter"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Time Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Kochziit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => toggleTimeFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTime === filter.value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="text-primary">#</span>
                <span>Schlagwörter</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedTime && selectedTags.length > 0
                  ? `Ziit & ${selectedTags.length} Tag${selectedTags.length !== 1 ? "s" : ""}`
                  : selectedTime
                  ? "Ziit-Filter aktiv"
                  : `${selectedTags.length} Tag${selectedTags.length !== 1 ? "s" : ""} gwählt`}
              </p>
              <button
                onClick={() => {
                  setSelectedTime(null);
                  setSelectedTags([]);
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Filter lösche
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {(query || hasActiveFilters) && totalResults !== undefined && (
        <p className="text-sm text-muted-foreground text-center">
          {totalResults === 0
            ? "Kei Rezept gfunde"
            : `${totalResults} Rezept${totalResults !== 1 ? "" : ""} gfunde`}
        </p>
      )}
    </div>
  );
}
