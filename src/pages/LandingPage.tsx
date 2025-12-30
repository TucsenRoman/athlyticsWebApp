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
import { Dumbbell, Globe, Link2, LocateFixed, MonitorSmartphone, PencilRuler, Sparkles, Users } from "lucide-react";

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
    <div className="min-h-screen w-full bg-transparent text-[var(--text-dark)]">
      {/* HERO */}
      <section className="
        relative
        px-6 pt-32 pb-10
        text-center
        overflow-hidden
        bg-[var(--bg)]
      ">
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
        layout={{
          brandPosition: "left",
          linksPosition: "row",
        }}
        brand={
          <>
            <h3 className="text-lg font-bold text-[var(--text-dark)]">
              Athlytics
            </h3>
            <p className="text-sm max-w-md mx-auto text-[var(--text-muted)]">
              Coach-first web application that keeps athletic programs organized—
              without spreadsheets, guesswork, or chaos.
            </p>
          </>
        }
        links={[
          // {
          //   key: "socials",
          //   title: "@athlytics",
          //   items: [
          //     <a
          //       key="youtube"
          //       href="https://www.x.com/@athlytics"
          //       target="_blank"
          //       rel="noopener noreferrer"
          //       aria-label="Athlytics on X"
          //     >
          //       <svg
          //         className="w-4 h-4"
          //         viewBox="0 0 640 640"
          //         fill="currentColor"
          //         aria-hidden
          //       >
          //         <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
          //       </svg>
          //     </a>,
          //     <a
          //       key="youtube"
          //       href="https://www.youtube.com/@athlytics"
          //       target="_blank"
          //       rel="noopener noreferrer"
          //       aria-label="Athlytics on YouTube"
          //     >
          //       <svg
          //         className="w-4 h-4"
          //         viewBox="0 0 640 640"
          //         fill="currentColor"
          //         aria-hidden
          //       >
          //         <path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"/>
          //       </svg>
          //     </a>,
          //     <a
          //       key="instagram"
          //       href="https://www.instagram.com/@athlytics"
          //       target="_blank"
          //       rel="noopener noreferrer"
          //       aria-label="Athlytics on Instagram"
          //     >
          //       <svg
          //         className="w-5 h-5"
          //         viewBox="0 0 640 640"
          //         fill="currentColor"
          //         aria-hidden
          //       >
          //         <path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/>                </svg>
          //     </a>,
          //   ],
          // },
          {
            key: "pricing",
            title: "Pricing",
            items: [
              <a key="free" href="/pricing?plan=free">Free</a>,
              <a key="pro" href="/pricing?plan=pro">Pro</a>,
              // <a key="enterprise" href="/pricing?plan=enterprise">Enterprise</a>,
            ],
          },       
          {
            key: "legal",
            title: "Legal",
            items: [
              <a key="privacy" href="/privacy">Privacy Policy</a>,
              <a key="terms" href="/terms">Terms of Service</a>,
              <a key="contact" href="/contact">Contact</a>,
            ],
          },
        ]}
        bottomBar={
          <>© 2025 Athlytics · Roman Forged LLC · Coach-First</>
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
