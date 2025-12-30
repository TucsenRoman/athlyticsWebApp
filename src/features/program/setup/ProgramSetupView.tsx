"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";

import ProgramSetupBasics, {
  ProgramBasicsData,
} from "./ProgramSetupBasics";
import ProgramSetupRoles from "./ProgramSetupRoles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type SetupTab =
  | "basic"
  | "roles"
  | "season"
  | "templates"
  | "settings";

export interface ProgramSetupViewProps {
  mode: "add" | "edit";
  open: boolean;
  program: any | null;
  onClose: () => void;
  onSubmit: (
    data: ProgramBasicsData & { rolePreset?: string }
  ) => Promise<number>;
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramSetupView({
  mode,
  open,
  program,
  onClose,
  onSubmit,
}: ProgramSetupViewProps) {
  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [activeTab, setActiveTab] = useState<SetupTab>("basic");

  const [basicsSaved, setBasicsSaved] = useState(false);
  const [basicsData, setBasicsData] =
    useState<ProgramBasicsData | null>(null);

  const [selectedRolePreset, setSelectedRolePreset] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* HANDLERS                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleBasicsSubmit = async (data: ProgramBasicsData) => {
    setBasicsData(data);
    setBasicsSaved(true);
    setActiveTab("roles");
  };

  const handleFinalSubmit = async () => {
    if (!basicsData) return;

    await onSubmit({
      ...basicsData,
      rolePreset: selectedRolePreset ?? undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setActiveTab("basic");
    setBasicsSaved(false);
    setBasicsData(null);
    setSelectedRolePreset(null);
    onClose();
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="
          w-[98vw]
          sm:max-w-md
          bg-[var(--bg-gray-lt)]
          border border-[var(--border)]
          rounded-lg
          shadow-xl
          overflow-x-hidden
        "
      >
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-[var(--text-dark)]">
            {mode === "add" ? "Create Program" : "Edit Program"}
          </DialogTitle>
        </DialogHeader>

        {/* TABS */}
        <div className="
          flex  justify-between gap-2
          w-full p-1
          border-b border-[var(--border)]
          overflow-x-scroll
        ">          
          <TabButton
            active={activeTab === "basic"}
            onClick={() => setActiveTab("basic")}
          >
            Basics
          </TabButton>

          <TabButton
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </TabButton>

          <TabButton
            active={activeTab === "season"}
            onClick={() => setActiveTab("season")}
          >
            Season
          </TabButton>

          <TabButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </TabButton>

          <TabButton
            active={activeTab === "templates"}
            onClick={() => setActiveTab("templates")}
          >
            Templates
          </TabButton>
        </div>

        {/* CONTENT */}
        <div className="h-[60vh] overflow-y-auto">
          {activeTab === "basic" && (
            <ProgramSetupBasics
              mode={mode}
              program={program}
              onSubmit={handleBasicsSubmit}
            />
          )}

          {activeTab === "roles" && (
            <ProgramSetupRoles
              selectedPreset={selectedRolePreset}
              onSelect={setSelectedRolePreset}
              onSkip={handleFinalSubmit}
              onContinue={handleFinalSubmit}
            />
          )}

          {activeTab === "season" && (
            <Placeholder>
              Season setup.
              <br />
              <span className="opacity-70">
                Start/end dates, competition phase splits, training cycles.
              </span>
            </Placeholder>
          )}

          {activeTab === "settings" && (
            <Placeholder>
              Program settings.
              <br />
              <span className="opacity-70">
                Visibility, permissions, and whether unauthenticated users can
                view the program (true / false).
              </span>
            </Placeholder>
          )}

          {activeTab === "templates" && (
            <Placeholder>
              Templates.
              <br />
              <span className="opacity-70">
                Includes “copy from existing” program, packages, and ledgers.
              </span>
            </Placeholder>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="default" onClick={handleFinalSubmit}>
            {mode === "add" ? "Create Program" : "Save Changes"} 
            {/* ~ Add check for required radars. */}
          </Button>

          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                              */
/* ========================================================================== */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-sm font-medium
        transition-colors
        ${
          active
            ? "text-[var(--text-dark)] border-b-2 border-[var(--accent-bg)]"
            : "text-[var(--text)] hover:text-[var(--text-dark)]"
        }
      `}
    >
      {children}
    </button>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 text-sm text-[var(--text)] italic">
      {children}
    </div>
  );
}
