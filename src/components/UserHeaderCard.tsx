import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UserHeaderCardProps {
  name?: string;
  position?: string;
  program?: string;
  className?: string;
}

export const UserHeaderCard: React.FC<UserHeaderCardProps> = ({
  name = "User Name",
  position = "Assistant Coach",
  program = "Co-ed High School Cross Country",
  className,
}) => {
  return (
    <Card className={cn("p-4 shadow-sm", className)}>
      <div className="flex items-center gap-6">
        {/* Left section: User name */}
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
        </div>

        {/* Right section: Stacked boxes */}
        <div className="flex flex-col gap-2 ml-auto">
          {/* Position box */}
          <div className="border border-border rounded-md px-4 py-2 bg-background min-w-[200px]">
            <p className="text-sm text-center text-muted-foreground">
              Position: <span className="font-medium text-foreground">{position}</span>
            </p>
          </div>

          {/* Program box */}
          <div className="border border-border rounded-md px-4 py-2 bg-background min-w-[200px]">
            <p className="text-sm text-center text-muted-foreground">
              Program: <span className="font-medium text-foreground">{program}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
