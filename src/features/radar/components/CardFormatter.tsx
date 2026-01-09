"use client";

import { cn } from "@/utils/utils";
import { CardInfo } from "@/features/radar/components/CardInfo";
import { Divider, GradientHint } from "../../../components/ui";

export default function CardFormatter({
  title,
  icon: Icon,
  children,
  actions,
  infoContent,      // ⬅ renamed + clearer meaning
  onClick,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  actions?: React.ReactNode;
  infoContent?: React.ReactNode; // accepts JSX, not objects
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className="
        flex flex-col
        w-auto h-full min-h-0
        border border-[var(--gray-2)] rounded-lg bg-[var(--gray-2)]
        transition shadow-inner
      "
    >
      {/* Header */}
      <div className="relative flex items-center justify-center py-2 px-4">
        {/* Centered Icon + Title */}
        <div className="flex items-center gap-2 text-[var(--text-dk)] pointer-events-none">
          {/* <Icon className="w-5 h-5" /> */}
          <div className="flex items-center text-xl font-bold">
            {title}
          </div>
        </div>

        {/* Header Info Button (top-right) */}
        {infoContent && (
          <div className="absolute top-2 right-4 text-[var(--gray-10)]">
            <CardInfo content={infoContent} />
          </div>
        )}
      </div>

      <Divider color="var(--gray-5)" inset={6}/>

      <div
        className="
          relative flex flex-col gap-1
          p-1 pt-3 h-full
          rounded-lg
          overflow-hidden
        "
      >
        {/* Subheader (ACTIONS ONLY) */}
        {actions && (
          <>
            <div className="flex justify-between items-center gap-2">
              {actions}
            </div>
          </>
        )}

        {/* Content */}
        <div
          className="
            relative flex flex-col flex-1 gap-3
            min-h-0 rounded-lg
            overflow-x-hidden overflow-y-auto
            snap-y snap-mandatory
          "
        >
          {/* <div className="pb-[50px] rounded-sm overflow-y-auto overflow-x-hidden"> */}
            {children}
          {/* </div> */}
        </div>
        <GradientHint fromColor="var(--gray-4)" extent="60px" radius="sm"/>
      </div>
    </div>
  );
}
