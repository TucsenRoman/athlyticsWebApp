// src/features/workspace/modes/analyzer/comparison/ComparisonIndex.tsx
"use client"

import * as React from "react"

type Props = {
  programId: number
  demoMode: boolean
}

export default function ComparisonIndex({ programId, demoMode }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--gray-18)] bg-white/0 p-4">
      <div className="text-sm text-[var(--text)]">Comparisons list goes here.</div>
      <div className="mt-3 text-xs text-[var(--gray-13)]">
        programId: {programId} • {demoMode ? "demo" : "live"}
      </div>
    </div>
  )
}
