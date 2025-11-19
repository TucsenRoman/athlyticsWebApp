"use client";

import FixedCardCarousel from "@/components/cards/fixed/FixedCardCarousel";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Sport-Fail Messages                                                       */
/* -------------------------------------------------------------------------- */

const FAIL_MESSAGES = [
  "Nothing on the radar — scouts must be sleeping.",
  "Wide left. Your search didn’t score.",
  "Airball — results didn’t touch the net.",
  "No matches… film study recommended.",
  "Whiffed it. Try a cleaner search.",
  "Locked up — defense shut this one down.",
  "Benched. No results in the lineup.",
  "Ran the wrong route — nothing here.",
  "Shot clock expired — no plays found.",
  "Off the mark — adjust your aim.",
];

/* -------------------------------------------------------------------------- */
/*  Search Result Card Shell                                                  */
/* -------------------------------------------------------------------------- */

function SearchResultCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 shadow-sm">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FieldView Feed                                                            */
/* -------------------------------------------------------------------------- */

export default function FieldViewFeed({
  query,
  results,
}: {
  query: string;
  results: React.ReactNode[];
}) {
  const searching = query.trim().length > 0;

  if (searching) {
    const failMessage =
      FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];

    return (
      <div
        className="
          px-4 mt-4 pb-20 space-y-4
          overflow-y-auto
          h-full
        "
      >
        {results.length > 0 ? (
          results.map((node, i) => (
            <SearchResultCardShell key={i}>{node}</SearchResultCardShell>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-neutral-500">
            {/* Icon */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Trophy size={40} className="text-neutral-500/80" />
            </motion.div>

            {/* Message */}
            <p className="text-sm">{failMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-900">
      <FixedCardCarousel />
    </div>
  );
}
