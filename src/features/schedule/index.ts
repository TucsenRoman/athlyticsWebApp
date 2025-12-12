// src/features/schedule/index.ts

// views
export { default as ScheduleWorkspaceView } from "./views/workspace/ScheduleWorkspaceView";
export { default as ScheduleFieldView } from "./views/ScheduleFieldView";

// tools
export { default as ScheduleTools } from "./views/workspace/ScheduleTools";

// components (public feature UI)
export { default as ScheduleAddSlot } from "./components/ScheduleAddSlot";
export { default as ScheduleSlotDetails } from "./components/ScheduleSlotDetails";
export { default as ScheduleEditSlot } from "./components/ScheduleEditSlot";

// services
export * from "./services/schedule.service";

// types (DB + base)
export type * from "./types/schedule.types";

// derived UI types
export type { UiCompiledWeek } from "./utils/scheduleCompiler";
