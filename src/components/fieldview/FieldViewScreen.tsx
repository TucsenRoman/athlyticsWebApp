import { useState, useEffect } from "react";
import FieldViewSearchBar from "./FieldViewSearchBar";
import FieldViewFeed from "./FieldViewFeed";

export default function FieldViewScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<React.ReactNode[]>([]);

  // TODO: Replace with real search engine once routes + ledgers tie in
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    // fake search for now — plug your logic in later
    const lower = query.toLowerCase();
    const mock = [];

    // example: if (athlete matches) push <AthleteSearchCard athlete={a} />
    // example: if (meet matches) push <MeetSearchCard meet={m} />

    setResults(mock);
  }, [query]);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black">
      <FieldViewSearchBar query={query} onChange={setQuery} />
      <FieldViewFeed query={query} results={results} />
    </div>
  );
}
