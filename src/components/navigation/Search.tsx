"use client";

import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/forms/input";
import { Search as SearchIcon } from "lucide-react";

interface SearchProps<T> {
  data: T[];
  keys: string[];
  renderResult: (item: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  threshold?: number;
  showResults?: boolean;
  onQueryChange?: (value: string) => void;
}

export default function Search<T>({
  data,
  keys,
  renderResult,
  placeholder = "Search…",
  className = "",
  threshold = 0.35,
  showResults = true,
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
      {/* INPUT WRAPPER */}
      <div className="relative h-8">
        <SearchIcon
          className="
            absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 
            text-[var(--text)]
            pointer-events-none
          "
        />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            no-focus-yellow
            h-full pl-9 pr-3 text-sm rounded-sm
            border border-[var(--border)]
            bg-[var(--bg)]
            text-[var(--text-dark)]
            focus:outline-none
            focus:ring-0
            focus:border-[var(--border)]
          "
        />
      </div>

      {/* RESULTS */}
      {showResults && (
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-sm text-[var(--text)] px-1 py-2">
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
