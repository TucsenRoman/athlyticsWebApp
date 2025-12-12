"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pin,
} from "lucide-react";

import AttendanceCard from "@/features/attendance/views/AttendanceFieldView";
import NotesCard from "@/components/cards/fixed/NotesCard";
import MeetDayCard from "@/components/cards/fixed/MeetDayCard";
import WeatherCard from "@/components/cards/fixed/WeatherCard";
import CalendarCard from "@/components/cards/fixed/ScheduleCard";
import PostMeetSummaryCard from "@/components/cards/fixed/PostMeetSummaryCard";
import PerformanceSummaryCard from "@/components/cards/fixed/PerformanceSummaryCard";

const ALL_CARDS = [
  { id: "attendance", element: <AttendanceCard /> },
  { id: "notes", element: <NotesCard /> },
  // { id: "meet", element: <MeetDayCard /> },
  // { id: "weather", element: <WeatherCard /> },
  { id: "calendar", element: <CalendarCard /> },
  // { id: "postmeet", element: <PostMeetSummaryCard /> },
  // { id: "performance", element: <PerformanceSummaryCard /> },
];

const CARD_HEIGHT = "h-full";

/* ------------------------------------------------------- */
/* PIN BUTTON                                              */
/* ------------------------------------------------------- */

function PinButton({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-[5px] left-[10px] z-30 active:scale-90 transition p-2"
    >
      <Pin
        size={22}
        className={`transition-all duration-200 ${
          pinned ? "text-[var(--text-accent)] rotate-45 fill-[var(--accent-bg)]" : "text-[var(--gray-300)]"
        }`}
      />
    </button>
  );
}

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

/* ------------------------------------------------------- */
/* MAIN SYSTEM — 1 CARD PER PAGE                           */
/* ------------------------------------------------------- */

export default function FixedCardsSystem() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* Sort pinned cards */
  const sortedCards = useMemo(() => {
    const pinned = ALL_CARDS.filter((c) => pinnedIds.includes(c.id));
    const unpinned = ALL_CARDS.filter((c) => !pinnedIds.includes(c.id));
    return [...pinned, ...unpinned];
  }, [pinnedIds]);

  const totalCards = sortedCards.length;

  /* Toggle pin */
  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  /* Scroll to first on reorder */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    setCurrentIndex(0);
  }, [sortedCards]);

  /* Determine card index from scroll position */
  const onScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const width = container.clientWidth;

    const index = Math.round(container.scrollLeft / width);
    setCurrentIndex(Math.min(Math.max(0, index), totalCards - 1));
  };

  /* Scroll to card */
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;

    const safe = Math.min(Math.max(0, index), totalCards - 1);
    const width = scrollRef.current.clientWidth;

    scrollRef.current.scrollTo({
      left: safe * width,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full h-full">

      {/* GRADIENT EDGES */}
      {/* <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-30" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-30" /> */}

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="
          w-full h-full
          flex
          overflow-x-auto overflow-y-hidden
          snap-x snap-mandatory
          px-4
        "
      >
        {sortedCards.map((card) => {
          const pinned = pinnedIds.includes(card.id);

          return (
            <div
              key={card.id}
              className="
                shrink-0
                w-full
                snap-center
                px-2
              "
            >
              <div className={`${CARD_HEIGHT} rounded-xl overflow-hidden`}>
                <CardWithPin pinned={pinned} onToggle={() => togglePin(card.id)}>
                  {card.element}
                </CardWithPin>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div
        className="
          sticky
          bottom-[5px]
          z-30
          w-full
          flex
          justify-center
          pointer-events-none
        "
      >
        <div
          className="
            pointer-events-auto
            flex items-center gap-2
            px-4 py-2
            rounded-full
            bg-[var(--bg)]
            border border-[var(--border)]
            shadow-lg
          "
        >
          {/* First */}
          <button
            onClick={() => scrollToIndex(0)}
            className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition active:scale-95 text-neutral-700 dark:text-neutral-300"
          >
            <ChevronsLeft size={20} strokeWidth={2} />
          </button>

          {/* Prev */}
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition active:scale-95 text-neutral-700 dark:text-neutral-300"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Indicator */}
          <div className="flex items-center justify-center px-1 text-neutral-800 dark:text-neutral-200 font-semibold text-sm select-none">
            {currentIndex + 1}/{totalCards}
          </div>

          {/* Next */}
          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition active:scale-95 text-neutral-700 dark:text-neutral-300"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* Last */}
          <button
            onClick={() => scrollToIndex(totalCards - 1)}
            className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition active:scale-95 text-neutral-700 dark:text-neutral-300"
          >
            <ChevronsRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
