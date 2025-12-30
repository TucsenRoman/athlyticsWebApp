"use client";

import CardCarousel from "@/features/radar/CardCarousel";
import { SearchX } from "lucide-react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Sport-Fail Messages                                                       */
/* -------------------------------------------------------------------------- */

const FAIL_MESSAGES = [
  "No results — time for the managers to do their job.",
  "Wide left — no results matched that.",
  "Airball — nothing came up for your search.",
  "Play fizzled — zero hits on that query.",
  "Big swing, total miss — no results found.",
  "Benched — nothing matched what you typed.",
  "Ran the route — no targets open for that search.",
  "Clock hit zero — no results on the board.",
  "He shoots! He scores! Oh, nevermind — no return.",
  "Foul ball sndanifennfeinf???????????????",
  "This result has a 1/1000000000000000 chance of generating. Congratulations!", // Add a math chance to this
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
/*  RadarView Feed                                                            */
/* -------------------------------------------------------------------------- */

export default function RadarViewFeed({
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
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-[var(--text)]">
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
              <SearchX size={40} className="text-[var(--text)]" />
            </motion.div>

            {/* Message */}
            <p className="text-sm">{failMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[90%]">
      <CardCarousel />
    </div>
  );
}
