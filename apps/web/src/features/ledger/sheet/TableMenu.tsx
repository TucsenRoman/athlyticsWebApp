// src/features/ledger/sheet/TableMenu.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"

// ✅ IMPORTANT: update this import path to wherever you placed the component
import ExpansiveMenu, { type ExpansiveMenuItem } from "@/components/ui/navigation/expansivemenu"

import {
  Printer,
  FileSpreadsheet,
  Pin,
  PinOff,
  LayoutGrid,
  Rows3,
  Rows,
  Minimize,
  Expand,
  FileText,
  Braces,
  Table,
  Grid3X3,
  MousePointer2Off,
  MousePointer2,
  Eye,
  EyeOff,
  Download,
  FileCog,
  Maximize,
  Minimize2,
  Maximize2,
  Square,
  Files,
  FolderInput,
} from "lucide-react"

type TableMenuProps = {
  tableId: string
  headers: Array<{ id: string; name: string | null; order_index?: number | null }>
  entries: Array<{ id: string; values?: Record<string, any> | null }>

  compactView: boolean
  setCompactView: React.Dispatch<React.SetStateAction<boolean>>

  pinMode: boolean
  setPinMode: React.Dispatch<React.SetStateAction<boolean>>

  useAlternateRows: boolean
  setUseAlternateRows: React.Dispatch<React.SetStateAction<boolean>>

  showGridLines: boolean
  setShowGridLines: React.Dispatch<React.SetStateAction<boolean>>

  hoverEffects: boolean
  setHoverEffects: React.Dispatch<React.SetStateAction<boolean>>

  fullscreenTargetRef: React.RefObject<HTMLElement>

  onExportPDF?: () => void
  onExportJSON?: () => void

  blurMode?: boolean
  setBlurMode: React.Dispatch<React.SetStateAction<boolean>>
  isBlurred?: boolean
  onToggleBlur?: (colId: string) => void
}

export default function TableMenu({
  tableId,
  headers,
  entries,

  compactView,
  setCompactView,

  pinMode,
  setPinMode,

  useAlternateRows,
  setUseAlternateRows,

  showGridLines,
  setShowGridLines,

  hoverEffects,
  setHoverEffects,

  blurMode,
  setBlurMode,

  fullscreenTargetRef,
  onExportPDF,
  onExportJSON,
}: TableMenuProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const ICON = "h-[18px] w-[18px]"
  const MAIN_ICON = "h-5 w-5"

  /* ----------------------------- handlers ----------------------------- */

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    try {
      const ordered = [...(headers ?? [])].sort(
        (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
      )

      const esc = (v: any) => {
        const s = v === null || v === undefined ? "" : String(v)
        const needsQuotes = /[",\n]/.test(s)
        const safe = s.replace(/"/g, '""')
        return needsQuotes ? `"${safe}"` : safe
      }

      const headerRow = ordered.map((h) => esc(h?.name ?? "")).join(",")
      const rows = (entries ?? []).map((e: any) =>
        ordered.map((h) => esc(e?.values?.[h.id])).join(",")
      )

      const csv = [headerRow, ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `table_${tableId}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("❌ Export CSV failed:", err)
    }
  }

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      const el = fullscreenTargetRef.current
      if (!el) return
      await el.requestFullscreen()
    } catch (err) {
      console.error("Fullscreen toggle failed:", err)
    }
  }

  /* ----------------------------- effects ----------------------------- */

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  /* ----------------------------- menu items ----------------------------- */

  const items: ExpansiveMenuItem[] = useMemo(
    () => [
      {
        id: "file",
        label: "File",
        icon: <FileCog className={ICON} />,
        children: [
          {
            id: "file-print",
            label: "Print",
            icon: <Printer className={ICON} />,
            action: handlePrint,
          },
          {
            id: "copy",
            label: "Create Copy",
            icon: <Files className={ICON} />,
            action: null,
          },
          {
            id: "move",
            label: "Move",
            icon: <FolderInput className={ICON} />,
            action: null,
          },
        ],
      },
      {
        id: "export",
        label: "Export",
        icon: <Download className={ICON} />,
        children: [
          {
            id: "export-csv",
            label: "CSV",
            icon: <FileSpreadsheet className={ICON} />,
            action: handleExportCSV,
          },
          {
            id: "export-pdf",
            label: "PDF",
            icon: <FileText className={ICON} />,
            action: onExportPDF ?? (() => alert("PDF export coming soon.")),
          },
          {
            id: "export-json",
            label: "JSON",
            icon: <Braces className={ICON} />,
            action: onExportJSON ?? (() => alert("JSON export coming soon.")),
          },
        ],
      },
      {
        id: "view",
        label: "View",
        icon: <Eye className={ICON} />,
        children: [
          {
            id: "view-width",
            label: compactView ? "Even Width" : "Fit Width",
            icon: !compactView ? (
            <Minimize2 className={`${ICON} rotate-45`} />
            ) : (
            <Maximize2 className={`${ICON} rotate-45`} />
            ),            
            action: () => setCompactView((v) => !v),
          },
          {
            id: "view-gridlines",
            label: showGridLines ? "Disable grid lines" : "Enable grid lines",
            icon: showGridLines ? (
              <Grid3X3 className={ICON} />
            ) : (
              <Square className={ICON} />
            ),
            action: () => setShowGridLines((v) => !v),
          },
          {
            id: "view-hover",
            label: hoverEffects ? "Disable Hover Effects" : "Enable Hover Effects",
            icon: !hoverEffects ? (
              <MousePointer2Off className={ICON} />
            ) : (
              <MousePointer2 className={ICON} />
            ),
            action: () => setHoverEffects((v) => !v),
          },
          {
            id: "view-blur",
            label: blurMode ? "Exit Blur Mode" : "Blur Mode",
            icon: blurMode ? <EyeOff className={ICON} /> : <Eye className={ICON} />,
            action: () => setBlurMode((v) => !v),
          },
          {
            id: "view-pinmode",
            label: pinMode ? "Exit pin mode" : "Pin columns",
            icon: pinMode ? <PinOff className={ICON} /> : <Pin className={ICON} />,
            action: () => setPinMode((v) => !v),
          },
          {
            id: "view-altrows",
            label: useAlternateRows ? "Disable alternating rows" : "Enable alternating rows",
            icon: useAlternateRows ? <Rows className={ICON} /> : <Rows3 className={ICON} />,
            action: () => setUseAlternateRows((v) => !v),
          },
          {
            id: "view-fullscreen",
            label: fullscreen ? "Exit fullscreen" : "Fullscreen",
            icon: fullscreen ? <Minimize2 className={ICON} /> : <Maximize2 className={ICON} />,
            action: handleToggleFullscreen,
          },
        ],
      },
    ],
    [
      ICON,
      compactView,
      showGridLines,
      hoverEffects,
      blurMode,
      pinMode,
      useAlternateRows,
      fullscreen,
      tableId,
      headers,
      entries,
      setCompactView,
      setShowGridLines,
      setHoverEffects,
      setBlurMode,
      setPinMode,
      setUseAlternateRows,
      onExportPDF,
      onExportJSON,
    ]
  )

  /* ----------------------------- render ----------------------------- */

  return (
    <div
      className="
        relative flex items-center justify-center
        w-9 h-9 overflow-visible
        text-[var(--text)]
      "
      style={{ zIndex: 9999 }}
    >
      <ExpansiveMenu
        items={items}
        expand="layeredArch"
        directionDeg={135}
        radius={40}
        spacing={32}
        layeredArch={{
            layerGap: 40,
            startRadius: 45,
            spacingByLayer: [36, 44],
            // spacingByLayer: [37, 33.5],
            itemsPerLayerByLayer: [3, 5],
        }}
        variant="ghost"
        mainIcon={<Table className={MAIN_ICON} />}
        mainIconSize={18}
        mainSize={28}
        mainRotate={-90}
        defaultState="closed"
        autoClose={false}
      />
    </div>
  )
}
