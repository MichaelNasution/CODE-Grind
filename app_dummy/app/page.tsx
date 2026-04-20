import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import ScrollSection from "@/components/ScrollSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="divider" style={{ maxWidth: "1200px", margin: "0 auto" }} />
      <BentoGrid />
      <ScrollSection />
      <Footer />
    </main>
  );
}
