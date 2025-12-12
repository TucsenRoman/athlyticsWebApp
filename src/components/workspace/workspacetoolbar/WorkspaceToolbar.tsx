// src/components/workspace/workspacetoolbar.tsx
"use client";

import {
  LayoutDashboard,
  Edit3,
  CalendarDays,
  Maximize,
  Minimize,
  UsersRound,
} from "lucide-react";

import React, { useState } from "react";
import { Button } from "@/components/ui/actions/button";

// VIEW IMPORTS
import { AttendanceTools } from "@/features/attendance";
import ManagerTools from "@/components/workspace/workspacetoolbar/ManagerTools";
import EditorTools from "@/components/workspace/workspacetoolbar/EditorTools";
import ScheduleTools from "@/components/workspace/workspacetoolbar/ScheduleTools";

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

  // ATTENDANCE
  attendanceDate: string;
  setAttendanceDate: (v: string) => void;
  attendanceHasSession: boolean;
  attendanceIsDirty: boolean;
  attendanceExceptionCount: number;
  onSubmitAttendance: () => void;
  onResetAttendance?: () => void;
  attendanceSaveFailed: boolean;

  // SCHEDULE
  scheduleWeekIndex?: number;
  setScheduleWeekIndex?: React.Dispatch<React.SetStateAction<number>>;
  onScheduleAdd?: () => void;    // <-- we use this now
}

/* -------------------------------------------------------------------------- */
/* MODE TAB                                                                   */
/* -------------------------------------------------------------------------- */

function ModeTab({ label, active, onClick, icon }) {
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

  scheduleWeekIndex,
  setScheduleWeekIndex,
  onScheduleAdd,       // <-- Now used correctly
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

      {/* RIGHT SECTION ---------------------------------------------------- */}
      <div className="flex items-center gap-2 h-auto md:h-8">

        {mode === "manager" && <ManagerTools />}
        {mode === "editor" && <EditorTools onSearch={handleSearch} />}

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

        {mode === "schedule" && (
          <ScheduleTools
            weekLabel={`Week ${scheduleWeekIndex}`}
            onAddEvent={onScheduleAdd}                    // <-- FIXED
            onPrevWeek={
              scheduleWeekIndex === 1
                ? undefined
                : () => setScheduleWeekIndex?.((i) => i - 1)
            }
            onNextWeek={() => setScheduleWeekIndex?.((i) => i + 1)}
            onJumpToWeekZero={() => setScheduleWeekIndex?.(1)}
          />
        )}

        {/* MAX / MIN BUTTON ---------------------------------------------- */}
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
