"use client";

import { useState } from "react";
import ExpansiveMenu, {
  type ExpansiveMenuItem,
} from "@/components/ui/navigation/expansivemenu";
import Search from "@/components/navigation/Search";
import { Star, Filter, Layers, ToolCase, SearchIcon } from "lucide-react";

interface EditorToolsProps {
  onSearch: (value: string) => void;
  onFavorite?: () => void;
  onFilter?: () => void;
  onLayers?: () => void;
  onFind?: () => void;
}

export default function EditorTools({
  onSearch,
  onFavorite,
  onFilter,
  onLayers,
  onFind,
}: EditorToolsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const editorMenuItems: ExpansiveMenuItem[] = [
    {
      label: "Favorite",
      icon: <Star className="h-4 w-4" />,
      action: onFavorite,
      flavor: "yellow",
    },
    {
      label: "Filters",
      icon: <Filter className="h-4 w-4" />,
      action: onFilter,
      flavor: "blue",
    },
    {
      label: "Layers",
      icon: <Layers className="h-4 w-4" />,
      action: onLayers,
      flavor: "purple",
    },
    {
      label: "Find",
      icon: <SearchIcon className="h-4 w-4" />,
      action: onFind,
      flavor: "slate",
    },
  ];

  return (
    <div className="flex items-center gap-2 w-full">
      <ExpansiveMenu
        items={editorMenuItems}
        expand="line"
        direction="left"
        spacing={36}
        variant="rainbow"
        mainIcon={<ToolCase />}
        mainRotate={-20}
        // mainSize={42}
        defaultState="open"
        mobile={{
          direction: "right",
          mainRotate: 20,
        }}
      />
    </div>
  );
}
