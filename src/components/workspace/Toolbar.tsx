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
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Search from "@/components/navigation/Search";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/* ATTENDANCE HEADER                                                          */
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
          rounded-md px-2 py-1
          bg-[var(--danger)]
          text-[var(--text-dark)]
          text-sm
        "
      />

      <Button
        variant="ghost"
        size="sm"
        className="
          text-[var(--accent)]
          hover:bg-[var(--accent-bg)]
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
            ? "bg-[var(--accent-bg)] text-[var(--accent)]"
            : "text-[var(--text)] hover:bg-[var(--gray-200)]"
        }
      `}
    >
      {icon}
      <span className="text-xs -translate-y-[1px]">{label}</span>
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

  /* ----------------------- ATTENDANCE STATE (VALID) ----------------------- */
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [attendanceHasSession, setAttendanceHasSession] = useState(false);
  const [attendanceIsDirty, setAttendanceIsDirty] = useState(false);
  const [attendanceExceptionCount, setAttendanceExceptionCount] =
    useState(0);

  function handleAttendanceSubmit() {
    // TODO connect to AttendanceView
    console.log("Submitting attendance…");

    setAttendanceIsDirty(false);
    setAttendanceHasSession(true);
  }

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
        sticky top-0 z-40 h-10 px-3
        flex items-center justify-between
        backdrop-blur bg-[var(--bg)]
        select-none
      "
    >
      {/* LEFT SECTION ----------------------------------------------------- */}
      <div className="flex items-center h-8">
        <div
          className="
            flex items-center gap-1 p-1 h-full
            bg-[var(--gray-100)]
            rounded-full
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
            icon={<UsersRound className="h-3 w-3" />}
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
        <div className="flex items-center gap-1 text-sm font-medium text-[var(--text-dark)]">
          {path.length > 0 && (
            <div className="flex items-center gap-1">
              {path.length === 1 ? (
                <span
                  className={
                    path[0] === "No Path"
                      ? "text-[var(--gray-400)] italic"
                      : "text-[var(--text-dark)]"
                  }
                >
                  {path[0]}
                </span>
              ) : (
                path.map((segment, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span>{segment}</span>
                    {i < path.length - 1 && (
                      <span className="text-[var(--gray-400)]">›</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION ---------------------------------------------------- */}
      <div className="flex items-center gap-2 h-8">
        {/* ================= MANAGER ================= */}
        {mode === "manager" && (
          <div className="flex items-center gap-1 p-1 h-full bg-[var(--gray-100)] rounded-full">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-blue)]
                  hover:bg-[var(--fvr-blue-bg)]
                "
                title="Package Hub"
              >
                <Package className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-purple)]
                  hover:bg-[var(--fvr-purple-bg)]
                "
                title="Duplicate Ledger"
              >
                <Copy className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-yellow)]
                  hover:bg-[var(--fvr-yellow-bg)]
                "
                title="Favorites"
              >
                <Star className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-red)]
                  hover:bg-[var(--fvr-red-bg)]
                "
                title="Bulk Tools"
              >
                <Brush className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-green)]
                  hover:bg-[var(--fvr-green-bg)]
                "
                title="Data Overview"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-indigo)]
                  hover:bg-[var(--fvr-indigo-bg)]
                "
                title="Athlete Map"
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================= EDITOR ================= */}
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

            <div className="flex items-center gap-1 p-1 h-full bg-[var(--gray-100)] rounded-full">
              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-yellow)]
                  hover:bg-[var(--fvr-yellow-bg)]
                "
              >
                <Star className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-blue)]
                  hover:bg-[var(--fvr-blue-bg)]
                "
              >
                <Filter className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="
                  h-7 w-7 rounded-full text-[var(--text)]
                  hover:text-[var(--fvr-purple)]
                  hover:bg-[var(--fvr-purple-bg)]
                "
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* ================= ATTENDANCE ================= */}
        {mode === "attendance" && (
          <div className="flex items-center gap-2">
            {/* SESSION BADGE */}
            {(() => {
              if (!attendanceHasSession) {
                return (
                  <span
                    className="
                      px-3 py-1 rounded-full text-xs font-medium
                      bg-[var(--gray-100)]
                      text-[var(--gray-600)]
                      border border-[var(--border)]
                    "
                  >
                    No session
                  </span>
                );
              }

              if (attendanceIsDirty) {
                return (
                  <span
                    className="
                      px-3 py-1 rounded-full text-xs font-medium
                      bg-[var(--fvr-yellow-bg)]
                      text-[var(--fvr-yellow)]
                      border border-[var(--fvr-yellow)]
                    "
                  >
                    Unsaved changes • {attendanceExceptionCount} exceptions
                  </span>
                );
              }

              return (
                <span
                  className="
                    px-3 py-1 rounded-full text-xs font-medium
                    bg-[var(--success-bg)]
                    text-[var(--success)]
                  "
                >
                  Submitted • {attendanceExceptionCount === 0
                    ? "All Present"
                    : `${attendanceExceptionCount} exceptions`}
                </span>
              );
            })()}

            {/* DATE PICKER */}
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="
                h-8 px-3 rounded-md text-sm
                bg-[var(--gray-50)]
                border border-[var(--border)]
                text-[var(--text-dark)]
              "
            />

            {/* SUBMIT ATTENDANCE BUTTON */}
            <Button
              size="sm"
              disabled={!attendanceIsDirty && attendanceHasSession}
              onClick={handleAttendanceSubmit}
              className={`
                rounded-md px-3 py-1 text-xs font-medium
                transition
                ${
                  !attendanceIsDirty && attendanceHasSession
                    ? "bg-[var(--gray-200)] text-[var(--gray-500)] cursor-default"
                    : "bg-[var(--accent)] text-white hover:bg-[color-mix(in_srgb,var(--accent)_85%,black)]"
                }
              `}
            >
              Submit Attendance
            </Button>
          </div>
        )}


        {/* ================= SCHEDULE ================= */}
        {mode === "schedule" && (
          <div className="text-xs text-[var(--text)] italic">
            Schedule Mode
          </div>
        )}

        {/* COLLAPSE / EXPAND MAIN HEADER */}
        <div className="flex items-center p-1 h-8 w-8 bg-[var(--gray-100)] rounded-full">
          <Button
            variant="ghost"
            size="icon"
            title={headerCollapsed ? "Minimize" : "Maximize"}
            className="h-7 w-7 rounded-full group"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-header"));
              setHeaderCollapsed((prev) => !prev);
            }}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {headerCollapsed ? (
                <Minimize
                  className="
                    h-4 w-4
                    text-[var(--accent)]
                    group-hover:text-[var(--text)]
                  "
                />
              ) : (
                <Maximize
                  className="
                    h-4 w-4
                    text-[var(--text)]
                    group-hover:text-[var(--accent)]
                  "
                />
              )}
            </div>
          </Button>
        </div>
      </div>    
    </div>
  );
}
