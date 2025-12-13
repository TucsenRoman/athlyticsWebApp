"use client";

import { Button } from "@/components/ui/actions/button";
import { Star, Filter, Layers } from "lucide-react";
import Search from "@/components/navigation/Search";

interface EditorToolsProps {
  onSearch: (value: string) => void;
  onFavorite?: () => void;
  onFilter?: () => void;
  onLayers?: () => void;
}

export default function EditorTools({
  onSearch,
  onFavorite,
  onFilter,
  onLayers,
}: EditorToolsProps) {
  return (
    <div className="flex items-center justify-between gap-6 w-full">

      {/* LEFT — SEARCH */}
      <div>
        <Search
          data={[]}
          keys={[]}
          renderResult={() => null}
          showResults={false}
          placeholder="Search fields…"
          onQueryChange={onSearch}
          className="w-[150px]"
        />
      </div>

      {/* RIGHT — ICON BUTTONS */}
      <div className="flex items-center gap-1">

        {/* FAVORITE */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFavorite}
          title="Favorite"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-yellow)]
            hover:bg-[var(--fvr-yellow-bg)]
          "
        >
          <Star className="h-4 w-4" />
        </Button>

        {/* FILTER */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFilter}
          title="Filters"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <Filter className="h-4 w-4" />
        </Button>

        {/* LAYERS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLayers}
          title="Layer Controls"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-purple)]
            hover:bg-[var(--fvr-purple-bg)]
          "
        >
          <Layers className="h-4 w-4" />
        </Button>

      </div>
    </div>
  );
}
