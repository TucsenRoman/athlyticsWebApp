"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import Auth from "./Auth";

export default function Home() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  /* AUTO-REDIRECT WHEN USER LOGS IN */
  useEffect(() => {
    if (user) navigate("radar");
  }, [user, navigate]);

  /* ---------------------------------------------------------------------- */
  /*  PUBLIC HOME                                                           */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 overflow-auto">

      {/* HERO */}
      <section className="relative w-full flex flex-col items-center text-center px-6 pt-28 pb-32 overflow-hidden">

        {/* BG Glow */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,143,0,0.35),rgba(0,0,0,0.85))]"
          animate={{ opacity: [0.5, 0.65, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {/* Subtle BG Image */}
        <motion.div
          className="absolute inset-0 opacity-[0.1] bg-[url('/AthlyticsFillerBg5.png')] bg-cover bg-center"
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
          className="
            relative max-w-2xl mt-8 text-lg md:text-2xl
            text-white
            drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]
          "
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
          Log In / Sign Up
        </motion.button>
      </section>

      {/* DEMO PREVIEW — DESKTOP ONLY */}
      <section className="hidden lg:block py-24 bg-neutral-100 dark:bg-neutral-950">
        <h2 className="text-center text-3xl font-bold mb-14">
          From the infield to the office, your workflow stays seamless.
        </h2>

        {/* <div className="flex justify-center">
          <DemoAppPreview />
        </div> */}
      </section>


      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed inset-0 z-[9999]
              bg-black/70 backdrop-blur-sm
              flex justify-center items-center px-4
            "
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Auth />
            </motion.div>
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
