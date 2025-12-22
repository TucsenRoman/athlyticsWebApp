import { useState, useEffect } from "react";
import FieldSearchBar from "@/components/field/FieldSearchBar";
import FieldFeed from "@/components/field/FieldFeed";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";

export default function FieldViewScreen() {
  const { selectedProgramId } = useProgramContext();
  const { demoMode } = useDemo();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<React.ReactNode[]>([]);

  /* ---------------------------------------------------------------------- */
  /* SEARCH LOGIC (REAL OR DEMO)                                            */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    // --- DEMO MODE SEARCH ---
    if (demoMode) {
      const demo = [
        <div key="demo1" className="p-4 bg-[var(--danger-bg)]">
          Demo search result for: <b>{query}</b>
        </div>,
      ];
      setResults(demo);
      return;
    }

    // --- REAL SEARCH (replace later) ---
    setResults([]);
  }, [query, demoMode]);

  /* ---------------------------------------------------------------------- */
  /* FIELDVIEW UI                                                           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col justify-between gap-2 w-full h-[82vh] md:h-[92vh] overflow-clip py-4 bg-[var(--bg)]">
      <FieldSearchBar query={query} onChange={setQuery} />
      <FieldFeed query={query} results={results} />
    </div>
  );
}
