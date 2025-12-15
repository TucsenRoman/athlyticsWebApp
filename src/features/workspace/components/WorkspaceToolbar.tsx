// src/components/workspace/workspacetoolbar.tsx
"use client";

import {
  Edit3,
  CalendarDays,
  Maximize,
  Minimize,
  UsersRound,
  Settings,
  CalendarCog,
  CalendarFold,
} from "lucide-react";

import React, { useState } from "react";
import { Button } from "@/components/ui/actions/button";

// VIEW IMPORTS
import { AttendanceTools } from "@/features/attendance";
import { ScheduleTools } from "@/features/schedule";
import { ManagerTools, EditorTools, type WorkspaceMode } from "@/features/workspace";

import AIAssistantTrigger from "@/components/aiassistant/AIAsisstantTrigger"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface ToolbarProps {
  mode: WorkspaceMode;
  setMode: React.Dispatch<React.SetStateAction<WorkspaceMode>>;
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
  onScheduleAdd?: () => void;
}

/* -------------------------------------------------------------------------- */
/* MODE TAB                                                                   */
/* -------------------------------------------------------------------------- */

interface ModeTabProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function ModeTab({
  label,
  icon,
  active,
  onClick,
}: ModeTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 h-6 px-2 rounded-full transition
        ${active ? "bg-[var(--accent-bg)] text-[var(--accent)]" : "text-[var(--text)]"}
      `}
    >
      {/* ICON */}
      <span className="flex items-center justify-center">
        <span className="block md:hidden scale-125">{icon}</span>
        <span className="hidden md:block scale-100">{icon}</span>
      </span>

      {/* LABEL */}
      <span
        className={`
          text-xs font-medium
          ${active ? "inline md:inline" : "hidden md:inline"}
        `}
      >
        {label}
      </span>
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
    // ~Keep sticky??
    <div className="sticky top-0 z-40 h-20 md:h-10 py-1 px-3 flex flex-row gap-2 md:items-center items-start justify-between backdrop-blur bg-[var(--bg)] select-none">
      <div className="flex flex-col md:flex-row justify-between gap-1 w-full">
        {/* LEFT SECTION ----------------------------------------------------- */}
        <div className="flex items-center h-8">
          <div className="flex items-center gap-1 p-1 h-full bg-[var(--gray-100)] rounded-full">
            <ModeTab
              label="Manager"
              active={mode === "manager"}
              onClick={() => setMode("manager")}
              icon={<Settings className="h-3 w-3" />}
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
              icon={<CalendarFold className="h-3 w-3" />}
            />
          </div>
        </div>

        {/* RIGHT SECTION ---------------------------------------------------- */}
        <div className="h-auto md:h-8">
          {mode === "manager" && <ManagerTools />}
          {mode === "editor" && 
            <EditorTools
              onFind={() => {
                alert("Use Ctrl + F. Its better lol");
              }}
              onSearch={handleSearch}
            />
          }
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
              onAddEvent={onScheduleAdd}
              onOpenFilter={() => {
                console.log("open schedule filters");
              }}
              onOpenTemplateMenu={() => {
                console.log("open schedule templates");
              }}
              onPrint={() => {
                console.log("print schedule");
              }}
              onExport={() => {
                console.log("export schedule");
              }}
            />
          )}
        </div>
      </div>

      <AIAssistantTrigger />
      
      {/* MAX / MIN BUTTON ---------------------------------------------- */}
      <div className="flex justify-center items-center p-1 h-8 w-8 bg-[var(--gray-100)] rounded-full">
        <Button
          variant="none"
          // size="icon"
          title={headerCollapsed ? "Minimize" : "Maximize"}
          className="rounded-full"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("toggle-header"));
            setHeaderCollapsed((prev) => !prev);
          }}
        >
          {headerCollapsed ? (
            <Minimize className="h-5 w-5 text-[var(--accent)] group-hover:text-[var(--text)]" />
          ) : (
            <Maximize className="h-5 w-5 text-[var(--text)] group-hover:text-[var(--accent)]" />
          )}
        </Button>
      </div>
    </div>
  );
}
