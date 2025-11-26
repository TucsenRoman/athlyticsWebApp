"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface PermRow {
  id: string;
  name: string;
  role: "Admin" | "Editor" | "Viewer";
  canView: boolean;
  canEdit: boolean;
}

interface WorkspaceProjectPermsProps {
  activeLedger: {
    id: string;
    name: string;
  } | null;
}

/* -------------------------------------------------------------------------- */
/* MOCK DATA                                                                  */
/* -------------------------------------------------------------------------- */

const MOCK_PERMS: PermRow[] = [
  {
    id: "u1",
    name: "Coach A",
    role: "Admin",
    canView: true,
    canEdit: true,
  },
  {
    id: "u2",
    name: "Coach B",
    role: "Editor",
    canView: true,
    canEdit: true,
  },
    {
    id: "u3",
    name: "Coach C",
    role: "Viewer",
    canView: true,
    canEdit: false,
  },
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function WorkspaceProjectPerms({
  activeLedger,
}: WorkspaceProjectPermsProps) {
  const [perms, setPerms] = useState<PermRow[]>(MOCK_PERMS);
  const [expanded, setExpanded] = useState(true);

  /* ---------------------------------------------------------------------- */
  /* HELPERS                                                                */
  /* ---------------------------------------------------------------------- */

  const toggleView = (id: string) => {
    setPerms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, canView: !p.canView } : p
      )
    );
  };

  const toggleEdit = (id: string) => {
    setPerms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, canEdit: !p.canEdit } : p
      )
    );
  };

  const roleBadge = (role: PermRow["role"]) => {
    const base =
      "px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide";

    switch (role) {
      case "Admin":
        return `${base} bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]`;
      case "Editor":
        return `${base} bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-700))]`;
      case "Viewer":
        return `${base} bg-[hsl(var(--gray-100))] text-[hsl(var(--gray-600))]`;
    }
  };

  /* ---------------------------------------------------------------------- */
  /* EMPTY / NO LEDGER                                                      */
  /* ---------------------------------------------------------------------- */

  if (!activeLedger) {
    return (
      <div className="flex-1 flex items-center justify-center opacity-40 text-sm">
        Select a ledger to manage permissions.
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* CONTENT                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-8 flex flex-col gap-8">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Permissions</div>
          <div className="text-sm opacity-50">
            Ledger: {activeLedger.name}
          </div>
        </div>

        <button
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-[hsl(var(--accent))] text-white
            hover:brightness-110 active:scale-[0.97]
            transition
          "
        >
          <UserPlus className="w-4 h-4" />
          Invite Coach
        </button>
      </div>

      {/* COLLAPSIBLE HEADER */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-1 py-1 select-none"
      >
        <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Access List
        </div>

        {expanded ? (
          <ChevronDown className="h-4 w-4 opacity-60" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-60" />
        )}
      </button>

      {/* PERMS TABLE */}
      {expanded && (
        <div className="overflow-hidden border border-[hsl(var(--gray-200))] rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--gray-50))]">
              <tr>
                <th className="p-3 text-left border-b border-[hsl(var(--gray-200))]">
                  Name
                </th>
                <th className="p-3 text-left border-b border-[hsl(var(--gray-200))]">
                  Role
                </th>
                <th className="p-3 text-center border-b border-[hsl(var(--gray-200))]">
                  View
                </th>
                <th className="p-3 text-center border-b border-[hsl(var(--gray-200))]">
                  Edit
                </th>
              </tr>
            </thead>

            <tbody>
              {perms.map((p) => (
                <tr key={p.id}>
                  {/* NAME */}
                  <td className="p-3 border-b border-[hsl(var(--gray-200))]">
                    {p.name}
                  </td>

                  {/* ROLE */}
                  <td className="p-3 border-b border-[hsl(var(--gray-200))]">
                    <span className={roleBadge(p.role)}>{p.role}</span>
                  </td>

                  {/* VIEW */}
                  <td
                    className="p-3 border-b border-[hsl(var(--gray-200))] text-center cursor-pointer"
                    onClick={() => toggleView(p.id)}
                  >
                    {p.canView ? (
                      <Eye className="h-4 w-4 opacity-60 mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 opacity-30 mx-auto" />
                    )}
                  </td>

                  {/* EDIT */}
                  <td
                    className="p-3 border-b border-[hsl(var(--gray-200))] text-center cursor-pointer"
                    onClick={() => toggleEdit(p.id)}
                  >
                    {p.canEdit ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 opacity-20 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EMPTY STATE */}
      {expanded && perms.length === 0 && (
        <div className="flex flex-col items-center justify-center h-28 opacity-40 gap-1">
          <EyeOff className="w-6 h-6" />
          <div className="text-sm">No permission records yet</div>
        </div>
      )}
    </div>
  );
}
