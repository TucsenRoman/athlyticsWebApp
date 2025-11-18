import { Search } from "lucide-react";

export default function FieldViewSearchBar({
  query,
  onChange,
}: {
  query: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sticky top-0 z-40 bg-white/70 dark:bg-black/40 backdrop-blur-md border-b border-black/5 px-4 py-3">
      <div className="flex items-center gap-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-4 py-3">
        <Search className="w-5 h-5 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search athletes, meets, anything..."
          className="flex-1 bg-transparent outline-none text-base placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}
