"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LocateFixed, PencilRuler, Dumbbell } from "lucide-react";

const views = [
  {
    title: "Radar",
    icon: LocateFixed,
    status: "Available",
    route: "/app/radar",
  },
  {
    title: "Workspace",
    icon: PencilRuler,
    status: "Available",
    route: "/app/workspace",
  },
  {
    title: "Training",
    icon: Dumbbell,
    status: "In Development",
  },
];

export default function ViewsSection() {
  const router = useRouter();

  return (
    <section className="py-28 bg-[--gray-lt]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Built around how coaches work.
        </h2>

        <div className="flex justify-center gap-4 mt-12">
          {views.map((v) => (
            <motion.div
              key={v.title}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => v.route && router.push(v.route)}
              className="cursor-pointer bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full"
            >
              <v.icon className="w-5 h-5 text-[var(--accent)] mb-3" />
              <h3 className="text-xl font-semibold">{v.title}</h3>
              <span className="text-xs text-[var(--text-muted)]">
                {v.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
