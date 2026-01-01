"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";

import ProgramSetupBasics, {
  ProgramBasicsData,
} from "./ProgramSetupBasics";
import { ProgramId } from "@/features/program-cloak";
import { DialogTitle } from "@radix-ui/react-dialog";
import { GradientHint } from "@/components/ui";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type SetupTab = "basic";

export interface ProgramConfigModalProps {
  mode: "add" | "edit";
  open: boolean;
  program: any | null;
  onClose: () => void;
  onSubmit: (data: ProgramBasicsData & { year: string }) => Promise<ProgramId | null>;
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ProgramConfigModal({
  mode,
  open,
  program,
  onClose,
  onSubmit,
}: ProgramConfigModalProps) {
  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [activeTab] = useState<SetupTab>("basic");

  const [basicsData, setBasicsData] = useState<ProgramBasicsData>({
    school: "",
    sport: "",
    levels: [],
    gender: "",
    seasonStart: undefined,
    seasonEnd: undefined,
  });

  const resolvedSport =
    basicsData.sport === "Other"
      ? basicsData.customSport?.trim() || "Other"
      : basicsData.sport;

  useEffect(() => {
    if (!open) return;

    // EDIT MODE — hydrate from program
    if (mode === "edit" && program) {
      setBasicsData({
        school: program.school ?? "",
        sport: program.sport ?? "",
        levels: program.level
          ? program.level.split(",").map((s: string) => s.trim())
          : [],
        gender: program.gender ?? "",
        seasonStart: program.season_start ?? undefined,
        seasonEnd: program.season_end ?? undefined,
      });
      return;
    }

    // ADD MODE — reset
    if (mode === "add") {
      setBasicsData({
        school: "",
        sport: "",
        levels: [],
        gender: "",
        seasonStart: undefined,
        seasonEnd: undefined,
      });
    }
  }, [open, mode, program]);

  /* ------------------------------------------------------------------------ */
  /* HANDLERS                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleFinalSubmit = async () => {
    const now = new Date();
    const startDate = basicsData.seasonStart
      ? new Date(basicsData.seasonStart)
      : null;

    const year =
      startDate?.getFullYear().toString() ??
      now.getFullYear().toString();

    await onSubmit({
      ...basicsData,
      sport: resolvedSport,
      year,
    });

    handleClose();
  };

  const handleClose = () => {
    setBasicsData({
      school: "",
      sport: "",
      levels: [],
      gender: "",
      seasonStart: undefined,
      seasonEnd: undefined,
    });
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
          bg-[var(--gray-lt)]
          border border-[var(--border)]
          rounded-lg
          shadow-xl
        "
      >
        {/* HEADER ---------------------------------------------------------- */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--text-dark)]">
            {mode === "add" ? "Create Program" : "Edit Program"}
          </DialogTitle>
        </DialogHeader>

        {/* CONTENT --------------------------------------------------------- */}
        <div className="relative h-[60vh]">
          <div className="h-full overflow-y-auto">
            {activeTab === "basic" && (
              <ProgramSetupBasics
                mode={mode}
                value={basicsData}
                onChange={setBasicsData}
              />
            )}
          </div>

          <GradientHint direction="bottom" extent="50px" radius="none"/>
        </div>

        {/* FOOTER ---------------------------------------------------------- */}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="solid" onClick={handleFinalSubmit}>
            {mode === "add" ? "Create Program" : "Save Changes"}
          </Button>

          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
