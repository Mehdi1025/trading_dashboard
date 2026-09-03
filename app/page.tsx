import { LandingHero } from "@/components/landing-hero";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingSections } from "@/components/landing-sections";

export default function Home() {
  return (
    <div className="flex flex-col bg-[#060a0e]">
      <LandingNavbar />
      <LandingHero />
      <LandingSections />
    </div>
  );
}
