import { motion, AnimatePresence } from "framer-motion";
import { MapPinned, Sparkles, PencilRuler, MoreVertical, Dumbbell } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ViewFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    {
      icon: <MapPinned className="w-5 h-5" />,
      route: "/field",
      active: location.pathname.startsWith("/field"),
    },
    {
      icon: <PencilRuler className="w-5 h-5" />,
      route: "/workspace",
      active: location.pathname.startsWith("/workspace"),
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      route: "/training",
      active: location.pathname.startsWith("/training"),
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      route: "/discovery",
      active: location.pathname.startsWith("/discovery"),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[999] md:hidden">
      <div className="relative flex flex-col items-center gap-3">
        {/* main FAB */}
        <button
          onClick={() => setOpen(!open)}
          className="
            w-14 h-14 rounded-full bg-primary text-[var(--text-light)] shadow-xl
            flex items-center justify-center
            active:scale-95 transition
          "
        >
          {/* <MoreVertical className="w-6 h-6" /> */}
        </button>
      </div>
    </div>
  );
}
