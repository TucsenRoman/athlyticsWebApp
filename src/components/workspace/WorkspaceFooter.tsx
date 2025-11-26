"use client";

import { Settings, PlusCircle, Trash2, Route } from "lucide-react";

export default function WorkspaceFooter() {
  return (
    <div className="h-12 border-t border-[--border] bg-[--surface-1] flex items-center gap-6 px-6 text-sm">

      <button className="flex items-center gap-1 hover:text-[--brand-primary]">
        <PlusCircle className="w-4 h-4" />
        Create Ledger
      </button>

      <button className="flex items-center gap-1 hover:text-[--brand-primary]">
        <Route className="w-4 h-4" />
        Manage Routes
      </button>

      <button className="flex items-center gap-1 hover:text-[--brand-primary]">
        <Settings className="w-4 h-4" />
        Ledger Settings
      </button>

      <button className="flex items-center gap-1 text-red-500 hover:text-red-600 ml-auto">
        <Trash2 className="w-4 h-4" />
        Delete Ledger
      </button>

    </div>
  );
}
