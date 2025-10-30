import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface RosterControlsProps {
  placeholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: ReactNode;
  onEditClick?: () => void;
}

export default function RosterControls({
  placeholder,
  searchValue,
  onSearchChange,
  filterOptions,
  onEditClick,
}: RosterControlsProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[200px] relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-8"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {filterOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {filterOptions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant="default" size="sm" onClick={onEditClick}>
          Edit
        </Button>
      </div>
    </div>
  );
}
