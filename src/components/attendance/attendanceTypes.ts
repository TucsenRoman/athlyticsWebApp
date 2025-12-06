// src/components/workspace/attendance/attendanceTypes.ts

/* -------------------------------------------------------------
   UI-facing options in the dropdown
   (What the user can select for an athlete)
------------------------------------------------------------- */
export type UiAttendanceStatus =
  | "present"   // not stored in DB → means delete exception row
  | "absent"
  | "tardy"
  // | "excused"
  | "other";

/* -------------------------------------------------------------
   DB-facing status values
   (What the attendance table actually stores)
------------------------------------------------------------- */
export type DbAttendanceStatus =
  | "absent"
  | "tardy"
  // | "excused"
  | "other"
  | "all_present";

/* -------------------------------------------------------------
   Convert DB → UI status
   (All DB values valid except all_present)
------------------------------------------------------------- */
export function fromDbStatus(db: string): UiAttendanceStatus | null {
  switch (db) {
    case "absent":
    case "tardy":
    case "other":
      return db;

    case "all_present":
      return null; // session marker → NOT a per-athlete status

    default:
      return null;
  }
}
