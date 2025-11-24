"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Auth from "./Auth";
import DemoAppPreview from "@/components/demo/DemoPreview";

export default function Home() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  /* LOGGED IN HOME */
  if (user) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome Back, Coach.</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
          Let’s pick up where you left off.
        </p>

        <div className="flex gap-4">
          <Link
            to="/fieldview"
            className="bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-700"
          >
            Open FieldView
          </Link>

          <Link
            to="/ledger"
            className="border border-neutral-300 dark:border-neutral-700 px-8 py-3 rounded-xl text-neutral-900 dark:text-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            Ledgers
          </Link>
        </div>

        <button
          onClick={signOut}
          className="mt-6 text-sm text-red-500 hover:text-red-600 font-semibold"
        >
          Log Out
        </button>
      </div>
    );
  }

  /* PUBLIC HOME */
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">

      {/* HERO */}
      <section className="relative w-full flex flex-col items-center text-center px-6 pt-28 pb-32 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,143,0,0.35),rgba(0,0,0,0.85))]"
          animate={{ opacity: [0.5, 0.65, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 opacity-[0.1] bg-[url('/AthlyticsFillerBg5.png')] bg-cover bg-center"
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-5xl md:text-7xl font-black text-white drop-shadow-lg"
        >
          Coach Smarter.
          <br />
          React Faster.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mt-8 text-lg md:text-2xl text-white/90 drop-shadow"
        >
          Real-time attendance, weather, PR tracking, meet prep, athlete intel — 
          shown exactly how coaches use it.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => setShowAuth(true)}
          className="relative mt-10 bg-orange-600 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-orange-700 shadow-xl"
        >
          Get Started
        </motion.button>
      </section>

      {/* APP DEMO */}
      <section className="py-24 bg-neutral-100 dark:bg-neutral-950">
        <h2 className="text-center text-3xl font-bold mb-14">From the infield to the office, your workflow stays seamless.</h2>
        <div className="flex justify-center">
          <DemoAppPreview />
        </div>
      </section>

      {/* AUTH OVERLAY */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex justify-center px-4"
          >
            <div className="w-full max-w-lg mb-16">
              <Auth />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="py-10 text-center text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} Athlytics • Built for coaches.
      </footer>
    </div>
  );
}
