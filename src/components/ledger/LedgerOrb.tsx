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
  Pin,
  Share2,
  Lock,
  Link2,
  Copy,
  EyeOff,
  TableProperties,
} from "lucide-react";
import CopyLedger from "./CopyLedger";
import MoveLedger from "./MoveLedger";

interface LedgerOrbProps {
  ledgerId: string; // ✅ added
  onExport: () => void;
  onBulkMode: () => void;
  onPrint: () => void;
  onToggleView: () => void;
}

export default function LedgerOrb({
  ledgerId,
  onExport,
  onBulkMode,
  onPrint,
  onToggleView,
}: LedgerOrbProps) {
  const [open, setOpen] = useState(false);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const ICON_SIZE = 18;
  const iconStyle = { width: ICON_SIZE, height: ICON_SIZE };

  /* ------------------------------- UTILITIES ------------------------------- */

  const toastAlert = (message: string) => alert(message);
  const toggleTheme = () => document.documentElement.classList.toggle("dark");
  const pinColumns = () => toastAlert("Pinning columns not yet implemented.");
  const showCommunity = () => toastAlert("Opening community space...");
  const managePermissions = () => toastAlert("Manage permissions modal here...");
  const hideColumn = () => toastAlert("Hide/lock column action...");
  const exportPDF = () => toastAlert("Exporting to PDF...");
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastAlert("Ledger share link copied!");
  };

  // 🖼 Capture ledger area only
  const captureScreenshot = async () => {
    const el = document.getElementById("ledger-container");
    if (!el) return toastAlert("Ledger container not found.");

    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

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
      { icon: <Printer style={iconStyle} />, label: "Print", action: onPrint },
      { icon: <Copy style={iconStyle} />, label: "Duplicate to Program", action: () => setCopyOpen(true), },
      { icon: <FolderOutput style={iconStyle} />, label: "Move to Program", action: () => setMoveOpen(true) },
      { icon: <SquareMousePointer style={iconStyle} />, label: "Bulk Select", action: onBulkMode },
    ],
    View: [
      { icon: <Moon style={iconStyle} />, label: "Light/Dark Mode", action: toggleTheme },
      { icon: <Pin style={iconStyle} />, label: "Pin Columns", action: pinColumns },
      { icon: <ScanEye style={iconStyle} />, label: "Capture View", action: captureScreenshot },
    ],
    Export: [
      { icon: <FileDown style={iconStyle} />, label: "CSV", action: onExport },
      { icon: <FileText style={iconStyle} />, label: "PDF", action: exportPDF },
      { icon: <Image style={iconStyle} />, label: "PNG", action: captureScreenshot },
      { icon: <Braces style={iconStyle} />, label: "JSON", action: exportJSON },
    ],
    Share: [
      { icon: <Users style={iconStyle} />, label: "Community", action: showCommunity },
      { icon: <Lock style={iconStyle} />, label: "Permissions", action: managePermissions },
      { icon: <Link2 style={iconStyle} />, label: "Link", action: copyLink },
      { icon: <EyeOff style={iconStyle} />, label: "Lock/Hide Col", action: hideColumn },
    ],
  };

  const ROOT_ACTIONS = [
    { icon: <TableProperties style={iconStyle} />, label: "Ledger", nested: "Ledger" },
    { icon: <Eye style={iconStyle} />, label: "View", nested: "View" },
    { icon: <SquareArrowOutUpRight style={iconStyle} />, label: "Export", nested: "Export" },
    { icon: <Share2 style={iconStyle} />, label: "Share", nested: "Share" },
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
                setOpen(false);
                setActiveNest(null);
                setTimeout(() => a.action(), 150);
              }}
              className="h-7 w-7 p-0 rounded-full bg-white shadow-md hover:bg-[hsl(22,94%,57%)]/10 transition"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-[hsl(22,94%,57%)]"
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
    <div className="relative flex items-center justify-center w-9 h-9 overflow-visible">
      {/* ⚙️ Main Orb / Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMainClick}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
          open || activeNest
            ? "bg-[hsl(22,94%,57%)]/20 ring-2 ring-[hsl(22,94%,57%)]/50"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <motion.div
          key={isNested ? "back" : "settings"}
          animate={{ rotate: isNested ? 0 : open ? -90 : 0, opacity: 1 }}
          initial={{ rotate: isNested ? -90 : 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isNested ? (
            <ArrowLeft className="w-4 h-4 text-[hsl(22,94%,57%)]" />
          ) : (
            <Settings2 className="w-4 h-4 text-[hsl(22,94%,57%)]" />
          )}
        </motion.div>
      </Button>

      <CopyLedger open={copyOpen} onOpenChange={setCopyOpen} ledgerId={ledgerId} />
      <MoveLedger open={moveOpen} onOpenChange={setMoveOpen} ledgerId={ledgerId!} />

      {/* 🌀 Render active arc */}
      {activeNest
        ? renderArc(MENU_TREE[activeNest], 55)
        : open && renderArc(ROOT_ACTIONS, 60)}
    </div>
  );
}
