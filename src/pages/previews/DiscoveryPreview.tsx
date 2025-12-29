"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Compass,
  Package,
  Lock,
} from "lucide-react";

import { Button, Divider } from "@/components/ui";

export default function DiscoveryPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-dark)] overflow-y-auto">
      {/* HEADER */}
      <section className="px-6 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">
            Preview · In Development
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-6">
            Discovery
          </h1>

          <p className="text-lg text-[var(--text)] max-w-3xl">
            Discovery is where programs explore better ways to operate. This
            preview shows how coaches will browse templates, workflows, and
            shared systems — without building everything from scratch.
          </p>
        </div>
      </section>

      <Divider inset={5} />

      {/* CONCEPT OVERVIEW */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              icon: Compass,
              title: "Explore Structures",
              body:
                "Browse proven attendance systems, scheduling layouts, and organizational patterns used by other programs.",
            },
            {
              icon: Layers,
              title: "Adopt, Don’t Rebuild",
              body:
                "Discovery helps programs start with strong foundations instead of reinventing workflows every season.",
            },
            {
              icon: Package,
              title: "Expandable System",
              body:
                "Add new tools and structures as your program grows, without disrupting what already works.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="border border-[var(--border)] rounded-[var(--radius)] p-8 bg-[var(--bg)]"
            >
              <c.icon className="w-5 h-5 text-[var(--accent)] mb-4" />
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
            Planned browsing experience (conceptual)
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-3 text-sm text-[var(--text)]">
                <li>• Attendance systems</li>
                <li>• Scheduling layouts</li>
                <li>• Workflow packs</li>
                <li>• Program templates</li>
              </ul>
            </div>

            {/* CENTER */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Preview Panel</h4>
              <div className="h-40 rounded-md bg-white/60 border border-dashed border-[var(--border)] flex items-center justify-center text-sm text-[var(--text-muted)]">
                Template preview
              </div>
            </div>

            {/* RIGHT */}
            <div className="border border-[var(--border)] rounded-[var(--radius)] p-6 bg-[var(--bg-gray-lt)]">
              <h4 className="font-semibold mb-4">Details</h4>
              <ul className="space-y-3 text-sm text-[var(--text)]">
                <li>• What it adds</li>
                <li>• Who it’s for</li>
                <li>• How it integrates</li>
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
                Discovery is still in development. This page represents the
                intended browsing and expansion experience, not final content
                or availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--bg-gray-dk)] text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Want to see how Athlytics works today?
            </h3>
            <p className="text-sm text-[var(--text-light)]">
              Explore live views to understand the system before expanding it.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="none"
              onClick={() => navigate("/radar")}
              className="border border-white/20 px-5 py-2.5 text-white"
            >
              Open Radar
            </Button>

            <Button
              variant="none"
              onClick={() => navigate("/workspace")}
              className="bg-[var(--accent)] px-5 py-2.5 text-white"
            >
              Open Workspace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
