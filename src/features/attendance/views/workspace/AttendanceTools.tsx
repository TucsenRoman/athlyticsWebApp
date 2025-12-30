"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu";

import {
  RotateCcw,
  Calendar1,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudCheck,
  CloudUpload,
  Download,
  SquareMousePointer,
  FunnelPlus,
  Tags,
  ToolCase,
} from "lucide-react";

import {
  shiftAttendanceDate,
} from "@/features/attendance";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlays/dialog";

import AttedanceFilter from "@/features/attendance/components/AttendanceFilter";
import { Calendar } from "@/components/ui/forms/calendar";
import DateNavigator from "@/components/ui/navigation/datenavigator";

/* -------------------------------------------------------------------------- */
/*  UTIL                                                                      */
/* -------------------------------------------------------------------------- */

function getLocalISODate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseLocalDate(str: string) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

/* -------------------------------------------------------------------------- */
/*  PROPS                                                                     */
/* -------------------------------------------------------------------------- */

interface AttendanceToolsProps {
  attendanceDate: string;
  setAttendanceDate: (v: string) => void;

  attendanceHasSession: boolean;
  attendanceIsDirty: boolean;
  attendanceExceptionCount: number;

  onSubmitAttendance: () => void;
  onResetAttendance: () => void;
}

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                 */
/* -------------------------------------------------------------------------- */

export default function AttendanceTools({
  attendanceDate,
  setAttendanceDate,
  attendanceHasSession,
  attendanceIsDirty,
  attendanceExceptionCount,
  onSubmitAttendance,
  onResetAttendance,
}: AttendanceToolsProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const label =
    attendanceExceptionCount === 0
      ? "All Present"
      : `${attendanceExceptionCount} exceptions`;

  const asDateObj = parseLocalDate(attendanceDate);

  /* ---------------------------------------------------------------------- */
  /*  EXPANSIVE MENU ITEMS                                                   */
  /* ---------------------------------------------------------------------- */

  const toolItems: ExpansiveMenuItem[] = [
    {
      label: "Tags",
      icon: <Tags className="h-4 w-4" />,
      flavor: "purple",
    },
    {
      label: "Multi-Select",
      icon: <SquareMousePointer className="h-4 w-4" />,
      flavor: "coral",
    },
    {
      label: "Add Filter",
      icon: <FunnelPlus className="h-4 w-4" />,
      action: () => setFilterOpen(true),
      flavor: "slate",
    },
    {
      label: "Export CSV",
      icon: <Download className="h-4 w-4" />,
      flavor: "green",
    },
    {
      label: attendanceHasSession && !attendanceIsDirty
        ? "Attendance Saved"
        : "Save Attendance",
      icon:
        attendanceHasSession && !attendanceIsDirty ? (
          <CloudCheck className="h-4 w-4" />
        ) : (
          <CloudUpload className="h-4 w-4" />
        ),
      action: onSubmitAttendance,
      flavor: "blue",
    },
  ];

  if (attendanceHasSession && !attendanceIsDirty) {
    toolItems.push({
      label: "Reset Attendance",
      icon: <RotateCcw className="h-4 w-4" />,
      action: onResetAttendance,
      flavor: "red",
      destructive: true,
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      {/* STATUS BADGE */}
      {/* <div>
        {!attendanceHasSession ? (
          <span className="h-6 px-3 flex items-center text-xs font-medium rounded-full bg-[var(--gray-lttt border shadow-sm">
            No Session Logged
          </span>
        ) : attendanceIsDirty ? (
          <span className="h-6 px-3 flex items-center text-xs font-medium rounded-full bg-[var(--fvr-yellow-bg)] text-[var(--fvr-yellow)] border shadow-sm">
            Unsaved Changes • {label}
          </span>
        ) : (
          <span className="h-6 px-3 flex items-center text-xs font-medium rounded-full bg-[var(--success-bg)] text-[var(--success)] border shadow-sm">
            Logged • {label}
          </span>
        )}
      </div> */}

      {/* EXPANSIVE TOOL MENU */}
      <ExpansiveMenu
        items={toolItems}
        expand="line"
        direction="left"
        spacing={36}
        variant="rainbow"
        mainIcon={<ToolCase />}
        mainRotate={-20}
        mainSize={42}
        defaultState="open"
        mobile={{
          direction: "right",
          mainRotate: 20,
        }}
      />

      <DateNavigator
        value={attendanceDate}
        onChange={setAttendanceDate}
        onToday={() => setAttendanceDate(getLocalISODate())}
        onPrev={() =>
          setAttendanceDate(shiftAttendanceDate(attendanceDate, -1))
        }
        onNext={() =>
          setAttendanceDate(shiftAttendanceDate(attendanceDate, 1))
        }
      />


      <AttedanceFilter
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={(filters) => console.log("APPLY FILTERS:", filters)}
        onClear={() => console.log("CLEAR")}
      />
    </div>
  );
}
