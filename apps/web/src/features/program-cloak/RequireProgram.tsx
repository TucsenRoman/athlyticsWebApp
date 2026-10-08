"use client";

import { ReactNode } from "react";
import { useProgramContext } from "./useProgramContext";
import { useDemo } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger";
import { LocateFixed } from "lucide-react";

import radarBg from "@/assets/backgrounds/radar-bg.png";

export default function RequireProgram({
  children,
}: {
  children: ReactNode;
}) {
  const { selectedProgramId } = useProgramContext();
  const { demoMode } = useDemo();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Program selected → allow
  if (selectedProgramId) {
    return <>{children}</>;
  }

  // Empty / demo state
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* RADAR BACKGROUND SYMBOL */}
      {/* <div
        className="
          absolute inset-0
          bg-center bg-no-repeat
          pointer-events-none
        "
        style={{
          backgroundImage: `url(${radarBg})`,
          backgroundSize: "100%",
        }}
      /> */}

      {/* SOFT GRADIENT OVERLAY */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,rgba(235,237,240,0.1)_75%)]
          pointer-events-none
        "
      />

      {/* CONTENT */}
      <div className="relative flex h-full w-full items-center justify-center px-4">
        {/* FLOATING GLASS CARD */}
        <div
          className="
            relative w-full max-w-[300px]
            rounded-[24px]
            bg-gray-200/50
            backdrop-blur-xl
            shadow-[inset_0_10px_40px_rgba(0,0,0,0.12)]
            border-2 border-[var(--vWhite)]
            px-6 pt-8 pb-7
            text-center
          "
        >
          {/* RADAR ICON */}
          <div className="mb-5 flex justify-center">
            <div
              className="
                flex h-16 w-16 items-center justify-center
                rounded-full bg-[var(--dom-glass)]
              "
            >
              <LocateFixed className="h-[70%] w-[70%] text-[var(--dom-dk)]" />
            </div>
          </div>

          {/* TITLE */}
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-dk)]">
            Your workspace is empty
          </h2>

          {/* COPY */}
          {/* Add state handling for create vs select. */}
          <p className="mx-auto mb-6 max-w-[280px] text-sm leading-relaxed text-[var(--text)]">
            Start by selecting a program.
          </p>

          {/* PRIMARY CTA */}
          <div className="flex justify-center items-center mb-4 p-1 h-10 rounded-lg text-[var(--gray-5)] bg-[linear-gradient(to_bottom,rgb(181_207_245)_10%,rgb(128_174_243)_90%)] shadow-md">
            {/* <ProgramDriveTrigger /> */}
            Create a Program
          </div>

          {/* SECONDARY CTA */}
          {!user && (
            <button
              onClick={() => navigate("/auth")}
              className="
                py-1 w-[80%]
                border border-[var(--border-dk)] rounded-xl
                text-lg text-[var(--text)] font-medium
                opacity-80 transition-opacity hover:opacity-100
              "
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
