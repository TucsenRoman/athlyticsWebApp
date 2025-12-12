"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import {
  RotateCcw,
  Search,
  Calendar1,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudCheck,
  CloudUpload,
  Download,
  SquareMousePointer,
  FunnelX,
  FunnelPlus,
  Tags,
} from "lucide-react";

import {
  shiftAttendanceDate,
  normalizeAttendanceDate,
} from "@/features/attendance";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlays/dialog";

import AttedanceFilter from "@/features/attendance/components/AttendanceFilter"
import { Calendar } from "@/components/ui/forms/calendar";
import { format } from "date-fns";
// import Search from "@/components/navigation/Search";

/* -------------------------------------------------------------------------- */
/*  UTIL                                                                       */
/* -------------------------------------------------------------------------- */

function getLocalISODate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/* -------------------------------------------------------------------------- */
/*  PROPS                                                                      */
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
/*  COMPONENT                                                                  */
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

  function parseLocalDate(str: string) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDisplayDate(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  }

  const asDateObj = parseLocalDate(attendanceDate);

  return (
    <div className="flex items-center justify-between gap-2 w-full">

      {/* ------------------------------------------------------------ */}
      {/* LEFT — STATUS BADGE                                          */}
      {/* ------------------------------------------------------------ */}
      <div>
        {(() => {
          if (!attendanceHasSession) {
            return (
              <span
                className="
                  h-6 px-3 flex items-center
                  text-xs font-medium rounded-full
                  bg-[var(--gray-100)]
                  text-[var(--text)]
                  border border-[var(--border)]
                  shadow-sm
                "
              >
                No Session Logged
              </span>
            );
          }

          if (attendanceIsDirty) {
            return (
              <span
                className="
                  h-6 px-3 flex items-center
                  text-xs font-medium rounded-full
                  bg-[var(--fvr-yellow-bg)]
                  text-[var(--fvr-yellow)]
                  border border-[var(--border)]
                  shadow-sm
                "
              >
                Unsaved Changes • {label}
              </span>
            );
          }

          return (
            <span
              className="
                h-6 px-3 flex items-center
                text-xs font-medium rounded-full
                bg-[var(--success-bg)]
                text-[var(--success)]
                border border-[var(--border)]
                shadow-sm
              "
            >
              Logged • {label}
            </span>
          );
        })()}
      </div>

      {/* ================= EXTRA ATTENDANCE TOOLBAR BLOCK ================= */}

      <div className="
          flex items-center max-width-[200px] overflow-x-scroll
          gap-1 h-8 p-1 bg-[var(--gray-100)]
          rounded-full border border-[var(--border)]
          shadow-sm
        "
      >
        {/* TAGS */}
        <Button
            variant="ghost"
            size="icon"
            title="Tags"
            className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-purple)]
            hover:bg-[var(--fvr-purple-bg)]
            "
        >
            <Tags className="h-4 w-4" />
        </Button>

        {/* MULTISELECT */}
        <Button
            variant="ghost"
            size="icon"
            title="Multi-Select"
            className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-coral)]
            hover:bg-[var(--fvr-coral-bg)]
            "
        >
            <SquareMousePointer className="h-4 w-4" strokeWidth={2} />
        </Button>

        {/* FILTER */}
        <div className="flex items-center gap-1">

        {/* OPEN FILTER DIALOG (FunnelPlus) */}
        <Button
            variant="ghost"
            size="icon"
            title="Add Filter"
            className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-slate)]
            hover:bg-[var(--fvr-slate-bg)]
            "
            onClick={() => setFilterOpen(true)}
        >
            <FunnelPlus className="h-4 w-4" strokeWidth={2} />
        </Button>

        {/* ACTIVE FILTER PILLS */}
        <div className="flex items-center gap-1">

            {/* SAMPLE FILTER PILL */}
            {/* <div
            className="
                flex items-center gap-1
                px-3 py-1 text-xs rounded-full
                bg-[var(--gray-100)]
                text-[var(--text)]
                border border-[var(--border)]
                shadow-sm
            "
            >
            Sprinters

            <button
                title="Clear Filter"
                className="
                p-1 rounded-full
                hover:bg-[var(--gray-200)]
                text-[var(--text)]
                "
            >
                <FunnelX className="h-3 w-3" strokeWidth={2} />
            </button>
            </div> */}

            {/* Add more pills dynamically */}
            </div>
        </div>

        <div className="w-[1.5px] h-5 bg-[var(--gray-200)] rounded-full" />

        {/* CSV EXPORT */}
        <Button
            variant="ghost"
            size="icon"
            title="Export CSV"
            className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-green)]
            hover:bg-[var(--fvr-green-bg)]
            "
        >
            <Download className="h-4 w-4" strokeWidth={2} />
        </Button>
        
        {/* SAVE ALWAYS ENABLED */}
        <Button
            onClick={onSubmitAttendance}
            title="Save Attendance"
            className="
                h-7 w-7 p-0 rounded-full
                text-[var(--text)]
                hover:text-[var(--fvr-blue)]
                bg-transparent
                hover:bg-[var(--fvr-blue-bg)]
                transition-all
            "
            >
            {attendanceHasSession && !attendanceIsDirty ? (
                <CloudCheck className="h-4 w-4" />
            ) : (
                <CloudUpload className="h-4 w-4" />
            )}
        </Button>


        {/* RESET — Only when a stable session exists */}
        {attendanceHasSession && !attendanceIsDirty && (
          <>
            <div className="w-[1.5px] h-5 bg-[var(--gray-200)] rounded-full" />

            <Button
                size="icon"
                onClick={onResetAttendance}
                title="Reset Attendance"
                className="
                h-7 w-7 p-0 rounded-full
                text-[var(--text)]
                hover:text-[var(--danger)]
                bg-transparent
                hover:bg-[var(--danger-bg)]
                "
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* RIGHT — DATE NAVIGATION (new improved input UI)              */}
      {/* ------------------------------------------------------------ */}
      <div
        className="
          flex items-center
          gap-[1px] h-8 p-1
          bg-[var(--gray-100)]
          border border-[var(--border)]
          rounded-full shadow-sm
        "
      >
        {/* JUMP TO TODAY */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAttendanceDate(getLocalISODate())}
          title="Today"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--fvr-blue)]
            hover:bg-[var(--fvr-blue-bg)]
          "
        >
          <Calendar1 className="h-4 w-4" strokeWidth={2} />
        </Button>

         {/* PREV */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setAttendanceDate(shiftAttendanceDate(attendanceDate, -1))
          }
          title="Previous Day"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--accent)]
            hover:bg-[var(--accent-bg)]
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* DATE DISPLAY */}
        <span className="px-1 text-sm font-medium text-[var(--text-dark)] w-[80px] text-center">
          {formatDisplayDate(attendanceDate)}
        </span>

        {/* NEXT */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setAttendanceDate(shiftAttendanceDate(attendanceDate, 1))
          }
          title="Next Day"
          className="
            h-7 w-7 rounded-full
            text-[var(--text)]
            hover:text-[var(--accent)]
            hover:bg-[var(--accent-bg)]
          "
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* OPEN CALENDAR */}
        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Pick Date"
              className="
                h-7 w-7 rounded-full
                text-[var(--text)]
                hover:text-[var(--accent)]
                hover:bg-[var(--accent-bg)]
              "
            >
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
            </Button>
          </DialogTrigger>

          <DialogContent className="p-4">
            <DialogHeader>
              <DialogTitle>Select a Date</DialogTitle>
            </DialogHeader>

            <Calendar
              mode="single"
              selected={asDateObj}
              onSelect={(d) => {
                if (d) {
                  const iso = d.toISOString().slice(0, 10);
                  setAttendanceDate(iso);
                }
                setShowCalendar(false);
              }}
              className="rounded-md border border-[var(--border)]"
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <AttedanceFilter
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={(filters) => console.log("APPLY FILTERS:", filters)}
        onClear={() => console.log("CLEAR")}
        // groups={teamGroups}
        // positions={teamPositions}
      />
    </div>
  );
}