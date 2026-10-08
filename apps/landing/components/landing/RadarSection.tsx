export default function RadarSection() {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-6">
            Coaching doesn’t happen at a desk.
          </h2>

          <p className="text-lg text-(--text) mb-6">
            Athlytics is built for the moments where coaching actually happens —
            on the field, between reps, and in motion.
          </p>

          <p className="text-lg text-(--text)">
            See what’s happening and act with confidence.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-[var(--accent)]/10 blur-3xl rounded-full" />
          <img
            src="/images/coach-radar-pov.png"
            alt="Radar view on field"
            className="relative rounded-[var(--radius)] border border-[var(--border)] shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
