"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, ClipboardList, TrendingUp, Lock } from "lucide-react";

import { Button, Divider } from "@/components/ui";

export default function TrainingPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-dk)] overflow-y-auto">
      {/* HEADER */}
      <section className="px-6 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-medium text-[var(--dom-dk)] uppercase tracking-wide">
            Preview · In Development
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-6">
            Training
          </h1>

          <p className="text-lg text-[var(--text)] max-w-3xl">
            Training is the space where planning, execution, and long-term
            development connect. This preview shows the direction — structure,
            intent, and workflow — not final functionality.
          </p>
        </div>
      </section>

      <Divider inset={5} />

      {/* CONCEPT OVERVIEW */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              icon: ClipboardList,
              title: "Structured Planning",
              body:
                "Lay out workouts, drills, and sessions with clear intent instead of scattered notes or whiteboards.",
            },
            {
              icon: Dumbbell,
              title: "Execution Aware",
              body:
                "Training is designed to reflect what actually happens at practice, not just what was planned.",
            },
            {
              icon: TrendingUp,
              title: "Long-Term Context",
              body:
                "Connect daily sessions to seasonal goals so progress is visible over time, not guessed.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="border border-[var(--border)] rounded-[var(--radius)] p-8 bg-[var(--bg)]"
            >
              <c.icon className="w-5 h-5 text-[var(--dom-dk)] mb-4" />
              <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
              <p className="text-[var(--text)]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider inset={5} />

      {/* MOCK LAYOUT */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">
            Planned layout (conceptual)
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Training Blocks</h4>
              <ul className="space-y-3 text-sm text-[var(--text)]">
                <li>• Weekly structure</li>
                <li>• Session focus</li>
                <li>• Drill groupings</li>
                <li>• Load & intent notes</li>
              </ul>
            </div>

            {/* CENTER COLUMN */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Session Detail</h4>
              <div className="h-40 rounded-md bg-white/60 border border-dashed border-[var(--border)] flex items-center justify-center text-sm text-[var(--text-muted)]">
                Session layout preview
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Athlete Context</h4>
              <ul className="space-y-3 text-sm text-[var(--text)]">
                <li>• Attendance influence</li>
                <li>• Recent workload</li>
                <li>• Notes from practice</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Divider inset={5} />

      {/* PREVIEW NOTICE */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto border border-[var(--border)] rounded-[var(--radius)] p-10 bg-[var(--bg-gray-lt)]">
          <div className="flex items-start gap-4">
            <Lock className="w-5 h-5 text-[var(--text-muted)] mt-1" />
            <div>
              <h3 className="font-semibold mb-2">
                This is a concept preview
              </h3>
              <p className="text-sm text-[var(--text)]">
                Training is still in active development. This page demonstrates
                structure and direction, not final features. The live version
                will integrate directly with Radar and Workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--gray-dk)] text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Want to see what’s live?
            </h3>
            <p className="text-sm text-[var(--text-lt)]">
              Explore Radar and Workspace to see how Athlytics works today.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/radar")}
              className="border border-white/20 px-5 py-2.5 text-white"
            >
              Open Radar
            </Button>

            <Button
              onClick={() => navigate("/workspace")}
              className="bg-[var(--dom-dk)] px-5 py-2.5 text-white"
            >
              Open Workspace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
