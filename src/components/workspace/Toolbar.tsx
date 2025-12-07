// src/components/workspace/Toolbar.tsx
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
  Maximize,
  Minimize,
  UsersRound,
} from "lucide-react";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Search from "@/components/navigation/Search";

// VIEW IMPORTS
import AttendanceTools from "@/components/workspace/attendance/AttendanceTools";
import ManagerTools from "@/components/workspace/manager/ManagerTools";
import EditorTools from "@/components/workspace/editor/EditorTools";
import ScheduleTools from "@/components/workspace/schedule/ScheduleTools";

import {
  normalizeAttendanceDate,
  shiftAttendanceDate,
} from "@/components/attendance/AttendanceDate";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface ToolbarProps {
  mode: "manager" | "editor" | "attendance" | "schedule";
  setMode: React.Dispatch<
    React.SetStateAction<"manager" | "editor" | "attendance" | "schedule">
  >;
  path: string[];

  onManagerSearch?: (query: string) => void;
  onEditorSearch?: (query: string) => void;

  attendanceDate: string;
  setAttendanceDate: (v: string) => void;

  attendanceHasSession: boolean;
  attendanceIsDirty: boolean;
  attendanceExceptionCount: number;

  onSubmitAttendance: () => void;
  onResetAttendance?: () => void;

  attendanceSaveFailed: boolean;
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

export default function WorkspaceToolbar({
  mode,
  setMode,
  path,
  onManagerSearch,
  onEditorSearch,

  attendanceDate,
  setAttendanceDate,
  attendanceHasSession,
  attendanceIsDirty,
  attendanceExceptionCount,
  onSubmitAttendance,
  onResetAttendance,
  attendanceSaveFailed,
}: ToolbarProps) {
  const [query, setQuery] = useState("");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (mode === "manager") onManagerSearch?.(value);
    if (mode === "editor") onEditorSearch?.(value);
  };

  return (
    <div className="sticky top-0 z-40 h-20 md:h-10 py-1 px-3 flex flex-col gap-1 md:flex-row md:items-center items-start justify-between backdrop-blur bg-[var(--bg)] select-none">
      {/* LEFT SECTION ----------------------------------------------------- */}
      <div className="flex items-center h-8">
        <div className="flex items-center gap-1 p-1 h-full bg-[var(--gray-100)] rounded-full">
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
        {/* <div className="flex items-center gap-1 text-sm font-medium text-[var(--text-dark)]">
          {path.map((segment, i) => (
            <React.Fragment key={i}>
              <span>{segment}</span>
              {i < path.length - 1 && (
                <span className="text-[var(--gray-400)]">›</span>
              )}
            </React.Fragment>
          ))}
        </div> */}
      </div>

      {/* RIGHT SECTION ---------------------------------------------------- */}
      <div className="flex items-center gap-2 h-auto md:h-8">

          {mode === "manager" && (
            <ManagerTools
              onOpenPackageHub={() => {}}
              onDuplicateLedger={() => {}}
              onFavoriteLedger={() => {}}
              onBulkTools={() => {}}
              onOpenInsights={() => {}}
              onOpenMap={() => {}}
            />
          )}

          {mode === "editor" && (
            <EditorTools onSearch={handleSearch} />
          )}

          {mode === "attendance" && (
            <AttendanceTools
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attendanceHasSession={attendanceHasSession}
              attendanceIsDirty={attendanceIsDirty}
              attendanceExceptionCount={attendanceExceptionCount}
              onSubmitAttendance={onSubmitAttendance}
              onResetAttendance={onResetAttendance}
            />
          )}

          {mode === "schedule" && <ScheduleTools />}

        {/* ================= MAX/MIN BTN ================= */}
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
                <Minimize className="h-4 w-4 text-[var(--accent)] group-hover:text-[var(--text)]" />
              ) : (
                <Maximize className="h-4 w-4 text-[var(--text)] group-hover:text-[var(--accent)]" />
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
