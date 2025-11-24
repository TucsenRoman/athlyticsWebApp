import { useState, useEffect } from "react";
import FieldViewSearchBar from "./FieldViewSearchBar";
import FieldViewFeed from "./FieldViewFeed";
import NoProgramState from "../NoProgramState";
import { useProgramContext } from "@/hooks/useProgramContext";
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
        <div key="demo1" className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
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
  /* NO PROGRAM SELECTED (SKIP IN DEMO MODE)                               */
  /* ---------------------------------------------------------------------- */
  if (!demoMode && !selectedProgramId) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-black">
        <NoProgramState />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* FIELDVIEW UI                                                           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="w-full min-h-screen bg-white dark:bg-black">
      <FieldViewSearchBar query={query} onChange={setQuery} />
      <FieldViewFeed query={query} results={results} />
    </div>
  );
}
