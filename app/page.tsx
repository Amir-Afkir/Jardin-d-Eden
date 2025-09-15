// app/page.tsx

import Hero from "./sections/Hero";
import TrustBar from "./sections/TrustBar";
import Services from "./sections/Services";
import ProjectsTeaser from "./sections/ProjectsTeaser";
import BeforeAfter from "./sections/BeforeAfter";
import Process from "./sections/Process";
import SocialWall from "./sections/SocialWall";
import Coverage from "./sections/Coverage";
import ReviewsGoogle from "./sections/ReviewsGoogle"
import Testimonials from "./sections/Testimonials";
import ContactCTA from "./sections/ContactCTA";

// (optionnel) metadata
export const dynamic = "force-static"; // ou "auto" selon ton besoin

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Réserve l’espace du header en mobile */}
      <main className="pt-28 md:pt-16">
        <Hero />
        <TrustBar />
        <Services />
        <ProjectsTeaser />
        <BeforeAfter />
        <Process />
        <SocialWall />
        <Coverage />
        <ReviewsGoogle />
        <Testimonials />
        <ContactCTA />
      </main>
    </div>
  );
}