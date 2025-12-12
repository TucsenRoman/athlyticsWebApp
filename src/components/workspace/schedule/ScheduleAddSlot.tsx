"use client";

import { useState } from "react";
import { TimeRangeSelector } from "@/components/ui/forms/timeselector";
import {
  Check,
  Star,
  Flag,
  Trophy,
  Dumbbell,
  MapPin,
  Paperclip,
  RefreshCw,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const COLORS = [
  { id: "blue",   cn: "bg-[var(--fvr-blue-md)]" },
  { id: "slate",  cn: "bg-[var(--fvr-slate-md)]" },
  { id: "purple", cn: "bg-[var(--fvr-purple-md)]" },
  { id: "yellow", cn: "bg-[var(--fvr-yellow-md)]" },
  { id: "red",    cn: "bg-[var(--fvr-red-md)]" },
  { id: "coral",  cn: "bg-[var(--fvr-coral-md)]" },
  { id: "teal",   cn: "bg-[var(--fvr-teal-md)]" },
  { id: "green",  cn: "bg-[var(--fvr-green-md)]" },
];


const ICONS = [
  { id: "star", icon: <Star className="w-4 h-4" /> },
  { id: "flag", icon: <Flag className="w-4 h-4" /> },
  { id: "trophy", icon: <Trophy className="w-4 h-4" /> },
  { id: "dumbbell", icon: <Dumbbell className="w-4 h-4" /> },
];

const TEMPLATES: {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  start: string;
  end: string;
  location: string | null;
  attachment: string | null;
}[] = [
  {
    id: "template1",
    name: "Practice",
    title: "Practice",
    icon: "dumbbell",
    color: "blue",
    start: "3:30 PM",
    end: "5:00 PM",
    location: "HS Track",
    attachment: "Bring water and spikes.",
  },
  {
    id: "template2",
    name: "Meet",
    title: "Meet",
    icon: "flag",
    color: "red",
    start: "9:00 AM",
    end: "2:00 PM",
    location: null,
    attachment: "Bus leaves @ ",
  },
  {
    id: "template3",
    name: "Pasta Feed",
    title: "Pasta Feed",
    icon: "star",
    color: "purple",
    start: "6:00 PM",
    end: "8:00 PM",
    location: null,
    attachment: null,
  },
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ScheduleAddSlot({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("6:00 AM");
  const [end, setEnd] = useState("7:00 AM");

  const [timeMode, setTimeMode] = useState<"none" | "allDay" | null>(null);
  const [color, setColor] = useState("blue");
  const [icon, setIcon] = useState("star");

  const [location, setLocation] = useState("");
  const [attachment, setAttachment] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  const [templateApplied, setTemplateApplied] = useState<string | null>(null);
  const [hasModified, setHasModified] = useState(false);
  const [showTemplateSaveChooser, setShowTemplateSaveChooser] = useState(false);

  function markModified() {
    if (!hasModified) setHasModified(true);
    if (templateApplied) {
      setTemplateApplied(null);
      setSelectedTemplate(null);
      setPendingTemplateId(null);
    }
  }

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((tpl) => tpl.id === id);
    if (!t) return;

    setTitle(t.title);
    setIcon(t.icon);
    setColor(t.color);
    setStart(t.start);
    setEnd(t.end);

    setLocation(t.location ?? "");
    setAttachment(t.attachment ?? "");

    setTemplateApplied(id);
    setHasModified(false);
    setSelectedTemplate(id);
  }

  function updateTemplate(id: string) {
    const t = TEMPLATES.find((tpl) => tpl.id === id);
    if (!t) return;

    t.title = title;
    t.name = title.trim() || t.name;
    t.icon = icon;
    t.color = color;
    t.start = start;
    t.end = end;
    t.location = location || null;
    t.attachment = attachment || null;

    setHasModified(false);
    setShowTemplateSaveChooser(false);
  }

  function createNewTemplateFromCurrent() {
    const newId = "template_" + Math.random().toString(36).slice(2);

    TEMPLATES.push({
      id: newId,
      name: title.trim() || "Untitled",
      title,
      icon,
      color,
      start,
      end,
      location: location || null,
      attachment: attachment || null,
    });

    setSelectedTemplate(newId);
    setTemplateApplied(newId);
    setHasModified(false);
    setShowTemplateSaveChooser(false);
  }

  function parseTime(str: string) {
    const [hm, period] = str.split(" ");
    let [h, m] = hm.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }

  const isValid =
    title.trim() &&
    start &&
    end &&
    parseTime(start) < parseTime(end) &&
    selectedDays.length > 0;

  function handleAdd() {
    if (!isValid) return;

    const allDay = timeMode === "allDay";
    const noEnd = timeMode === "none";

    onSubmit({
      title,
      color,
      icon,
      selectedDays,
      repeatEnabled,
      start,
      end: noEnd || allDay ? null : end,
      allDay,
      noEnd,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[60vw] max-h-[90vh] flex flex-col">

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 flex flex-col gap-6">

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markModified();
            }}
            placeholder="Add title"
            className="w-full text-xl font-medium border-b border-gray-300 pb-1 focus:outline-none focus:border-blue-600"
          />

          {/* TEMPLATE SELECTOR */}
          <div className="flex flex-col gap-2 pb-2 border-b border-gray-200">
            <label className="text-xs font-medium text-gray-600">Templates</label>

            <div className="flex flex-wrap gap-2 items-center">
              {TEMPLATES.map((t) => {
                const selected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(t.id);
                      setPendingTemplateId(t.id);
                      setShowTemplateSaveChooser(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm border ${
                      selected
                        ? "bg-blue-600 text-white border-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>

            {pendingTemplateId && (
              <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <p className="text-[11px] text-gray-700">
                  Apply template “{TEMPLATES.find((tpl) => tpl.id === pendingTemplateId)?.name}”?
                </p>

                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    className="text-[11px] text-gray-600 hover:text-gray-800"
                    onClick={() => setPendingTemplateId(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="text-[11px] px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      applyTemplate(pendingTemplateId!);
                      setPendingTemplateId(null);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {hasModified && (
              <div className="flex flex-col gap-1 mt-1">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline w-fit"
                  onClick={() => setShowTemplateSaveChooser((p) => !p)}
                >
                  Save changes to template
                </button>

                {showTemplateSaveChooser && (
                  <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-xs">
                    <p className="font-medium mb-1 text-gray-800">Save changes to:</p>

                    <div className="flex flex-col gap-1 max-h-40 overflow-auto">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="w-full text-left py-1 px-1 rounded hover:bg-gray-100"
                          onClick={() => updateTemplate(t.id)}
                        >
                          {t.name}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="w-full text-left py-1 px-1 text-blue-600 rounded hover:bg-gray-100"
                        onClick={createNewTemplateFromCurrent}
                      >
                        + Save as new template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DAYS + TIME */}
          <div className="flex flex-col gap-4 pb-3 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-600">Day(s)</label>

              <div className="flex flex-wrap gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((label, idx) => {
                  const isSelected = selectedDays.includes(idx);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(idx)
                            ? prev.filter((x) => x !== idx)
                            : [...prev, idx]
                        );
                        markModified();
                      }}
                      className={`w-7 h-7 rounded-full text-[11px] flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-600 text-white border border-blue-700"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setRepeatEnabled((r) => !r);
                    markModified();
                  }}
                  className={`w-7 h-7 ml-1 rounded-full flex items-center justify-center ${
                    repeatEnabled
                      ? "bg-blue-600 text-white border border-blue-700"
                      : "border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TIME PICKER */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-min">
              <TimeRangeSelector
                start={start}
                end={end}
                onChangeStart={(v) => {
                  setStart(v);
                  markModified();
                }}
                onChangeEnd={(v) => {
                  setEnd(v);
                  markModified();
                }}
              />

              {/* TOGGLE BUTTONS */}
              <div className="hidden flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTimeMode(timeMode === "none" ? null : "none");
                    markModified();
                  }}
                  className={`flex items-center justify-between w-28 px-3 py-1.5 text-xs rounded-md border ${
                    timeMode === "none"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>No End</span>
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      timeMode === "none"
                        ? "bg-blue-600 border-blue-700"
                        : "bg-white border-gray-400"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeMode(timeMode === "allDay" ? null : "allDay");
                    markModified();
                  }}
                  className={`flex items-center justify-between w-28 px-3 py-1.5 text-xs rounded-md border ${
                    timeMode === "allDay"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>All Day</span>
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      timeMode === "allDay"
                        ? "bg-blue-600 border-blue-700"
                        : "bg-white border-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ICON + COLOR */}
          <div className="flex flex-col sm:flex-row gap-6 pb-3 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-600">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((ic) => {
                  const selected = icon === ic.id;
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => {
                        setIcon(ic.id);
                        markModified();
                      }}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {ic.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-600">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => {
                  const selected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setColor(c.id);
                        markModified();
                      }}
                      className={`flex justify-center items-center w-7 h-7 rounded-full ${c.cn}`}
                    >
                      {selected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                markModified();
              }}
              placeholder="Add location"
              className="flex-1 py-1.5 text-sm border-b border-gray-300 focus:border-blue-600"
            />
          </div>

          {/* ATTACHMENT */}
          <div className="flex items-center gap-3">
            <Paperclip className="w-5 h-5 text-gray-600" />
            <input
              value={attachment}
              onChange={(e) => {
                setAttachment(e.target.value);
                markModified();
              }}
              placeholder="Add description or attachment"
              className="flex-1 py-1.5 text-sm border-b border-gray-300 focus:border-blue-600"
            />
          </div>
        </div>

        {/* GRADIENT FADE */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-[50px] h-10 bg-gradient-to-t from-gray-100 via-white/95 to-white/30 z-20"></div>

        {/* STICKY FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-30">
          <button className="text-blue-600 text-sm">More options</button>

          <div className="flex gap-4 items-center">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>

            <button
              disabled={!isValid}
              onClick={handleAdd}
              className={`text-sm px-4 py-1.5 rounded-md transition ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
