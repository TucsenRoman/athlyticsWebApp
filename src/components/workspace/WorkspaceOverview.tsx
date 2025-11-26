"use client";

import { BarChart3, Users, Flag, GitBranch, Clock } from "lucide-react";

interface OverviewProps {
  activeLedger: any | null;
}

/*  
|--------------------------------------------------------------------------
| WORKSPACE OVERVIEW
| Shown when no ledger is selected OR when Overview tab is explicitly chosen.
|--------------------------------------------------------------------------
*/

export default function WorkspaceOverview({ activeLedger }: OverviewProps) {
  // If a ledger is selected, we show that ledger’s summary.
  // If not, we show a “select something” message.
  const showEmpty = !activeLedger;

  return (
    <div className="p-10 h-full overflow-auto bg-white">

      {/* ------------------------------------------------------------------ */}
      {/* EMPTY STATE                                                        */}
      {/* ------------------------------------------------------------------ */}
      {showEmpty && (
        <div className="flex flex-col items-center justify-center h-full opacity-50">
          <BarChart3 className="h-10 w-10 mb-3" />
          <p className="text-lg font-medium">Select a ledger from the sidebar</p>
          <p className="text-sm mt-1">Your workspace overview will load here.</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* LEDGER OVERVIEW                                                    */}
      {/* ------------------------------------------------------------------ */}
      {!showEmpty && (
        <div className="flex flex-col gap-12">

          {/* TITLE + META */}
          <section>
            <h1 className="text-2xl font-semibold mb-1">
              {activeLedger.name}
            </h1>

            <div className="text-sm text-[hsl(var(--gray-600))] flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 opacity-50" />
                {activeLedger.meta?.athletes ?? "—"} athletes
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 opacity-50" />
                {activeLedger.meta?.entries ?? "—"} entries
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 opacity-50" />
                Updated {activeLedger.meta?.updated ?? "—"}
              </span>
            </div>
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* STAT CARDS (Routes / Headers / Entries / Fields)                  */}
          {/* ------------------------------------------------------------------ */}
          <section className="grid grid-cols-4 gap-6">
            {[
              { label: "Routes", value: activeLedger.meta?.routes },
              { label: "Headers", value: activeLedger.meta?.headers },
              { label: "Entries", value: activeLedger.meta?.entries },
              { label: "Fields", value: activeLedger.meta?.fields },
            ].map((stat, i) => (
              <div
                key={i}
                className="
                  bg-[hsl(var(--gray-50))]
                  border border-[hsl(var(--gray-200))]
                  rounded-xl p-5 shadow-sm
                "
              >
                <div className="text-xs uppercase tracking-wide text-[hsl(var(--gray-600))] mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl font-semibold">
                  {stat.value ?? "—"}
                </div>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* ACTIVITY FEED                                                     */}
          {/* ------------------------------------------------------------------ */}
          <section className="flex flex-col gap-3">
            <div className="text-xs uppercase tracking-wide text-[hsl(var(--gray-600))]">
              Recent Activity
            </div>

            {(activeLedger.activity ?? []).length === 0 && (
              <div className="opacity-40 text-sm">No recent actions.</div>
            )}

            {activeLedger.activity?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="
                  bg-[hsl(var(--gray-50))]
                  border border-[hsl(var(--gray-200))]
                  rounded-xl p-4 shadow-sm
                "
              >
                <div className="font-medium">{item.user}</div>
                <div className="text-sm opacity-70">{item.action}</div>
                <div className="text-xs opacity-40 mt-1">{item.time}</div>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* ROUTE SUMMARY                                                     */}
          {/* ------------------------------------------------------------------ */}
          {activeLedger.routes && activeLedger.routes.length > 0 && (
            <section className="flex flex-col gap-3 mt-6">
              <div className="text-xs uppercase tracking-wide text-[hsl(var(--gray-600))]">
                Route Sets
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeLedger.routes.map((route: any, idx: number) => (
                  <div
                    key={idx}
                    className="
                      bg-[hsl(var(--gray-50))]
                      border border-[hsl(var(--gray-200))]
                      rounded-xl p-4 shadow-sm
                      flex items-center justify-between
                    "
                  >
                    <div>
                      <div className="font-medium">{route.name}</div>
                      <div className="text-xs opacity-50">Updated {route.updated}</div>
                    </div>

                    <GitBranch className="w-5 h-5 opacity-60" />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
