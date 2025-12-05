"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import CardFormatter from "@/components/cards/CardFormatter";
import { CardInfo } from "@/components/cards/CardInfo";

import {
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  BadgeHelp,
  UsersRound,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";

import { getRoster } from "@/components/attendance/getRoster";
import {
  fetchAttendance,
  markPresent,
  markException,
} from "@/components/attendance/useAttendance";

import {
  fromDbStatus,
  UiAttendanceStatus,
} from "@/components/attendance/attendanceTypes";

import { useProgramContext } from "@/hooks/useProgramContext";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function AttendanceCard() {
  const { selectedProgramId } = useProgramContext();

  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, UiAttendanceStatus>>({});

  const today = format(new Date(), "yyyy-MM-dd");

  /* ------------------------------------------------------------------------ */
  /*  LOAD DATA                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedProgramId) return;
    loadData();
  }, [selectedProgramId]);

  async function loadData() {
    setLoading(true);

    const rawRoster = await getRoster(selectedProgramId);

    const cleaned = rawRoster.filter((ath) => {
      if (!ath) return false;
      const name = String(ath.name ?? "").trim();
      if (!name) return false;
      if (name === "null" || name === "undefined") return false;
      if (name.startsWith("row_")) return false;
      return name.length >= 2;
    });

    setRoster(cleaned);

    const { data: rows } = await fetchAttendance(selectedProgramId, today);
    const map: Record<string, UiAttendanceStatus> = {};

    if (rows?.length) {
      const hasAllPresent = rows.some((r) => r.status === "all_present");

      if (!hasAllPresent) {
        for (const row of rows) {
          const ui = fromDbStatus(row.status);
          if (ui && row.athlete_key) {
            map[row.athlete_key] = ui;
          }
        }
      }
    }

    setStatusMap(map);
    setLoading(false);
  }

  /* ------------------------------------------------------------------------ */
  /*  UPDATE STATUS                                                           */
  /* ------------------------------------------------------------------------ */

  async function updateStatus(athleteKey: string, status: UiAttendanceStatus) {
    if (!selectedProgramId) return;

    setStatusMap((prev) => ({
      ...prev,
      [athleteKey]: status === "present" ? undefined : status,
    }));

    // Backend calls commented out for now
  }

  /* ------------------------------------------------------------------------ */
  /*  SUBMIT                                                                  */
  /* ------------------------------------------------------------------------ */

  async function submitFinal() {
    if (!selectedProgramId) return;
    try {
      toast.success("Attendance submitted");
    } catch (err) {
      toast.error("Submit failed");
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  PILL COMPONENT                                                          */
  /* ------------------------------------------------------------------------ */

  function Pill({ active, color, icon: Icon, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`
          h-8 w-8 rounded-full flex items-center justify-center transition
          ${
            active
              ? `bg-[var(--${color}-bg)] text-[var(--${color})]`
              : "text-[var(--text)]"
          }
        `}
      >
        <Icon size={22} strokeWidth={2} />
      </button>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  CARD INFO CALCULATIONS                                                  */
  /* ------------------------------------------------------------------------ */

  const info = useMemo(() => {
    const total = roster.length;
    const present = roster.filter((ath) => !statusMap[ath.key]).length;
    const absent = Object.values(statusMap).filter((s) => s === "absent").length;
    const tardy = Object.values(statusMap).filter((s) => s === "tardy").length;
    const other = Object.values(statusMap).filter((s) => s === "other").length;

    return {
      total,
      present,
      absent,
      tardy,
      other,
    };
  }, [roster, statusMap]);

  /* ------------------------------------------------------------------------ */
  /*  INFO KEY                                                              */
  /* ------------------------------------------------------------------------ */

  const attendanceInfoContent = (
    <div className="space-y-2 text-sm text-[var(--text-dark)]">
      <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
        <UsersRound size={14} className="text-[var(--text-dark)]" />
        <span>Total: {info.total}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeCheck size={14} className="text-[var(--fvr-green)]" />
        <span>Present: {info.present}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeX size={14} className="text-[var(--fvr-red)]" />
        <span>Absent: {info.absent}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeAlert size={14} className="text-[var(--fvr-yellow)]" />
        <span>Tardy: {info.tardy}</span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeHelp size={14} className="text-[var(--fvr-indigo)]" />
        <span>Other: {info.other}</span>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /*  RENDER                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <CardFormatter
      title="Attendance"
      icon={UsersRound}
      infoContent={attendanceInfoContent}
      actions={
        <div className="flex items-center gap-2">
          {/* <button
            onClick={submitFinal}
            className="
              flex items-center gap-2 px-3 py-1.5
              rounded-md
              bg-[var(--accent-bg)] text-[var(--text-dark)]
              hover:bg-[var(--accent-bg-hover)] transition text-sm
            "
          >
            <ThumbsUp size={18} strokeWidth={2} />
            Looks Good
          </button>
          <button>
            <RotateCcw />
          </button> */}
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--text)]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2 h-full overflow-y-auto">
          {roster.map((athlete, i) => {
            const name = athlete.name.trim();
            const status = statusMap[athlete.key] ?? "present";

            return (
              <div
                key={athlete.key}
                className={`
                  flex items-center justify-between
                  rounded-md px-3 py-2 h-12
                  ${i % 2 === 0 ? "bg-[var(--gray-50)]" : "bg-[var(--gray-200)]"}
                `}
              >
                <div className="font-medium text-[var(--text-dark)]">{name}</div>

                <div className="flex items-center gap-1 p-1 h-10 
                  border border-[var(--border-dark)] rounded-full"
                >
                  <Pill
                    active={status === "present"}
                    icon={BadgeCheck}
                    color="fvr-green"
                    onClick={() => updateStatus(athlete.key, "present")}
                  />
                  <Pill
                    active={status === "absent"}
                    icon={BadgeX}
                    color="fvr-red"
                    onClick={() => updateStatus(athlete.key, "absent")}
                  />
                  <Pill
                    active={status === "tardy"}
                    icon={BadgeAlert}
                    color="fvr-yellow"
                    onClick={() => updateStatus(athlete.key, "tardy")}
                  />
                  <Pill
                    active={status === "other"}
                    icon={BadgeHelp}
                    color="fvr-indigo"
                    onClick={() => updateStatus(athlete.key, "other")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardFormatter>
  );
}
