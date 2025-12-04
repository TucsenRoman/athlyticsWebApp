"use client";

import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react"

interface SearchProps<T> {
  data: T[];
  keys: string[];
  renderResult: (item: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  threshold?: number;
  showResults?: boolean;     // 👈 NEW
  onQueryChange?: (value: string) => void; // 👈 NEW
}

export default function Search<T>({
  data,
  keys,
  renderResult,
  placeholder = "Search…",
  className = "",
  threshold = 0.35,
  showResults = true,      // default behavior
  onQueryChange,
}: SearchProps<T>) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    onQueryChange?.(query);
  }, [query]);

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys,
        threshold,
        distance: 100,
      }),
    [data, keys, threshold]
  );

  const results = useMemo(() => {
    if (!query) return data;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse]);

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="relative h-8">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--gray-500))] pointer-events-none"
        />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            no-focus-yellow
            h-full pl-9 pr-3 text-sm rounded-sm
            border border-[hsl(var(--gray-300))]
            !bg-[hsl(var(--white))]
            focus:outline-none
            focus:ring-0
            focus:border-[hsl(var(--gray-300))]
          "
        />
      </div>

      {showResults && (
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-sm text-[hsl(var(--gray-500))] px-1 py-2">
              No results found.
            </div>
          ) : (
            results.map((item, i) => (
              <div key={i}>{renderResult(item)}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
