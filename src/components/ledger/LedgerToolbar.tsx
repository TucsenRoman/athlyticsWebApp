"use client";

import {
  LayoutDashboard,
  Edit3,
  Star,
  Filter,
  Layers,
  Package,
  Copy,
  Brush,
  BarChart3,
  Map,
  CalendarDays,
  ListChecks,
  Maximize,
  Minimize,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Search from "@/components/navigation/Search";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/* ATTENDANCE HEADER (INLINE)                                                 */
/* -------------------------------------------------------------------------- */

function AttendanceHeader({
  date,
  setDate,
  onAllPresent,
}: {
  date: string;
  setDate: (d: string) => void;
  onAllPresent: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="
          border border-[hsl(var(--gray-300))]
          rounded-md px-2 py-1
          bg-[hsl(var(--gray-50))]
          text-sm
        "
      />

      <Button
        variant="ghost"
        size="sm"
        className="
          text-[hsl(var(--accent))]
          hover:bg-[hsl(var(--accent))]/10
          rounded-md px-2 py-1 text-xs
        "
        onClick={onAllPresent}
      >
        Mark All Present
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ToolbarProps {
  mode: "manager" | "editor" | "attendance" | "schedule";
  setMode: React.Dispatch<
    React.SetStateAction<"manager" | "editor" | "attendance" | "schedule">
  >;
  path: string[];

  onManagerSearch?: (query: string) => void;
  onEditorSearch?: (query: string) => void;
}

/* -------------------------------------------------------------------------- */
/* MODE TAB                                                                   */
/* -------------------------------------------------------------------------- */

function ModeTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition
        ${
          active
            ? "bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
            : "text-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-200))]"
        }
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* TOOLBAR                                                                    */
/* -------------------------------------------------------------------------- */

export default function LedgerToolbar({
  mode,
  setMode,
  path,
  onManagerSearch,
  onEditorSearch,
}: ToolbarProps) {
  const [query, setQuery] = useState("");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Attendance date state **added**
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /* ------------------------------------------------------------------------ */
  /* CONTEXT-AWARE SEARCH                                                     */
  /* ------------------------------------------------------------------------ */

  const handleSearch = (value: string) => {
    setQuery(value);
    if (mode === "manager") onManagerSearch?.(value);
    if (mode === "editor") onEditorSearch?.(value);
  };

  return (
    <div
      className="
        sticky top-0 z-40 h-10 px-2
        flex items-center justify-between
        backdrop-blur bg-white/80
        border-b border-border/60 shadow-sm
        select-none
      "
    >
      {/* LEFT SECTION ----------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <div
          className="
            flex items-center gap-1 px-1 py-[3px]
            dark:bg-[hsl(var(--gray-800))] rounded-full
          "
        >
          <ModeTab
            label="Manager"
            active={mode === "manager"}
            onClick={() => setMode("manager")}
            icon={<LayoutDashboard className="h-3 w-3" />}
          />

          <ModeTab
            label="Editor"
            active={mode === "editor"}
            onClick={() => setMode("editor")}
            icon={<Edit3 className="h-3 w-3" />}
          />

          <ModeTab
            label="Attendance"
            active={mode === "attendance"}
            onClick={() => setMode("attendance")}
            icon={<ListChecks className="h-3 w-3" />}
          />

          <ModeTab
            label="Schedule"
            active={mode === "schedule"}
            onClick={() => setMode("schedule")}
            icon={<CalendarDays className="h-3 w-3" />}
          />
        </div>
      </div>

      {/* CENTER SECTION — BREADCRUMB ------------------------------------- */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
          <div className="flex-1 flex items-center justify-center">
            {path.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                {path.length === 1 ? (
                  <span
                    className={
                      path[0] === "No Path"
                        ? "text-gray-400 italic"
                        : "text-gray-700"
                    }
                  >
                    {path[0]}
                  </span>
                ) : (
                  path.map((segment, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span>{segment}</span>
                      {i < path.length - 1 && (
                        <span className="text-gray-400">›</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION ---------------------------------------------------- */}
      <div className="flex items-center gap-2">

        {/* ------------------------ MANAGER VIEW ------------------------ */}
        {mode === "manager" && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-100/30"
              title="Package Hub"
            >
              <Package className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-100/30"
              title="Duplicate Ledger"
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/20"
              title="Favorites"
            >
              <Star className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-500/20"
              title="Bulk Tools"
            >
              <Brush className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-500/20"
              title="Data Overview"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-500/20"
              title="Athlete Map"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ------------------------ EDITOR VIEW ------------------------ */}
        {mode === "editor" && (
          <>
            <Search
              data={[]}
              keys={[]}
              renderResult={() => null}
              showResults={false}
              placeholder="Search ledger…"
              onQueryChange={onEditorSearch}
              className="w-[150px]"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10"
            >
              <Star className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-[hsl(var(--primary))] hover:bg-primary/20"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-600 hover:text-[hsl(var(--primary))] hover:bg-primary/20"
            >
              <Layers className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* ------------------------ ATTENDANCE VIEW ------------------------ */}
        {mode === "attendance" && (
          <AttendanceHeader
            date={attendanceDate}
            setDate={setAttendanceDate}
            onAllPresent={() => console.log("Mark all present")}
          />
        )}

        {/* ------------------------ SCHEDULE VIEW ------------------------ */}
        {mode === "schedule" && (
          <div className="text-xs text-[hsl(var(--gray-500))] italic">
            Schedule Mode
          </div>
        )}

      </div>

      {/* COLLAPSE / EXPAND MAIN HEADER */}
      <Button
        variant="ghost"
        size="icon"
        title={headerCollapsed ? "Minimize" : "Maximize"}
        className="h-8 w-8 rounded-full text-[hsl(var(--gray-600))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("toggle-header"));
          setHeaderCollapsed((prev) => !prev);
        }}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {headerCollapsed ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </div>
      </Button>
    </div>
  );
}
