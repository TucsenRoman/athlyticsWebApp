import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Printer,
  FileDown,
  Users,
  Eye,
  FileText,
  SquareArrowOutUpRight,
  Image,
  FileJson2,
  ArrowLeft,
} from "lucide-react";

interface LedgerOrbProps {
  onExport: () => void;
  onBulkMode: () => void;
  onPrint: () => void;
  onToggleView: () => void;
}

export default function LedgerOrb({
  onExport,
  onBulkMode,
  onPrint,
  onToggleView,
}: LedgerOrbProps) {
  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const exportActions = [
    { icon: <FileDown />, label: "CSV", action: onExport },
    { icon: <FileText />, label: "PDF", action: () => console.log("Export PDF") },
    { icon: <Image />, label: "PNG", action: () => console.log("Export PNG") },
    { icon: <FileJson2 />, label: "JSON", action: () => console.log("Export JSON") },
  ];

  const actions = [
    { icon: <Printer />, label: "Print", action: onPrint },
    { icon: <SquareArrowOutUpRight />, label: "Export", action: () => setExportOpen(true), nested: true },
    { icon: <Users />, label: "Bulk Edit", action: onBulkMode },
    { icon: <Eye />, label: "Quick View", action: onToggleView },
  ];

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
                if (a.nested) return a.action();
                setOpen(false);
                setExportOpen(false);
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

  const handleMainClick = () => {
    if (exportOpen) {
      // Go back to main orb
      setExportOpen(false);
      setOpen(true);
    } else {
      // Toggle main orb normally
      setOpen((prev) => !prev);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-9 h-9 overflow-visible">
      {/* Main Orb / Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
          open || exportOpen
            ? "bg-[hsl(22,94%,57%)]/20 ring-2 ring-[hsl(22,94%,57%)]/50"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        onClick={handleMainClick}
      >
        <motion.div
          key={exportOpen ? "back" : "settings"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {exportOpen ? (
            <ArrowLeft className="w-4 h-4 text-[hsl(22,94%,57%)]" />
          ) : (
            <Settings2 className="w-4 h-4 text-[hsl(22,94%,57%)]" />
          )}
        </motion.div>
      </Button>

      {/* Export Arc */}
      {exportOpen && renderArc(exportActions, 55)}

      {/* Main Arc */}
      {!exportOpen && open && renderArc(actions, 60)}
    </div>
  );
}
