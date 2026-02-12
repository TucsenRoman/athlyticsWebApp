// src/features/program/RequireProgram.tsx
"use client"

import { ReactNode } from "react"
import { useProgramContext } from "./useProgramContext"
import { useDemo } from "@/contexts/DemoContext"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"

import ProgramDriveTrigger from "@/features/program/components/ProgramDriveTrigger"
import { Box, MousePointer2 } from "lucide-react"

import radarBg from "@/assets/backgrounds/radar-bg.png"

export default function RequireProgram({ children }: { children: ReactNode }) {
  const { selectedProgramId } = useProgramContext()
  const { demoMode } = useDemo()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Route Mapping
  const location = useLocation()
  const leaf = location.pathname.split("/").filter(Boolean).pop()

  // Program selected → allow
  if (selectedProgramId) return <>{children}</>

  // Empty / demo state
  return (
    <div className="relative w-full min-h-0 h-[100dvh] overflow-hidden">
      {/* CENTERED CARD */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div
          className={`
            relative
            flex flex-col gap-6
            p-6 py-3 w-full max-w-[360px]
            rounded-[28px]
            border border-[var(--gray-18)]
            bg-[var(--gray-20)]
            overflow-hidden
          `}
        >
          {/* TOP STRIP */}
          <div className="flex items-center gap-3">
            <div
              className={`
                absolute top-2 right-2
                flex items-center justify-center
                h-8 w-10
              `}
            >
              <Box className="h-5 w-5 text-[var(--text)]" />
            </div>
              <div className="flex flex-col leading-tight">
                <div className="flex gap-2 items-center">
                  {/* <Box className="h-5 w-5 text-[var(--text)]" /> */}
                  <div className="text-xl font-semibold text-[var(--text-lt)]">
                    No active program
                  </div>
                </div>
                <div className="text-xs text-[var(--text)]">
                  Pick one to view {leaf}.
                </div>
              </div>
          </div>

          {/* BODY */}
          <div className="">
            <div className="flex flex-col gap-2">
              <ProgramDriveTrigger variant="popup" />

              {!user && (
                <button
                  onClick={() => navigate("/auth")}
                  className={`
                    mt-1 w-full h-11
                    rounded-2xl border border-[var(--gray-18)]
                    text-[var(--text)] font-medium
                    transition
                    hover:bg-white/5 hover:text-[var(--text-lt)]
                  `}
                >
                  Sign In
                </button>
              )}

              {/* FOOTER NOTE */}
              {/* <div className="text-xs text-[var(--text-dk)]">
                {demoMode
                  ? "Demo mode is on — you can still browse the app."
                  : "Programs keep your team data organized."}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
