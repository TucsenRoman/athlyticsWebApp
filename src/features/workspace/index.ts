// src/features/workspace/index.ts

/* -------------------------------------------------------------------------- */
/* VIEWS (PUBLIC WORKSPACE MODES)                                              */
/* -------------------------------------------------------------------------- */

export { default as ProjectManager } from "./views/drive/ProjectManager";
export { default as ProjectEditor } from "./views/editor/ProjectEditor";

/* -------------------------------------------------------------------------- */
/* TOOLS (TOOLBAR ADD-ONS)                                                     */
/* -------------------------------------------------------------------------- */

export { default as DriveTools } from "./views/drive/DriveTools";
export { default as EditorTools } from "./views/editor/EditorTools";

/* -------------------------------------------------------------------------- */
/* WORKSPACE CHROME                                                           */
/* -------------------------------------------------------------------------- */

export { default as WorkspaceModeOutlet } from "./components/WorkspaceModeOutlet";
export { default as WorkspaceToolbar } from "./components/WorkspaceToolbar";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type { WorkspaceMode } from "./types/workspace.types";

/* -------------------------------------------------------------------------- */
/* HOOKS                                                                      */
/* -------------------------------------------------------------------------- */

export { useWorkspaceLedger } from "./hooks/useWorkspaceLedger";
export { useWorkspacePath } from "./hooks/useWorkspacePath";
export { useWorkspaceSchedule } from "./hooks/useWorkspaceSchedule";
export { useWorkspaceAttendance } from "./hooks/useWorkspaceAttendance";
