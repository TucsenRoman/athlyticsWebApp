"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Users, BarChart3, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      {/* HERO */}
      <section className="w-full flex flex-col items-center text-center px-6 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Built for Coaches.  
          <br />
          Made for Real Athletics.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-lg md:text-xl mb-10 text-neutral-600 dark:text-neutral-300"
        >
          Athlytics is a modern coaching platform for tracking athletes, 
          managing meets, logging performance, and running your program — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Link
            to="/signup"
            className="
              bg-orange-600 text-white font-semibold
              px-8 py-3 rounded-xl
              hover:bg-orange-700 transition
            "
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="
              border border-neutral-300 dark:border-neutral-700
              text-neutral-900 dark:text-neutral-50
              px-8 py-3 rounded-xl
              hover:bg-neutral-200 dark:hover:bg-neutral-800
              transition
            "
          >
            Log In
          </Link>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="w-full px-6 py-24 bg-white dark:bg-neutral-950">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Why Coaches Choose Athlytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
            <Trophy className="w-10 h-10 mb-4 text-orange-600" />
            <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              View PRs, SBs, meet summaries, attendance logs, and athlete history instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
            <ClipboardList className="w-10 h-10 mb-4 text-orange-600" />
            <h3 className="text-xl font-semibold mb-2">Customizable Ledgers</h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Build sheets for stats, attendance, training cycles, and more with flexible templates.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
            <Users className="w-10 h-10 mb-4 text-orange-600" />
            <h3 className="text-xl font-semibold mb-2">Program Management</h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Easily manage teams, athletes, meets, rosters, and coaching staff.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
            <BarChart3 className="w-10 h-10 mb-4 text-orange-600" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Insights</h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Mobile-first FieldView gives you instant data during practice or meets.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-10 text-center text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} Athlytics • Built for coaches.
      </footer>
    </div>
  );
}
