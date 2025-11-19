"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pin,
} from "lucide-react";

import AttendanceCard from "@/components/cards/fixed/AttendanceCard";
import NotesCard from "@/components/cards/fixed/NotesCard";
import MeetDayCard from "@/components/cards/fixed/MeetDayCard";
import WeatherCard from "@/components/cards/fixed/WeatherCard";
import CalendarCard from "@/components/cards/fixed/CalendarCard";
import PostMeetSummaryCard from "@/components/cards/fixed/PostMeetSummaryCard";
import PerformanceSummaryCard from "@/components/cards/fixed/PerformanceSummaryCard";

const ALL_CARDS = [
  { id: "attendance", element: <AttendanceCard /> },
  { id: "notes", element: <NotesCard /> },
  { id: "meet", element: <MeetDayCard /> },
  { id: "weather", element: <WeatherCard /> },
  { id: "calendar", element: <CalendarCard /> },
  { id: "postmeet", element: <PostMeetSummaryCard /> },
  { id: "performance", element: <PerformanceSummaryCard /> },
];

const CARD_HEIGHT = "h-[70vh]";

/* -------------------------------------------------------------------------- */
/*  PIN BUTTON                                                                */
/* -------------------------------------------------------------------------- */

function PinButton({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-0 left-0 z-30 active:scale-90 transition p-2"
    >
      <Pin
        size={20}
        className={`transition-all duration-200 ${
          pinned ? "text-orange-400 rotate-45 fill-orange-400" : "text-neutral-300"
        }`}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  CARD WRAPPER                                                              */
/* -------------------------------------------------------------------------- */

function CardWithPin({
  children,
  pinned,
  onToggle,
}: {
  children: React.ReactNode;
  pinned: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative w-full h-full">
      <PinButton pinned={pinned} onToggle={onToggle} />
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MAIN SYSTEM                                                               */
/* -------------------------------------------------------------------------- */

export default function FixedCardsSystem() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* Sort pinned first */
  const sortedCards = useMemo(() => {
    const pinned = ALL_CARDS.filter((c) => pinnedIds.includes(c.id));
    const unpinned = ALL_CARDS.filter((c) => !pinnedIds.includes(c.id));
    return [...pinned, ...unpinned];
  }, [pinnedIds]);

  /* Toggle pin */
  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }, []);

  /* Auto scroll to top card when pinned */
  useEffect(() => {
    if (!scrollRef.current) return;

    // scroll to the first card AFTER reorder
    const container = scrollRef.current;
    const first = container.children[0] as HTMLElement;

    if (first) {
      first.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [sortedCards]);

  /* Scroll listener for index */
  const onScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    const scrollLeft = container.scrollLeft;
    const cardWidth = children[0]?.offsetWidth || 1;

    const index = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(Math.max(0, index), children.length - 1));
  };

  /* Scroll to index */
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    const safeIndex = Math.min(Math.max(0, index), children.length - 1);

    const card = children[safeIndex];
    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  RENDER                                                                */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="relative w-full h-full">

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-30" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-30" />

      {/* Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="
          w-full
          overflow-x-auto overflow-y-hidden
          py-4 px-4 pb-10
          scrollbar-none
          relative
          snap-x snap-mandatory
          flex
        "
      >
        {sortedCards.map((card) => {
          const isPinned = pinnedIds.includes(card.id);

          return (
            <div
              key={card.id}
              className="
                w-full
                shrink-0
                snap-center
                transition-all
                px-2
              "
            >
              <div className={`${CARD_HEIGHT} rounded-xl overflow-hidden`}>
                <CardWithPin pinned={isPinned} onToggle={() => togglePin(card.id)}>
                  {card.element}
                </CardWithPin>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Pagination */}
      <div
        className="
          fixed bottom-8 left-1/2 -translate-x-1/2
          z-50
        "
      >
        <div
          className="
            flex items-center gap-2
            p-3
            rounded-full
            backdrop-blur-3xl
            backdrop-saturate-150
            bg-accent/15 dark:bg-neutral-900/20
            shadow-lg shadow-black/10
          "
        >
          {/* First */}
          <button
            onClick={() => scrollToIndex(0)}
            className="
              rounded-full
              hover:bg-white/20 dark:hover:bg-white/10
              transition active:scale-95
              text-neutral-700 dark:text-neutral-300
            "
          >
            <ChevronsLeft size={20} strokeWidth={2} />
          </button>

          {/* Prev */}
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="
              rounded-full
              hover:bg-white/20 dark:hover:bg-white/10
              transition active:scale-95
              text-neutral-700 dark:text-neutral-300
            "
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Indicator */}
          <div
            className="
              flex flex-col items-center justify-center
              text-neutral-800 dark:text-neutral-200
              font-semibold text-sm select-none
              leading-tight
              px-1 w-[20px]
            "
          >
            <span>{currentIndex + 1}</span>
          </div>

          {/* Next */}
          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="
              rounded-full
              hover:bg-white/20 dark:hover:bg-white/10
              transition active:scale-95
              text-neutral-700 dark:text-neutral-300
            "
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* Last */}
          <button
            onClick={() => scrollToIndex(sortedCards.length - 1)}
            className="
              rounded-full
              hover:bg-white/20 dark:hover:bg-white/10
              transition active:scale-95
              text-neutral-700 dark:text-neutral-300
            "
          >
            <ChevronsRight size={20} strokeWidth={2} />
          </button>

        </div>
      </div>
    </div>
  );
}
