// src/features/workspace/index.ts

/* -------------------------------------------------------------------------- */
/* VIEWS (PUBLIC WORKSPACE MODES)                                              */
/* -------------------------------------------------------------------------- */

export { default as ProjectManager } from "./modes/manager/ManagerView";
export { default as ProjectEditor } from "./modes/editor/EditorView";

/* -------------------------------------------------------------------------- */
/* TOOLS (TOOLBAR ADD-ONS)                                                     */
/* -------------------------------------------------------------------------- */

export { default as ManagerTools } from "./modes/manager/outdated/ManagerTools";
export { default as EditorTools } from "./modes/editor/EditorTools";

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

export { useWorkspaceFile } from "./hooks/useWorkspaceFile";
export { useWorkspacePath } from "./hooks/useWorkspacePath";
export { useWorkspaceSchedule } from "./hooks/useWorkspaceSchedule";
export { useWorkspaceAttendance } from "./hooks/useWorkspaceAttendance";
