import { X, Search } from "lucide-react";

interface RadarViewSearchBarProps {
  query: string;
  onChange: (val: string) => void;
}

export default function GlobalSearch({
  query,
  onChange,
}: RadarViewSearchBarProps) {
  return (
    // <div className="flex items-center gap-2 px-2 w-full max-w-[200px] h-8 rounded-full border border-transparent focus-within:border-[var(--border-dk)] bg-[var(--gray-7)] text-xs text-[var(--text-dk)] shadow-inner transition-colors">
    //   <Search className="h-4 w-4" />
    //   <Input
    //     tabIndex={-1}
    //     className="p-0 pb-[2px] border-0 bg-transparent text-sm truncate"
    //     placeholder="Search programs"
    //     value={query}
    //     onChange={(e) => setQuery(e.target.value)}
    //   />
    // </div>
    <div className="relative min-h-content flex items-center gap-2 px-2 w-full md:max-w-[250px] h-8 rounded-full border border-transparent focus-within:border-[var(--border-dk)] bg-[var(--gray-7)] text-xs text-[var(--text-lt)] focus-within:text-[var(--text)] shadow-inner transition-colors">
      {/* INPUT */}
      <Search className="h-4 w-4" />
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        maxLength={30}
        placeholder="Search anything"
        className="mr-4 p-0 bg-transparent text-sm truncate"
      />

      {/* CLEAR */}
      {query.length > 0 && (
        <button
          onClick={() => onChange("")}
          className="
            absolute right-1 top-1/2 -translate-y-1/2
            p-1 rounded-full
            hover:bg-neutral-300/50
            transition
          "
        >
          <X className="w-4 h-4 text-[var(--text)]" />
        </button>
      )}
    </div>
  );
}
