"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import Auth from "./Auth";
import PageFooter from "@/components/layout/PageFooter";
import { Button, Divider } from "@/components/ui";
import radarImage from "@/assets/images/coach-radar-pov.png"
import workspaceImage from "@/assets/images/ChatGPT Image Dec 29, 2025, 01_48_48 PM.png"
import { Dumbbell, Globe, LayoutGrid, Link2, LocateFixed, MonitorSmartphone, PencilRuler, Smartphone, SmartphoneCharging, Sparkles, Users } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const year = new Date().getFullYear();
  const ctaRef = useRef<HTMLDivElement | null>(null);

  // VIEW CARDS
  const views = [
    {
      title: "Radar",
      icon: LocateFixed,
      body:
        "Designed for speed and awareness. Check attendance, confirm availability, and capture quick notes while practice or events are in motion.",
      status: "Available",
      route: "/radar",
    },
    {
      title: "Workspace",
      icon: PencilRuler,
      body:
        "The planning and management center of the program. Organize rosters, schedules, attendance history, and season-wide operations in one place.",
      status: "Available",
      route: "/workspace",
    },
    {
      title: "Training",
      icon: Dumbbell,
      body:
        "A dedicated space for planning workouts, tracking development, and connecting daily practice to long-term growth.",
      status: "In Development",
      route: "/preview/training",
    },
    // {
    //   title: "Discovery",
    //   icon: Sparkles,
    //   body:
    //     "Explore shared templates, workflows, and program structures to expand how your program operates over time.",
    //   status: "In Development",
    //   route: "/preview/discovery",
    // },
  ];

  /* AUTO REDIRECT */
  useEffect(() => {
    if (user) navigate("/radar");
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-dark)]">
      {/* HERO */}
      <section className="relative px-6 pt-32 pb-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,118,42,0.25),transparent_65%)]" />

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto"
        >
          The <span className="text-[--accent-md]">Coaching</span> platform
          <br />
          built for <span className="text-[--accent-md]">Reality</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mt-8 text-lg md:text-2xl max-w-2xl mx-auto text-[var(--text)]"
        >
          Athlytics replaces spreadsheets, notebooks, and disconnected tools 
          with one system that lets coaches coach.
        </motion.p>

        <div ref={ctaRef} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mt-12 flex justify-center gap-4 flex-wrap"
          >
            <Button
              variant="none"
              onClick={() => setShowAuth(true)}
              className="px-10 py-4 rounded-lg border border-[--border] text-lg text-[--accent] font-semibold shadow-sm"
            >
              Sign In or Up
            </Button>
            <Button
              variant="none"
              onClick={() => navigate("/radar")}
              className="px-10 py-4 rounded-lg bg-[--accent] text-lg text-white font-semibold shadow-md"
            >
              Explore without Sign Up
            </Button>
          </motion.div>
        </div>
      </section>

      <Divider inset={5} />

      {/* RADAR SECTION */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* COPY */}
            <div className="text-left">
              <h2 className="text-4xl font-bold mb-6">
                Coaching doesn’t happen at a desk.
              </h2>

              <p className="text-lg text-[var(--text)] mb-6">
                Athlytics is built for the moments where coaching actually happens — on the field, between reps, and in motion. 
                Those moments demand real-time decisions, and for that, the right information matters.
              </p>

              <p className="text-lg text-[var(--text)]">
                You don’t have to remember everything. You don’t have to piece things
                together. You can see what’s happening and act with confidence.
              </p>
            </div>

            {/* IMAGE */}
            {/* GENERATION PROMPT: generate an image of someone's pov using the app on their phone with a football turf field in the backdrop. should display the included image on the screen, make it a realism image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[var(--accent)]/10 blur-3xl rounded-full" />

              <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] shadow-2xl">
                <img
                  loading="lazy"
                  src={radarImage}
                  alt="Coach using Athlytics on the field during practice"
                  className="
                    w-full
                    aspect-[6/7]
                    object-cover
                    object-[50%_30%]
                  "
                />
              </div>

              {/* Caption */}
              <div className="mt-2 text-xs text-[--text] text-right">
                Example in-field usage · Radar (Mobile) view
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider inset={5} />

      {/* WORKSPACE SECTION */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* IMAGE */}
            {/* GENERATION PROMPT: generate an image of someone's pov using the app on their phone with a football turf field in the backdrop. should display the included image on the screen, make it a realism image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[var(--accent)]/10 blur-3xl rounded-full" />

              <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] shadow-2xl">
                <img
                  loading="lazy"
                  src={workspaceImage}
                  alt="Coach using Athlytics on the field during practice"
                  className="
                    w-full
                    aspect-[6/7]
                    object-cover
                    object-[50%_30%]
                  "
                />
              </div>

              {/* Caption */}
              <div className="mt-2 text-xs text-[--text] text-right">
                Example office planning · Workspace (Desktop) view
              </div>
            </div>

            {/* COPY */}
            <div className="text-left">
              <h2 className="text-4xl font-bold mb-6">
                Workspace is where the program comes together.
              </h2>

              <p className="text-lg text-[var(--text)] mb-6">
                Workspace is the planning engine behind Athlytics. It’s where schedules are
                built, rosters are organized, attendance history lives, and season-level
                decisions are made with clarity instead of scrambling.
              </p>

              <p className="text-lg text-[var(--text)] mb-6">
                Head coaches, assistants, and managers all work from the same system, with
                clearly defined roles and responsibilities. Everyone knows what they’re
                responsible for, where information lives, and how the program is moving
                forward.
              </p>

              <p className="text-lg text-[var(--text)]">
                No duplicated work. No scattered files. Just a single, structured workspace
                that keeps the season organized from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VIEWS */}
      <section className="py-28 bg-[--gray-lt]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-6">
            Built around how coaches actually work.
          </h2>

          <p className="text-lg text-[var(--text)] text-center max-w-3xl mx-auto mb-20">
            Athlytics is organized into clear operating modes — from real-time
            awareness on the field to structured planning off it — with more depth
            coming as the platform grows.
          </p>

          <div className="flex justify-center gap-4">
            {views.map((v) => {
              const isActive = v.status === "Available";

              return (
                <motion.div
                  key={v.title}
                  onClick={() => {
                    if (v.route) navigate(v.route);
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`
                    group
                    relative
                    bg-[var(--bg)]
                    border
                    border-[var(--border)]
                    rounded-[var(--radius)]
                    p-8
                    flex
                    flex-col
                    justify-between
                    cursor-pointer
                    hover:shadow-xl
                    active:shadow-lg
                    w-full
                    ${v.status === "In Development" ? "opacity-90" : ""}
                  `}
                >
                  {/* HEADER */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <v.icon
                        className={`
                          w-5 h-5
                          transition-colors
                          ${
                            v.status === "Available"
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-muted)] group-hover:text-[var(--accent)]"
                          }
                        `}
                      />
                      <h3 className="text-xl font-semibold">{v.title}</h3>
                    </div>

                    <p className="text-[var(--text)] mb-6">
                      {v.body}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        v.status === "Available"
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-muted)] group-hover:text-[var(--accent)]"
                      }`}
                    >
                      {v.status === "Available" ? "Live" : "Preview"}
                    </span>

                    {/* <span className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span> */}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-20">
            One platform for how programs actually run.
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Web App",
                icon: Globe,
                body:
                  "Runs entirely in the browser with no installs or downloads. Athlytics works anywhere you have an internet connection — on the field, in the office, or at home.",
              },
              {
                title: "Device Duality",
                icon: MonitorSmartphone,
                body:
                  "Designed to feel natural on both phones and desktops. Quick actions happen on mobile, while deeper planning and management live comfortably on larger screens.",
              },
              {
                title: "Program Roles",
                icon: Users,
                body:
                  "Designed for real teams with coaches, assistants, managers, athletes, and parents — each with clear roles and responsibilities.",
              },
              {
                title: "Connected by Design",
                icon: Link2,
                body:
                  "Attendance, schedules, training, and records stay linked across the season, eliminating scattered tools and lost context.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <f.icon className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                </div>

                <p className="text-[var(--text)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Decision Panel */}
      <section className="py-32 bg-[var(--bg-gray-dk)] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">

            {/* LEFT: EXPLORE */}
            <div className="relative border border-white/10 rounded-[var(--radius)] p-10 flex flex-col justify-between bg-white/5">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Explore the system
                </h3>
                <p className="text-sm text-[var(--text-light)] leading-relaxed">
                  Browse and interact with the Radar and Workspace views to get a feel for the future.
                </p>
              </div>
              <Button
                variant="none"
                onClick={() => navigate("/discovery")}
                className="mt-8 w-fit border border-[--border-dark] text-white px-6 py-2.5 rounded-md text-sm"
              >
                Explore Athlytics
              </Button>
              <span className="absolute bottom-5 left-12 text-xs text-[--accent]">No sign up required.</span>
            </div>

            {/* RIGHT: SIGN IN */}
            <div className="border border-white/10 rounded-[var(--radius)] p-10 flex flex-col justify-between bg-white/5">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Start running your program
                </h3>
                <p className="text-sm text-[var(--text-light)] leading-relaxed">
                  Sign in to build schedules, manage rosters, and organize the season
                  in one place.
                </p>
              </div>

              <Button
                variant="none"
                onClick={() => setShowAuth(true)}
                className="mt-8 w-fit bg-[var(--accent)] text-white px-6 py-2.5 rounded-md text-sm"
              >
                Sign In or Create Account
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <PageFooter
        groups={[
          {
            key: "brand",
            items: [
              <h3
                key="name"
                className="text-lg font-bold text-[var(--text-dark)]"
              >
                Athlytics
              </h3>,
              <p key="tagline" className="text-sm max-w-md mx-auto">
                A coaching platform built to replace spreadsheets, memory, and
                disconnected tools with clarity and structure.
              </p>,
            ],
          },

          {
            key: "product",
            title: "Product",
            items: [
              <button
                key="radar"
                className="text-sm hover:text-[var(--text-dark)]"
                onClick={() => navigate("/radar")}
              >
                Radar
              </button>,
              <button
                key="workspace"
                className="text-sm hover:text-[var(--text-dark)]"
                onClick={() => navigate("/workspace")}
              >
                Workspace
              </button>,
              <button
                key="discovery"
                className="text-sm hover:text-[var(--text-dark)]"
                onClick={() => navigate("/discovery")}
              >
                Discovery
              </button>,
            ],
          },

          {
            key: "access",
            title: "Access",
            items: [
              <button
                key="auth"
                className="text-sm hover:text-[var(--text-dark)]"
                onClick={() => setShowAuth(true)}
              >
                Log In / Sign Up
              </button>,
              <p key="public-note" className="text-xs max-w-md mx-auto">
                Public discovery is available without an account.
              </p>,
            ],
          },
        ]}
        bottomBar={
          <>© {year} Athlytics · Roman Forged LLC · Coach-First</>
        }
      />

      {/* ====================================================================== */}
      {/* AUTH MODAL                                                             */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
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
    </div>
  );
}
