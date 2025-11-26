"use client";

import { Pencil, Save, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function WorkspaceMenu() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="h-14 border-b border-[--border] bg-[--surface-1] flex items-center justify-between px-6">
      
      {/* LEFT SIDE: Ledger Name */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Roster</h1>

        <button
          onClick={() => setEditMode(!editMode)}
          className="text-sm text-[--text-muted] hover:text-[--text-strong] flex items-center gap-1"
        >
          <Pencil className="w-4 h-4" />
          {editMode ? "Editing…" : "Edit"}
        </button>
      </div>

      {/* RIGHT SIDE: Save + Routes */}
      <div className="flex items-center gap-2">

        {/* Route selector */}
        <button className="px-3 py-1 text-sm bg-[--surface-2] rounded-md flex items-center gap-1">
          Default Route
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>

        {/* Save (only in edit mode) */}
        {editMode && (
          <button className="px-3 py-1 rounded-md bg-[--brand-primary] text-white flex items-center gap-1">
            <Save className="w-4 h-4" />
            Save
          </button>
        )}

      </div>

    </div>
  );
}
