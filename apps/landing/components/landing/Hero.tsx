"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative px-6 pt-32 pb-10 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,118,42,0.25),transparent_65%)]" />

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto"
      >
        The <span className="text-[--accent-md]">Coaching</span> platform
        <br />
        built for <span className="text-[--accent-md]">Reality.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mt-8 text-lg md:text-2xl max-w-2xl mx-auto text-[--text]"
      >
        Athlytics replaces spreadsheets, notebooks, and disconnected tools
        with one system that lets coaches coach.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mt-12 flex justify-center gap-4 flex-wrap"
      >
        <button
          onClick={() => router.push("/pricing")}
          className="px-10 py-4 rounded-lg border border-[--border] text-lg text-[--accent] font-semibold"
        >
          View Pricing
        </button>

        <button
          onClick={() => router.push("/app")}
          className="px-10 py-4 rounded-lg bg-[--accent] text-lg text-white font-semibold"
        >
          Explore Demo
        </button>
      </motion.div>
    </section>
  );
}
