import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { SavingsChecker } from "@/components/SavingsChecker";
import { ComingSoon } from "@/components/ComingSoon";
import { PollfishSurvey } from "@/components/PollfishSurvey";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <SavingsChecker />
        <ComingSoon />
        <PollfishSurvey />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
