// src/features/ledger/sheet/TableMenu.tsx
"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/actions/button"

import {
  Settings2,
  CircleChevronLeft,
  Printer,
  FileSpreadsheet,
  Moon,
  Sun,
  Pin,
  LayoutGrid,
  Rows3,
  Rows,
  Minimize,
  Expand,
  FileText,
  Braces,
} from "lucide-react"

type TableMenuProps = {
  tableId: string
  headers: Array<{ id: string; name: string | null; order_index?: number | null }>
  entries: Array<{ id: string; values?: Record<string, any> | null }>

  // view state lives in TableSheet (so the grid can react)
  compactView: boolean
  setCompactView: React.Dispatch<React.SetStateAction<boolean>>

  pinMode: boolean
  setPinMode: React.Dispatch<React.SetStateAction<boolean>>

  useAlternateRows: boolean
  setUseAlternateRows: React.Dispatch<React.SetStateAction<boolean>>

  // fullscreen target (TableSheet root wrapper)
  fullscreenTargetRef: React.RefObject<HTMLElement>

  // optional exports (stubs you can wire later)
  onExportPDF?: () => void
  onExportJSON?: () => void
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
  fullscreenTargetRef,
  onExportPDF,
  onExportJSON,
}: TableMenuProps) {
  const [open, setOpen] = useState(false)
  const [activeNest, setActiveNest] = useState<string | null>(null)

  const [fullscreen, setFullscreen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  )

  const ICON_SIZE = 18
  const iconStyle = { width: ICON_SIZE, height: ICON_SIZE }

  /* ----------------------------- helpers ----------------------------- */

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  const handlePrint = () => {
    window.print()
  }

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
      console.error("❌ Fullscreen toggle failed:", err)
    }
  }

  /* ----------------------------- effects ----------------------------- */

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  /* ----------------------------- menu tree ----------------------------- */

  const MENU_TREE: Record<string, any[]> = useMemo(
    () => ({
      Sheet: [
        {
          icon: <Printer style={iconStyle} />,
          label: "Print",
          action: handlePrint,
          closeOnClick: true,
        },
      ],
      View: [
        {
          icon: <LayoutGrid style={iconStyle} />,
          label: compactView ? "Standard view" : "Compact view",
          action: () => setCompactView((v) => !v),
          closeOnClick: true,
        },
        {
          icon: <Pin style={iconStyle} />,
          label: pinMode ? "Exit pin mode" : "Pin columns",
          action: () => setPinMode((v) => !v),
          closeOnClick: true,
        },
        {
          icon: useAlternateRows ? (
            <Rows style={iconStyle} />
          ) : (
            <Rows3 style={iconStyle} />
          ),
          label: useAlternateRows
            ? "Disable Alternating Rows"
            : "Enable Alternating Rows",
          action: () => setUseAlternateRows((v) => !v),
          closeOnClick: true,
        },
        {
          icon:
            theme === "dark" ? (
              <Sun style={iconStyle} />
            ) : (
              <Moon style={iconStyle} />
            ),
          label: theme === "dark" ? "Light Mode" : "Dark Mode",
          action: toggleTheme,
          closeOnClick: false,
        },
        {
          icon: fullscreen ? (
            <Expand style={iconStyle} />
          ) : (
            <Minimize style={iconStyle} />
          ),
          label: fullscreen ? "Exit Fullscreen" : "Fullscreen",
          action: handleToggleFullscreen,
          closeOnClick: true,
        },
      ],
      Export: [
        {
          icon: <FileSpreadsheet style={iconStyle} />,
          label: "CSV",
          action: handleExportCSV,
          closeOnClick: true,
        },
        {
          icon: <FileText style={iconStyle} />,
          label: "PDF",
          action: onExportPDF ?? (() => alert("PDF export coming soon.")),
          closeOnClick: true,
        },
        {
          icon: <Braces style={iconStyle} />,
          label: "JSON",
          action: onExportJSON ?? (() => alert("JSON export coming soon.")),
          closeOnClick: true,
        },
      ],
    }),
    [
      compactView,
      pinMode,
      useAlternateRows,
      fullscreen,
      theme,
      tableId,
      headers,
      entries,
      setCompactView,
      setPinMode,
      setUseAlternateRows,
      onExportPDF,
      onExportJSON,
    ]
  )

  const ROOT_ACTIONS = useMemo(
    () => [
      { icon: <Settings2 style={iconStyle} />, label: "Sheet", nested: "Sheet" },
      { icon: <LayoutGrid style={iconStyle} />, label: "View", nested: "View" },
      { icon: <FileSpreadsheet style={iconStyle} />, label: "Export", nested: "Export" },
    ],
    []
  )

  /* ----------------------------- arc render ----------------------------- */

  const renderArc = (items: any[], radius = 60) => (
    <AnimatePresence>
      {items.map((a, i) => {
        const totalArc = Math.PI / 2
        const startAngle = -Math.PI / 2
        const denom = Math.max(1, items.length - 1)
        const angle = startAngle + (i / denom) * totalArc
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius * -1

        return (
          <motion.div
            key={`${a.label}-${i}`}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 1, x, y, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.22, delay: i * 0.04 }}
            className="absolute pointer-events-auto z-50"
          >
            <Button
              variant="ghost"
            //   size="icon"
              title={a.label}
              onClick={() => {
                if (a.nested) {
                  setActiveNest(a.nested)
                  setOpen(true)
                  return
                }

                if (a.closeOnClick) {
                  setOpen(false)
                  setActiveNest(null)
                  setTimeout(() => a.action?.(), 80)
                  return
                }

                a.action?.()
              }}
              className="h-7 w-7 p-0 rounded-full bg-card shadow-md hover:bg-card"
            >
              {a.icon}
            </Button>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )

  /* ----------------------------- orb logic ----------------------------- */

  const isNested = !!activeNest

  const handleMainClick = () => {
    if (activeNest) setActiveNest(null)
    else setOpen((prev) => !prev)
  }

  /* ----------------------------- render ----------------------------- */

  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 overflow-visible"
      style={{ zIndex: 9999 }}
    >
      <Button
        variant="ghost"
        // size="icon"
        onClick={handleMainClick}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
          open || activeNest
            ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.6]"
            : "bg-card hover:bg-[hsl(var(--primary))/0.1]"
        }`}
      >
        <motion.div
          key={isNested ? "back" : "settings"}
          animate={{ rotate: isNested ? 0 : open ? -90 : 0, opacity: 1 }}
          initial={{ rotate: isNested ? -90 : 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isNested ? (
            <CircleChevronLeft style={{ width: 24, height: 24, color: "hsl(var(--primary))" }} />
          ) : (
            <Settings2 style={{ width: 20, height: 20, color: "hsl(var(--primary))" }} />
          )}
        </motion.div>
      </Button>

      {activeNest ? renderArc(MENU_TREE[activeNest] ?? [], 70) : open && renderArc(ROOT_ACTIONS, 60)}
    </div>
  )
}
