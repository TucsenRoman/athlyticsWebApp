"use client";

import { MoreVertical, Tag, Copy, Edit, Trash2, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/overlays/dropdown-menu";

interface PackageMenuProps {
  instanceId: string;
  onRename: (instanceId: string) => void;
  onManageTags: (instanceId: string) => void;
  onDuplicate: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
  onDismantle: (instanceId: string) => void;
  onEditLedgers: (instanceId: string) => void;
}

export default function PackageMenu({
  instanceId,
  onRename,
  onManageTags,
  onDuplicate,
  onDelete,
  onDismantle,
  onEditLedgers,
}: PackageMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="
            p-1 rounded-md 
            hover:bg-muted 
            transition
            text-muted-foreground hover:text-foreground
          "
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">

        <DropdownMenuItem onClick={() => onRename(instanceId)}>
          <Edit className="w-3.5 h-3.5 mr-2" />
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onManageTags(instanceId)}>
          <Tag className="w-3.5 h-3.5 mr-2" />
          Manage tags
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEditLedgers(instanceId)}>
          <Layers className="w-3.5 h-3.5 mr-2" />
          Edit ledgers
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onDuplicate(instanceId)}>
          <Copy className="w-3.5 h-3.5 mr-2" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onDismantle(instanceId)}>
          <Layers className="w-3.5 h-3.5 mr-2 rotate-90" />
          Dismantle
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onDelete(instanceId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete package
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
