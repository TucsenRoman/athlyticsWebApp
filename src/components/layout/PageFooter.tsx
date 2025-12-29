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

export type FooterSlot = "brand" | "links" | "legal";

interface PageFooterProps {
  brand?: ReactNode;
  links?: FooterGroup[];
  layout?: {
    brandPosition?: "top" | "left" | "right";
    linksPosition?: "col" | "row";
  };
  bottomBar?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* PAGE FOOTER                                                                */
/* -------------------------------------------------------------------------- */

export default function PageFooter({
  brand,
  links = [],
  layout = {
    brandPosition: "top",
    linksPosition: "col",
  },
  bottomBar,
}: PageFooterProps) {
  return (
    <div className="w-full border-t border-[var(--border)] bg-[var(--bg)]">
      {/* CONTENT */}
      <div
        className={`
          flex 
          p-4 w-full
          text-center
          ${layout.brandPosition === "top" ? "flex-col items-center" : "flex-row justify-around items-start gap-16"}
        `}
      >
        {/* BRAND SLOT */}
        {brand && (
          <div>
            {brand}
          </div>
        )}

        {/* LINK GROUPS */}
        <div
          className={`
            flex
            ${
              layout.linksPosition === "col"
                ? "flex-col items-center"
                : "flex-row"
            }
            gap-10
          `}
        >
          {links.map((group) => (
            <div key={group.key} className="flex flex-col gap-0.5">
              {group.title && (
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[--text-dark]">
                  {group.title}
                </h4>
              )}
              <Divider />
              <div className="flex flex-col items-center gap-1 text-xs text-[--text]">
                {group.items.map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      {bottomBar && (
        <>
          <Divider inset={5} />
          <div className="p-4 text-xs text-center text-[--text]">
            {bottomBar}
          </div>
        </>
      )}
    </div>
  );
}
