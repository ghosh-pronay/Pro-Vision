import {
  Navbar,
  Hero,
  Features,
  CoachSection,
  Stats,
  WellbeingSection,
  Pricing,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Landing() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CoachSection />
        <Stats />
        <WellbeingSection />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
