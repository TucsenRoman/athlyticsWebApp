import { useState, useEffect } from "react";
import GlobalSearch from "@/features/radar/GlobalSearch";
import RadarFeed from "@/features/radar/RadarFeed";
import { useProgramContext } from "@/features/program-cloak/useProgramContext";
import { useDemo } from "@/contexts/DemoContext";
import RadarToolbar from "@/features/radar/RadarToolbar";

export default function RadarViewScreen() {
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
  /* RADARVIEW UI                                                           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-2 py-3 h-full min-h-0 overflow-hidden">
      {/* <RadarToolbar
        query={query}
        onQueryChange={setQuery}
      /> */}
      <RadarFeed query={query} results={results} />
    </div>
  );
}
