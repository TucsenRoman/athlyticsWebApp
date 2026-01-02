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
  Dumbbell,
} from "lucide-react";

import React, { useState } from "react";
import { Button } from "@/components/ui/actions/button";

// VIEW IMPORTS
import { AttendanceTools } from "@/features/attendance";
import { ScheduleTools } from "@/features/schedule";
import { ManagerTools, EditorTools, type WorkspaceMode } from "@/features/workspace";

import BatonTrigger from "@/components/baton/BatonTrigger";
import TabToggler from "@/components/ui/navigation/tabtoggler";

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
        ${active ? "bg-[var(--dom-bg)] text-[var(--dom-dk)]" : "text-[var(--text)]"}
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
  onScheduleAdd,
}: ToolbarProps) {

  const [query, setQuery] = useState("");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (mode === "manager") onManagerSearch?.(value);
    if (mode === "editor") onEditorSearch?.(value);
  };

  const MODE_TABS = [
    { value: "manager", label: "Manager", icon: <Settings className="h-4 w-4" /> },
    { value: "editor", label: "Editor", icon: <Edit3 className="h-4 w-4" /> },
    { value: "attendance", label: "Attendance", icon: <UsersRound className="h-4 w-4" /> },
    { value: "schedule", label: "Schedule", icon: <CalendarFold className="h-4 w-4" /> },
  ] as const;
  type WorkspaceMode = (typeof MODE_TABS)[number]["value"];

  return (
    <div className="h-10 py-1 px-3 flex flex-row gap-2 md:items-center items-start justify-between backdrop-blur bg-[var(--bg)] select-none">
      {/* <div className="flex flex-col md:flex-row gap-1 w-full min-w-0"> */}
        {/* LEFT SECTION ----------------------------------------------------- */}
        <>
          <TabToggler<WorkspaceMode>
            value={mode}
            onChange={setMode}
            items={MODE_TABS}
          />
        </>

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
        {/* </div> */}
      </div>

      {/* <BatonTrigger /> */}
      
      {/* MAX / MIN BUTTON ---------------------------------------------- */}
      <Button
        variant="stick"
        title={headerCollapsed ? "Minimize" : "Maximize"}
        onClick={() => {
          window.dispatchEvent(new CustomEvent("toggle-header"));
          setHeaderCollapsed((prev) => !prev);
        }}
      >
        {headerCollapsed ? (
          <Minimize className="h-4 w-4 text-[var(--dom-dk)]" />
        ) : (
          <Maximize className="h-4 w-4 text-[var(--text)]" />
        )}
      </Button>
    </div>
  );
}
