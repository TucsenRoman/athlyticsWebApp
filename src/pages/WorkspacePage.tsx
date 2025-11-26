"use client";

export default function WorkspacePage() {
  return (
    <div
      className="
        flex h-full w-full overflow-hidden 
        bg-[--surface-0] text-[--text-1]
        backdrop-blur-2xl
        selection:bg-white/10
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* LEFT SIDEBAR — premium glass panel */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className="
          w-64 h-full flex flex-col gap-10 p-7
          rounded-r-[2rem]
          bg-white/30 dark:bg-white/5 
          backdrop-blur-3xl
          border border-white/40 dark:border-white/10
          shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]
        "
      >
        {/* Current Ledger */}
        <section>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60 mb-4">
            Current Ledger
          </div>

          <div className="flex flex-col gap-3.5">
            {Array.from({ length: 8 }, (_, i) => `L1R${i + 1}`).map((item) => (
              <button
                key={item}
                className="
                  group w-full
                  p-3 rounded-2xl text-left
                  bg-white/55 dark:bg-white/10
                  border border-white/30 dark:border-white/5
                  backdrop-blur-xl
                  shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                  transition-all
                  hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]
                  hover:bg-white/65 dark:hover:bg-white/20 
                  hover:translate-x-[2px]
                "
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[13px] tracking-wide">
                    {item}
                  </span>
                  <span className="text-[11px] opacity-50 group-hover:opacity-70">
                    Open
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Other Ledgers */}
        <section>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60 mb-4">
            Other Ledgers
          </div>

          <div
            className="
              p-5 rounded-2xl text-sm
              bg-white/35 dark:bg-white/10
              border border-white/20 dark:border-white/5
              backdrop-blur-xl
              shadow-[0_6px_18px_rgba(0,0,0,0.08)]
              opacity-60
            "
          >
            None
          </div>
        </section>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT — airy, cinematic layout */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex flex-col flex-1 overflow-hidden px-16 py-12">

        {/* Header Tabs */}
        <div className="flex gap-4 mb-14">
          {["L1H1", "L1H2", "L1H3", "L1H4", "L1H5"].map((header) => (
            <button
              key={header}
              className="
                px-7 py-2.5 rounded-full 
                bg-white/40 dark:bg-white/10
                backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_8px_24px_rgba(0,0,0,0.14)]
                text-[13px] font-medium tracking-wide
                transition-all
                hover:bg-white/55 dark:hover:bg-white/20
                hover:shadow-[0_12px_32px_rgba(0,0,0,0.20)]
                hover:scale-[1.05]
              "
            >
              {header}
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-16">

          {/* L1–L4 grid */}
          <div className="grid grid-cols-4 gap-5 mb-14">
            {["L1", "L2", "L3", "L4"].map((item) => (
              <button
                key={item}
                className="
                  p-5 rounded-2xl
                  text-[14px] font-semibold tracking-wide
                  bg-white/45 dark:bg-white/10
                  border border-white/30 dark:border-white/10
                  backdrop-blur-xl
                  shadow-[0_8px_22px_rgba(0,0,0,0.12)]
                  transition-all
                  hover:bg-white/60 dark:hover:bg-white/20
                  hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
                  hover:scale-[1.04]
                "
              >
                {item}
              </button>
            ))}
          </div>

          {/* Bottom Glass Panel */}
          <div
            className="
              max-w-2xl p-10 rounded-[2.2rem]
              bg-white/40 dark:bg-white/10
              backdrop-blur-2xl
              border border-white/30 dark:border-white/10
              shadow-[0_28px_70px_-12px_rgba(0,0,0,0.32)]
              mx-auto
            "
          >
            <div className="font-semibold mb-7 text-[13px] tracking-wider opacity-70">
              Bottom Menu
            </div>

            <div className="grid grid-cols-2 gap-5 text-[14px] font-medium">
              {[
                "Open Ledger",
                "Create New Ledger",
                "Manage Routes",
                "Close Ledger",
                "Delete Ledger",
                "Permissions",
              ].map((item) => (
                <button
                  key={item}
                  className="
                    p-5 rounded-2xl text-center
                    bg-white/55 dark:bg-white/10
                    border border-white/20 dark:border-white/10
                    backdrop-blur-xl
                    shadow-[0_10px_28px_rgba(0,0,0,0.15)]
                    tracking-wide
                    transition-all
                    hover:bg-white/65 dark:hover:bg-white/20
                    hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]
                    hover:scale-[1.03]
                  "
                >
                  {item}
                </button>
              ))}

              <button
                className="
                  col-span-2 p-5 rounded-2xl text-center
                  bg-white/55 dark:bg-white/10
                  border border-white/20 dark:border-white/10
                  backdrop-blur-xl
                  shadow-[0_10px_28px_rgba(0,0,0,0.15)]
                  tracking-wide
                  transition-all
                  hover:bg-white/65 dark:hover:bg-white/20
                  hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]
                  hover:scale-[1.03]
                "
              >
                Style
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
