import { Globe, MonitorSmartphone, Users, Link2 } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {[Globe, MonitorSmartphone, Users, Link2].map((Icon, i) => (
          <div
            key={i}
            className="border border-[var(--border)] rounded-[var(--radius)] p-8"
          >
            <Icon className="w-5 h-5 text-[var(--accent)] mb-3" />
            <p className="text-[var(--text)]">
              Feature description
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
