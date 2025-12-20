"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/actions/button";
import { Pencil, Trash2, Plus, ChevronDown, UserLock, Bolt, RotateCcw, RefreshCcw } from "lucide-react";
import ExpansiveMenu from "@/components/ui/navigation/expansivemenu";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Flavor =
  | "blue"
  | "purple"
  | "yellow"
  | "green"
  | "coral"
  | "slate";

interface Role {
  id: string;
  name: string;
  flavor: Flavor;
  permissions: {
    label: string;
    flavor: Flavor;
  }[];
}

interface RolePreset {
  id: string;
  label: string;
  roles: Role[];
}

interface ProgramSetupRolesProps {
  selectedPreset: string | null;
  onSelect: (presetId: string | null) => void;
  onSkip?: () => void;
  onContinue?: () => void;
}

/* -------------------------------------------------------------------------- */
/* PRESETS (MOCK DATA — UI ONLY)                                              */
/* -------------------------------------------------------------------------- */

const ROLE_PRESETS: RolePreset[] = [
  /* ====================================================================== */
  /* HIGH SCHOOL                                                            */
  /* ====================================================================== */
  {
    id: "high-school",
    label: "High School",
    roles: [
      {
        id: "head",
        name: "Head Coach",
        flavor: "blue",
        permissions: [
          { label: "Manage staff", flavor: "blue" },
          { label: "Edit schedules", flavor: "green" },
          { label: "Approve attendance", flavor: "yellow" },
          { label: "Install templates", flavor: "coral" },
          { label: "View analytics", flavor: "purple" },
        ],
      },
      {
        id: "assistant",
        name: "Assistant Coach",
        flavor: "green",
        permissions: [
          { label: "Take attendance", flavor: "green" },
          { label: "Practice notes", flavor: "blue" },
          { label: "View athletes", flavor: "slate" },
        ],
      },
      {
        id: "athlete",
        name: "Athlete",
        flavor: "purple",
        permissions: [
          { label: "View schedule", flavor: "blue" },
          { label: "View stats", flavor: "purple" },
        ],
      },
      {
        id: "parent",
        name: "Parent / Guardian",
        flavor: "slate",
        permissions: [
          { label: "View schedule", flavor: "blue" },
          { label: "View attendance", flavor: "yellow" },
          { label: "Receive announcements", flavor: "green" },
        ],
      },
    ],
  },

  /* ====================================================================== */
  /* COLLEGE                                                                */
  /* ====================================================================== */
  {
    id: "college",
    label: "College",
    roles: [
      {
        id: "director",
        name: "Program Director",
        flavor: "coral",
        permissions: [
          { label: "Admin access", flavor: "coral" },
          { label: "Budget oversight", flavor: "yellow" },
          { label: "Staff management", flavor: "blue" },
          { label: "Analytics", flavor: "purple" },
        ],
      },
      {
        id: "head-coach",
        name: "Head Coach",
        flavor: "blue",
        permissions: [
          { label: "Roster management", flavor: "blue" },
          { label: "Schedule planning", flavor: "green" },
          { label: "Performance review", flavor: "purple" },
        ],
      },
      {
        id: "assistant",
        name: "Assistant Coach",
        flavor: "green",
        permissions: [
          { label: "Practice execution", flavor: "green" },
          { label: "Attendance", flavor: "yellow" },
          { label: "Athlete notes", flavor: "blue" },
        ],
      },
      {
        id: "analyst",
        name: "Performance Analyst",
        flavor: "yellow",
        permissions: [
          { label: "View analytics", flavor: "purple" },
          { label: "Export data", flavor: "yellow" },
          { label: "Tag sessions", flavor: "green" },
        ],
      },
      {
        id: "athlete",
        name: "Athlete",
        flavor: "purple",
        permissions: [
          { label: "View training plan", flavor: "blue" },
          { label: "View stats", flavor: "purple" },
        ],
      },
    ],
  },

  /* ====================================================================== */
  /* TRAVEL / CLUB                                                          */
  /* ====================================================================== */
  {
    id: "travel",
    label: "Travel / Club",
    roles: [
      {
        id: "director",
        name: "Club Director",
        flavor: "coral",
        permissions: [
          { label: "Program administration", flavor: "coral" },
          { label: "Staff assignments", flavor: "blue" },
          { label: "Billing oversight", flavor: "yellow" },
        ],
      },
      {
        id: "coach",
        name: "Coach",
        flavor: "green",
        permissions: [
          { label: "Manage practices", flavor: "green" },
          { label: "Game schedules", flavor: "blue" },
          { label: "Attendance", flavor: "yellow" },
        ],
      },
      {
        id: "manager",
        name: "Team Manager",
        flavor: "slate",
        permissions: [
          { label: "Travel logistics", flavor: "slate" },
          { label: "Roster coordination", flavor: "blue" },
          { label: "Messaging", flavor: "green" },
        ],
      },
      {
        id: "athlete",
        name: "Athlete",
        flavor: "purple",
        permissions: [
          { label: "View schedule", flavor: "blue" },
          { label: "Announcements", flavor: "green" },
        ],
      },
    ],
  },

  /* ====================================================================== */
  /* INDEPENDENT / SOLO                                                      */
  /* ====================================================================== */
  {
    id: "independent",
    label: "Independent / Solo",
    roles: [
      {
        id: "owner",
        name: "Owner / Coach",
        flavor: "blue",
        permissions: [
          { label: "Full access", flavor: "blue" },
          { label: "Program setup", flavor: "coral" },
          { label: "Analytics", flavor: "purple" },
        ],
      },
      {
        id: "athlete",
        name: "Athlete",
        flavor: "green",
        permissions: [
          { label: "View training", flavor: "green" },
          { label: "Log results", flavor: "yellow" },
        ],
      },
    ],
  },

  /* ====================================================================== */
  /* YOUTH / REC LEAGUE                                                      */
  /* ====================================================================== */
  {
    id: "youth-rec",
    label: "Youth / Rec League",
    roles: [
      {
        id: "league-admin",
        name: "League Admin",
        flavor: "coral",
        permissions: [
          { label: "League management", flavor: "coral" },
          { label: "Coach assignments", flavor: "blue" },
        ],
      },
      {
        id: "coach",
        name: "Coach",
        flavor: "green",
        permissions: [
          { label: "Practice planning", flavor: "green" },
          { label: "Attendance", flavor: "yellow" },
        ],
      },
      {
        id: "parent",
        name: "Parent",
        flavor: "slate",
        permissions: [
          { label: "View schedule", flavor: "blue" },
          { label: "Receive updates", flavor: "green" },
        ],
      },
    ],
  },
];

// COLORS
const ROLE_BG_LT: Record<Flavor, string> = {
  blue: "bg-[var(--fvr-blue-lt)]",
  green: "bg-[var(--fvr-green-lt)]",
  purple: "bg-[var(--fvr-purple-lt)]",
  coral: "bg-[var(--fvr-coral-lt)]",
  yellow: "bg-[var(--fvr-yellow-lt)]",
  slate: "bg-[var(--fvr-slate-lt)]",
};

const ROLE_BG_MD: Record<Flavor, string> = {
  blue: "bg-[var(--fvr-blue-md)]",
  green: "bg-[var(--fvr-green-md)]",
  purple: "bg-[var(--fvr-purple-md)]",
  coral: "bg-[var(--fvr-coral-md)]",
  yellow: "bg-[var(--fvr-yellow-md)]",
  slate: "bg-[var(--fvr-slate-md)]",
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProgramSetupRoles({
  selectedPreset,
  onSelect,
}: ProgramSetupRolesProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // RESET PRESET TO ORIGINAL STATE
  const handleResetPreset = () => {
    if (!selectedPreset) return;

    const preset = ROLE_PRESETS.find(p => p.id === selectedPreset);
    if (!preset) return;

    // deep-ish clone to avoid mutating source
    setRoles(preset.roles.map(role => ({
      ...role,
      permissions: [...role.permissions],
    })));

    setExpandedRole(null);
  };

  useEffect(() => {
    if (!selectedPreset) {
      setRoles([]);
      return;
    }

    const preset = ROLE_PRESETS.find(p => p.id === selectedPreset);
    setRoles(preset ? preset.roles : []);
  }, [selectedPreset]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* PRESET SELECT */}
      <div>
        <label className="p-1 text-xs text-[var(--text)] block">
          Preset
        </label>

        <div className="flex items-center gap-2">
          {/* DROPDOWN */}
          <div className="relative flex-1">
            <select
              value={selectedPreset ?? "custom"}
              onChange={(e) =>
                onSelect(e.target.value === "custom" ? null : e.target.value)
              }
              className="
                w-full appearance-none
                bg-[var(--light)]
                border border-[var(--border)]
                rounded-md px-3 py-2
                text-sm
              "
            >
              <option value="custom">Custom (start from scratch)</option>
              {ROLE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] pointer-events-none"
            />
          </div>

          {/* RESET BUTTON */}
          <Button
            size="icon"
            variant="outline"
            disabled={!selectedPreset}
            title="Reset roles to preset defaults"
            onClick={handleResetPreset}
            className="shrink-0"
          >
            <RefreshCcw size={14} />
          </Button>

          {/* ADD ROLE */}
          <Button
            size="icon"
            variant="outline"
            disabled={!selectedPreset}
            title="Add new role"
            className="shrink-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>


      {/* ROLES */}
      <div className="flex flex-col gap-2">
        {roles.length === 0 && (
          <div className="text-sm text-[var(--text)] italic">
            No roles defined yet.
          </div>
        )}

        {roles.map(role => {
          const expanded = expandedRole === role.id;

          return (
            <div
              key={role.id}
              className={`
                relative rounded-md border border-[var(--border)]
                px-3 py-2
                ${ROLE_BG_LT[role.flavor]}
              `}
            >
              {/* LEFT ACCENT STRIP */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${ROLE_BG_MD[role.flavor]}`} />

              <div className="relative flex justify-between gap-3 gap-y-2 pl-2">
                <div className="min-w-0 flex-1">
                  {/* ROLE HEADER */}
                  <div className="flex items-center gap-2">
                    {/* <span className={`h-2.5 w-2.5 rounded-full bg-[var(--fvr-${role.flavor}-md)]`} /> */}
                    <span className="font-medium text-[var(--text-dark)]">
                      {role.name}
                    </span>
                  </div>

                  {/* PERMISSIONS */}
                  <div className="flex items-center gap-2 text-xs text-[var(--text)]">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      {(expanded ? role.permissions : role.permissions.slice(0, 3)).map(
                        (perm, i, arr) => (
                          <div key={i} className="flex items-center gap-2 shrink-0">
                            <span className="whitespace-nowrap">
                              {perm.label}
                            </span>

                            {i < arr.length - 1 && (
                              <span className="h-3 w-px bg-[var(--gray-300)] shrink-0" />
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {/* toggle — outside clipping */}
                    {role.permissions.length > 3 && (
                      <button
                        onClick={() => setExpandedRole(expanded ? null : role.id)}
                        className="text-[var(--accent)] whitespace-nowrap shrink-0"
                      >
                        {expanded ? "View less" : "View all >"}
                      </button>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="absolute right-[-10px] top-[-6px] shrink-0">
                  <ExpansiveMenu
                    variant="rainbow"
                    direction="left"
                    expand="arch"
                    spacing={34}
                    radius={42}
                    mainIcon={<Bolt className="h-4 w-4" />}
                    mainSize={28}
                    items={[
                      {
                        id: "edit",
                        label: "Edit role",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        flavor: "blue",
                        action: () => {
                          /* open edit role modal */
                        },
                      },
                      {
                        id: "permissions",
                        label: "Edit permissions",
                        icon: <UserLock className="h-3.5 w-3.5" />,
                        flavor: "purple",
                        action: () => {
                          /* permissions editor */
                        },
                      },
                      {
                        id: "delete",
                        label: "Delete role",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        flavor: "red",
                        destructive: true,
                        action: () => {
                          /* delete confirm */
                        },
                      },
                    ]}
                  />
                </div>
                {/* <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="outline">
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Trash2 size={14} />
                  </Button>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
