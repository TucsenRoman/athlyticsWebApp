import { useState } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Printer,
  FileDown,
  FileText,
  Braces,
  Image,
  SquareArrowOutUpRight,
  Users,
  ScanEye,
  Eye,
  SquareMousePointer,
  FolderOutput,
  ArrowLeft,
  Moon,
  Sun,
  Pin,
  Share2,
  Lock,
  Link2,
  Copy,
  EyeOff,
  TableProperties,
  FileSpreadsheet,
} from "lucide-react";
import CopyLedger from "./CopyLedger";
import MoveLedger from "./MoveLedger";

interface LedgerOrbProps {
  ledgerId: string;
  onExportCSV: () => void;
  onBulkMode: () => void;
  onPrint: () => void;
  onToggleView: () => void;
  onExportPDF?: () => void;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onTogglePinMode?: () => void;
}

export default function LedgerOrb({
  ledgerId,
  onExportCSV,
  onBulkMode,
  onPrint,
  onToggleView,
  onExportPDF,
  onExportPNG,
  onExportJSON,
  onTogglePinMode,
}: LedgerOrbProps) {
  const [open, setOpen] = useState(false);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const ICON_SIZE = 18;
  const iconStyle = { width: ICON_SIZE, height: ICON_SIZE };

  /* ------------------------------- UTILITIES ------------------------------- */

  const toastAlert = (message: string) => alert(message);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const pinColumns = onTogglePinMode;
  const showCommunity = () => toastAlert("Opening community space...");
  const managePermissions = () => toastAlert("Manage permissions modal here...");
  const hideColumn = () => toastAlert("Hide/lock column action...");
  const exportPDF = () => toastAlert("Exporting to PDF...");
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastAlert("Ledger share link copied!");
  };

  const captureScreenshot = async () => {
    const el = document.getElementById("ledger-container");
    if (!el) return toastAlert("Ledger container not found.");
    const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "ledger_view.png";
    a.click();
  };

  const exportJSON = () => {
    const dummy = { ledger: "Example data" };
    const blob = new Blob([JSON.stringify(dummy, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ledger.json";
    link.click();
  };

  /* ------------------------------ MENU STRUCTURE ------------------------------ */
  const MENU_TREE: Record<string, any[]> = {
    Ledger: [
      { icon: <Printer style={iconStyle} />, label: "Print", action: onPrint, closeOnClick: true },
      { icon: <Copy style={iconStyle} />, label: "Duplicate to Program", action: () => setCopyOpen(true), closeOnClick: true },
      { icon: <FolderOutput style={iconStyle} />, label: "Move to Program", action: () => setMoveOpen(true), closeOnClick: true },
      { icon: <SquareMousePointer style={iconStyle} />, label: "Bulk Select", action: onBulkMode, closeOnClick: true },
    ],
    View: [
      {
        icon: (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: 0, opacity: 1 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {theme === "dark" ? (
                <Sun style={iconStyle} />
              ) : (
                <Moon style={iconStyle} />
              )}
            </motion.div>
          </AnimatePresence>
        ),
        label: theme === "dark" ? "Light Mode" : "Dark Mode",
        action: toggleTheme,
        closeOnClick: false,
      },
      { icon: <Pin style={iconStyle} />, label: "Pin Columns", action: onTogglePinMode, closeOnClick: false },
      { icon: <ScanEye style={iconStyle} />, label: "Capture View", action: captureScreenshot, closeOnClick: true },
    ],
    Export: [
      { icon: <FileSpreadsheet style={iconStyle} />, label: "CSV", action: onExportCSV, closeOnClick: true },
      { icon: <FileText style={iconStyle} />, label: "PDF", action: onExportPDF, closeOnClick: true },
      // { icon: <Image style={iconStyle} />, label: "PNG", action: onExportPNG, closeOnClick: true },
      { icon: <Braces style={iconStyle} />, label: "JSON", action: onExportJSON, closeOnClick: true },
    ],
    Share: [
      { icon: <Users style={iconStyle} />, label: "Community", action: showCommunity, closeOnClick: true },
      { icon: <Lock style={iconStyle} />, label: "Permissions", action: managePermissions, closeOnClick: true },
      { icon: <Link2 style={iconStyle} />, label: "Link", action: copyLink, closeOnClick: true },
      { icon: <EyeOff style={iconStyle} />, label: "Lock/Hide Col", action: hideColumn, closeOnClick: true },
    ],
  };

  const ROOT_ACTIONS = [
    { icon: <TableProperties style={iconStyle} />, label: "Ledger Settings", nested: "Ledger", closeOnClick: false },
    { icon: <Eye style={iconStyle} />, label: "View", nested: "View", closeOnClick: false },
    { icon: <SquareArrowOutUpRight style={iconStyle} />, label: "Export", nested: "Export", closeOnClick: false },
    { icon: <Share2 style={iconStyle} />, label: "Share", nested: "Share", closeOnClick: false },
  ];

  /* ----------------------------- ORB RENDERING ----------------------------- */

  const renderArc = (items: any[], radius = 60) => (
    <AnimatePresence>
      {items.map((a, i) => {
        const totalArc = Math.PI / 2;
        const startAngle = -Math.PI / 2;
        const angle = startAngle + (i / (items.length - 1)) * totalArc;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * -1;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 1, x, y, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="absolute pointer-events-auto"
            style={{ zIndex: 50 }}
          >
            <Button
              variant="ghost"
              size="icon"
              title={a.label}
              onClick={() => {
                if (a.nested) return setActiveNest(a.nested);
                if (a.closeOnClick) {
                  setOpen(false);
                  setActiveNest(null);
                  setTimeout(() => a.action(), 100);
                } else {
                  a.action();
                }
              }}
              className="h-7 w-7 p-0 rounded-full bg-card dark:bg-neutral-900 shadow-md hover:bg-[hsl(var(--primary))/0.15] transition"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-[hsl(var(--primary))]"
              >
                {a.icon}
              </motion.div>
            </Button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );


  /* ----------------------------- MAIN ORB BUTTON ----------------------------- */

  const handleMainClick = () => {
    if (activeNest) setActiveNest(null);
    else setOpen((prev) => !prev);
  };

  const isNested = !!activeNest;

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 overflow-visible"
      style={{
        zIndex: 9999, // sits above any header cell or pinned element
        isolation: "isolate", // creates its own stacking context
      }}
    >      {/* ⚙️ Main Orb / Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMainClick}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
          open || activeNest
            ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.6]"
            : "bg-muted hover:bg-muted/70 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        }`}
      >
        <motion.div
          key={isNested ? "back" : "settings"}
          animate={{ rotate: isNested ? 0 : open ? -90 : 0, opacity: 1 }}
          initial={{ rotate: isNested ? -90 : 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isNested ? (
            <ArrowLeft className="w-4 h-4 text-[hsl(var(--primary))]" />
          ) : (
            <Settings2 className="w-4 h-4 text-[hsl(var(--primary))]" />
          )}
        </motion.div>
      </Button>

      <CopyLedger open={copyOpen} onOpenChange={setCopyOpen} ledgerId={ledgerId} />
      <MoveLedger open={moveOpen} onOpenChange={setMoveOpen} ledgerId={ledgerId!} />

      {/* 🌀 Render active arc */}
      {activeNest ? renderArc(MENU_TREE[activeNest], 55) : open && renderArc(ROOT_ACTIONS, 60)}
    </div>
  );
}
