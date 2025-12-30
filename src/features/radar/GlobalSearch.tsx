import { X } from "lucide-react";

interface RadarViewSearchBarProps {
  query: string;
  onChange: (val: string) => void;
}

export default function GlobalSearch({
  query,
  onChange,
}: RadarViewSearchBarProps) {
  return (
    <div className="relative w-full min-h-content flex justify-center md:justify-start">
      {/* INPUT */}
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search anything..."
        className="
          w-full h-10
          rounded-2xl
          px-4 pr-12
          bg-[var(--bg)]
          border border-[var(--border)]
          text-base text-[var(--text)]
          outline-none
          transition
        "
      />

      {/* CLEAR */}
      {query.length > 0 && (
        <button
          onClick={() => onChange("")}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            p-1 rounded-full
            hover:bg-neutral-300/50
            transition
          "
        >
          <X className="w-5 h-5 text-[var(--text)]" />
        </button>
      )}
    </div>
  );
}
