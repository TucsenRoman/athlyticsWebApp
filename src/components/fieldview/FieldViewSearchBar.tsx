import { X } from "lucide-react";

interface FieldViewSearchBarProps {
  query: string;
  onChange: (val: string) => void;
}

export default function FieldViewSearchBar({
  query,
  onChange,
}: FieldViewSearchBarProps) {
  return (
    <div className="w-full px-4 pt-4 pb-2 flex justify-center md:justify-start">
      <div className="relative">
        {/* INPUT */}
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search anything..."
          className="
            w-[300px] h-12
            rounded-2xl
            px-4 pr-12
            bg-neutral-100 dark:bg-neutral-900
            text-base text-black dark:text-white
            outline-none
            transition
          "
        />

        {/* CLEAR */}
        {query.length > 0 && (
          <button
            onClick={() => onChange("")}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              p-1 rounded-full
              hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50
              transition
            "
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
    </div>
  );
}
