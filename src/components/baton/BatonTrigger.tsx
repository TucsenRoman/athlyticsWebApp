"use client";

import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import { usePushPanel } from "@/contexts/PushPanelContext";

/* ========================================================================== */
/* BATON LAUNCHER                                                             */
/* ========================================================================== */

export default function BatonTrigger() {
  const { open, setOpen } = usePushPanel();

  return (
    <>
      <Button
        variant="toolbar"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Open Baton assistant"
        data-active={open}
      >
        <BotMessageSquare className="h-5 w-5" />
      </Button>
    </>
  );
}
