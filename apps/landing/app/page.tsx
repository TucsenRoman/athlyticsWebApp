import Hero from "@/components/landing/Hero";
import RadarSection from "@/components/landing/RadarSection";
import WorkspaceSection from "@/components/landing/WorkspaceSection";
import ViewsSection from "@/components/landing/ViewsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-[--bg] text-[--text-dark]">
      <Hero />
      <RadarSection />
      <WorkspaceSection />
      <ViewsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
