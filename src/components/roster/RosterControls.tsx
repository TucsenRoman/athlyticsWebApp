import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RosterControlsProps {
  placeholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  onEditClick?: () => void;
}

export default function RosterControls({
  placeholder,
  searchValue,
  onSearchChange,
  onFilterClick,
  onEditClick,
}: RosterControlsProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onFilterClick}>
          Filter
        </Button>
        <Button variant="default" size="sm" onClick={onEditClick}>
          Edit
        </Button>
      </div>
    </div>
  );
}
