"use client";

import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-32 bg-[var(--bg-gray-dk)] text-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <button
          onClick={() => router.push("/app")}
          className="border border-white/10 rounded-[var(--radius)] p-10"
        >
          Explore Athlytics
        </button>

        <button
          onClick={() => router.push("/login")}
          className="bg-[var(--accent)] rounded-[var(--radius)] p-10"
        >
          Sign In or Create Account
        </button>
      </div>
    </section>
  );
}
