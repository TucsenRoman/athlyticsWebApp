"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/overlays/popover";
import { Info } from "lucide-react";

type CardInfoProps = {
  icon?: React.ComponentType<{
    size?: number | string;
    className?: string;
  }>;
  content: React.ReactNode;
};

export function CardInfo({ icon: Icon = Info, content }: CardInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-center w-7 h-7">
          <Icon size={22} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="
          w-max max-w-full rounded-lg p-4
          bg-[var(--gray-11)]
          border-none
          shadow-lg
        "
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
