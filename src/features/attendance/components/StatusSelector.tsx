"use client";

import {
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  BadgeHelp,
  MessageCircleMore,
  MessageCirclePlus,
} from "lucide-react";

import { useState } from "react";
import type { UiAttendanceStatus } from "@/features/attendance";

/* -------------------------------------------------------------------------- */
/*  STATIC COLOR CLASSES                                                      */
/* -------------------------------------------------------------------------- */

const colorClasses: Record<UiAttendanceStatus, string> = {
  present: "text-[var(--fvr-green)]",
  absent: "text-[var(--fvr-red)]",
  tardy: "text-[var(--fvr-yellow)]",
  other: "text-[var(--fvr-slate)]",
};

const __TAILWIND_SAFELIST__ = (
  <div className="hidden">
    text-[var(--fvr-green)] text-[var(--fvr-red)] text-[var(--fvr-yellow)] text-[var(--fvr-slate)]
  </div>
);

/* -------------------------------------------------------------------------- */
/*  ICON PILL (unchanged from your UI/UX)                                      */
/* -------------------------------------------------------------------------- */

function Pill({
  status,
  active,
  hasNote,
  icon: Icon,
  onNoteClick,
}: {
  status: UiAttendanceStatus;
  active: boolean;
  hasNote: boolean;
  icon: any;
  onNoteClick: () => void;
}) {
  const isNonPresent = status !== "present";

  return (
    <div className="relative flex items-center">
      <button
        onClick={(e) => {
          // Only open note when icon clicked AND pill is active AND status non-present
          if (active && isNonPresent) {
            e.stopPropagation();
            onNoteClick();
          }
        }}
        className={`
          flex items-center justify-center
          rounded-full transition
          w-8 h-8 md:w-8 md:h-8
          ${active ? colorClasses[status] : "text-[var(--text)]"}
        `}
      >
        <Icon size={24} className="md:hidden" strokeWidth={2} />
        <Icon size={22} className="hidden md:block" strokeWidth={2} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MAIN SELECTOR WITH TOP-RIGHT OVERLAY                                      */
/* -------------------------------------------------------------------------- */

export default function StatusSelector({
  value,
  hasNote,
  noteValue,
  onChange,
  onNoteSave,
}: {
  value: UiAttendanceStatus;
  hasNote: boolean;
  noteValue: string;
  onChange: (v: UiAttendanceStatus) => void;
  onNoteSave: (note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(noteValue);

  const openNote = () => {
    setNoteText(noteValue);
    setNoteOpen(true);
  };

  const saveNote = () => {
    onNoteSave(noteText.trim());
    setNoteOpen(false);
  };

  const showOverlay = value !== "present";
  const OverlayIcon = hasNote ? MessageCircleMore : MessageCirclePlus;

  return (
    <>
      {/* ENTIRE STATUS GROUP WRAPPED SO OVERLAY CAN SIT TOP-RIGHT */}
      <div className="relative flex items-center gap-2 md:gap-5">
        {/* TOP-RIGHT OVERLAY */}
        {showOverlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openNote();
            }}
            className="
              absolute -top-2 -right-2
              w-6 h-6
              flex items-center justify-center
              cursor-pointer
            "
          >
            <OverlayIcon
              size={18}
              stroke="var(--gray-md2)"
              fill="var(--gray-lt)"
            />
          </button>
        )}

        {/* YOUR ORIGINAL STATUS PILL GROUP */}
        <div
          className="
            flex items-center h-10 gap-2 md:gap-5
            px-2 md:px-4
            border border-[var(--border2)]
            rounded-full
          "
        >
          {/* PRESENT */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onChange("present")}
          >
            <Pill
              status="present"
              active={value === "present"}
              hasNote={hasNote}
              icon={BadgeCheck}
              onNoteClick={openNote}
            />
            <span
              className={`
                hidden md:block text-sm font-medium ml-1
                ${value === "present" ? "text-[var(--text-dark)]" : "text-[var(--text)]"}
              `}
            >
              Present
            </span>
          </div>

          {/* ABSENT */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onChange("absent")}
          >
            <Pill
              status="absent"
              active={value === "absent"}
              hasNote={hasNote}
              icon={BadgeX}
              onNoteClick={openNote}
            />
            <span
              className={`
                hidden md:block text-sm font-medium ml-1
                ${value === "absent" ? "text-[var(--text-dark)]" : "text-[var(--text)]"}
              `}
            >
              Absent
            </span>
          </div>

          {/* TARDY */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onChange("tardy")}
          >
            <Pill
              status="tardy"
              active={value === "tardy"}
              hasNote={hasNote}
              icon={BadgeAlert}
              onNoteClick={openNote}
            />
            <span
              className={`
                hidden md:block text-sm font-medium ml-1
                ${value === "tardy" ? "text-[var(--text-dark)]" : "text-[var(--text)]"}
              `}
            >
              Tardy
            </span>
          </div>

          {/* OTHER */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onChange("other")}
          >
            <Pill
              status="other"
              active={value === "other"}
              hasNote={hasNote}
              icon={BadgeHelp}
              onNoteClick={openNote}
            />
            <span
              className={`
                hidden md:block text-sm font-medium ml-1
                ${value === "other" ? "text-[var(--text-dark)]" : "text-[var(--text)]"}
              `}
            >
              Other
            </span>
          </div>
        </div>
      </div>


      {/* NOTE MODAL */}
      {noteOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setNoteOpen(false)}
        >
          <div
            className="
              bg-[var(--bg)] rounded-xl p-6 w-[90%] max-w-md shadow-lg
              border border-[var(--border-dark)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-3">
              Note for <span>{value}</span>
            </h2>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="
                w-full h-28 p-3 rounded-lg border border-[var(--border)]
                bg-[var(--gray-lt)] resize-none
              "
              placeholder="Write note..."
            />

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setNoteOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)]"
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                className="
                  px-4 py-2 rounded-lg text-[var(--text-white)]
                  bg-[var(--accent)] hover:bg-[var(--accent-dark)]
                "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
