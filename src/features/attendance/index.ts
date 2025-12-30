// src/features/attendance/index.ts

// ============================================================================
// Attendance — Public Feature API
// ============================================================================

// ---------------------------------------------------------------------------
// Views (page-level / route-level)
// ---------------------------------------------------------------------------
export { default as AttendanceRadarView } from "./views/AttendanceRadarView";
export { default as AttendanceWorkspaceView } from "./views/workspace/AttendanceWorkspaceView";

// ---------------------------------------------------------------------------
// Components (shared UI across attendance views)
// ---------------------------------------------------------------------------
export { default as AttendanceCover } from "./components/AttendanceCover";
export { default as StatusSelector } from "./components/StatusSelector";

// ---------------------------------------------------------------------------
// Workspace-only view components (INTENTIONAL / INTERNAL)
// ---------------------------------------------------------------------------
// These are exported ONLY for AttendanceWorkspaceView composition.
// Other features should not import these directly.

export { default as AttendanceTools } from "./views/workspace/AttendanceTools";

export {
  default as AttendanceRosterList,
} from "./views/workspace/AttendanceRosterList";

export {
  default as AttendanceRosterRow,
} from "./views/workspace/AttendanceRosterRow";

export {
  default as AttendanceStatusBanner,
} from "./views/workspace/AttendanceStatusBanner";

// ---------------------------------------------------------------------------
// Services (business logic / data access)
// ---------------------------------------------------------------------------
export {
  fetchAttendance,
  markPresent,
  markException,
  updateNote,
  markAllPresent,
  deleteAllPresent,
  buildAttendanceMaps,
  AttendanceService,
} from "./services/attendance.service";

export { fetchRoster } from "./services/roster.service";

// ---------------------------------------------------------------------------
// Types & Utilities
// ---------------------------------------------------------------------------
export type { UiAttendanceStatus } from "./types/attendance.types";
export * from "./types/attendance.dates";
