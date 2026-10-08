export default function WorkspaceSection() {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <img
          src="/images/workspace.png"
          alt="Workspace view"
          className="rounded-[var(--radius)] border border-[var(--border)] shadow-2xl"
        />

        <div>
          <h2 className="text-4xl font-bold mb-6">
            Workspace brings the program together.
          </h2>

          <p className="text-lg text-[var(--text)] mb-6">
            Schedules, rosters, attendance, and season decisions —
            all in one place.
          </p>

          <p className="text-lg text-[var(--text)]">
            No scattered files. No duplicated work.
          </p>
        </div>
      </div>
    </section>
  );
}
