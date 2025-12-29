"use client";

import { ReactNode } from "react";
import { Divider } from "../ui";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface FooterGroup {
  key: string;
  title?: string;
  items: ReactNode[];
}

interface PageFooterProps {
  groups: FooterGroup[];
  bottomBar?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* PAGE FOOTER                                                                */
/* -------------------------------------------------------------------------- */

export default function PageFooter({
  groups,
  bottomBar,
}: PageFooterProps) {
  return (
    <div
      className="
        w-full
        border-t border-[var(--border)]
        bg-[var(--bg)]
        text-[var(--text)]
      "
    >
      {/* CONTENT */}
      <div
        className="
          max-w-3xl
          mx-auto
          px-6
          pt-12
          pb-8
          flex
          flex-col
          items-center
          text-center
          space-y-10
        "
      >
        {groups.map((group) => (
          <div key={group.key} className="space-y-4">
            {group.title && (
              <h4
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-[var(--text-dark)]
                "
              >
                {group.title}
              </h4>
            )}

            <div className="flex flex-col items-center space-y-2">
              {group.items.map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {bottomBar && (
        <>
          <Divider inset={5} />

          <div
            className="
                w-full p-4
                text-xs text-center text-[var(--text)]
            "
          >
            {bottomBar}
          </div>
        </>
      )}
    </div>
  );
}
