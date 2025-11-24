import { useState, useEffect, useRef } from "react";
import FieldViewSearchBar from "./FieldViewSearchBar";
import FieldViewFeed from "./FieldViewFeed";
import NoProgramState from "../NoProgramState";
import { useProgramContext } from "@/hooks/useProgramContext";

export default function FieldViewScreen() {
  const { selectedProgramId } = useProgramContext();


  const [query, setQuery] = useState("");
  const [results, setResults] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    // replace with real search soon
    const mock: React.ReactNode[] = [];
    setResults(mock);
  }, [query]);

  // NO PROGRAM SELECTED → show empty state
  if (!selectedProgramId) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-black">
        <NoProgramState />
      </div>
    );
  }

  // PROGRAM SELECTED → show FieldView UI
  return (
    <div className="w-full min-h-screen bg-white dark:bg-black">
      <FieldViewSearchBar query={query} onChange={setQuery} />
      <FieldViewFeed query={query} results={results} />
    </div>
  );
}
