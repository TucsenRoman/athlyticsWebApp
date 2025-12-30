"use client";

import { X, Pencil, Trash2, MapPin } from "lucide-react";

interface SlotDetailsProps {
  isOpen: boolean;
  onClose: () => void;

  slot: {
    title: string;
    dateLabel: string;     // e.g. "Saturday, Dec 13"
    timeLabel: string;     // e.g. "9:00am – 6:00pm"
    color: string;         // tailwind color class, e.g. "bg-red-500"
    location?: string | null;
  };

  onEdit: () => void;
  onDelete: () => void;
}

export default function ScheduleSlotDetails({
  isOpen,
  onClose,
  slot,
  onEdit,
  onDelete,
}: SlotDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-[var(--surface)] text-[var(--text-dark)] rounded-xl w-[340px] shadow-xl p-4 relative">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${slot.color}`} />
            <h2 className="text-lg font-semibold">{slot.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--gray-lt)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DATE + TIME */}
        <div className="mt-2 text-sm text-[var(--text-muted)]">
          {slot.dateLabel} • {slot.timeLabel}
        </div>

        {/* LOCATION */}
        {slot.location && (
          <div className="flex items-center gap-2 mt-4 text-sm">
            <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
            <span>{slot.location}</span>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-[var(--gray-lt)]"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
