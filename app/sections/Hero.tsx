// app/sections/Hero.tsx (SERVER COMPONENT)
import Image from "next/image";
import { Button } from "@/app/components/ui/Button";
import { ParallaxBanner } from "../components/ParallaxBanner";

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Background image */}
        <div className="absolute inset-0 z-0 pointer-events-none contain-paint">
        <ParallaxBanner speed={0.48} maxShift={56}>
            <Image
            src="/baniere/baniere2-2560.avif"
            alt=""
            fill
            priority
            quality={70}
            sizes="(min-width:1280px) 1152px, (min-width:1024px) 1024px, 100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230b0b0b'/><stop offset='100%' stop-color='%23131313'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/></svg>"
            className="object-cover select-none"
            draggable={false}
            />
            <div className="absolute inset-0 bg-black/40 sm:bg-black/35 lg:bg-black/30" aria-hidden="true" />
        </ParallaxBanner>
        </div>

      {/* Sceau / logo – version premium */}
      <div className="absolute z-30 select-none max-[380px]:hidden left-[max(theme(spacing.5),env(safe-area-inset-left))] bottom-[max(theme(spacing.5),env(safe-area-inset-bottom))]">
        <div className="relative h-24 w-24 md:h-28 md:w-28">
          {/* Halo radial doux (doré) */}
          <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgba(216,178,110,0.18),transparent_70%)] blur-md"></div>
          {/* Liseré conique animé très subtil (gold→vert) */}
          <div aria-hidden className="pointer-events-none absolute -inset-1 rounded-full opacity-40 bg-[conic-gradient(from_0deg,rgba(216,178,110,0.00),rgba(216,178,110,0.35),rgba(31,161,90,0.25),rgba(216,178,110,0.00))] motion-safe:animate-[spin_14s_linear_infinite] motion-reduce:animate-none will-change-[transform,opacity] transform-gpu"></div>

          {/* Médaillon */}
          <div className="relative h-full w-full rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-white/20 outline outline-1 outline-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
            <Image
              src="/logo.svg"
              alt=""
              fill
              className="object-contain p-1"
              sizes="(min-width:768px) 112px, 96px"
              priority={false}
            />
          </div>

          {/* Lueur respirante très légère (accessibilité: décorative) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full motion-safe:animate-pulse motion-reduce:animate-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(31,161,90,0.25),transparent_60%)] will-change-[transform,opacity] transform-gpu"></div>
        </div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-28 md:py-40">
        <h1 id="hero-title" className="motion-safe:animate-fade-up motion-reduce:animate-none text-3xl md:text-5xl font-semibold text-cream max-w-3xl">
          Transformons votre extérieur en un espace <span className="text-gold">vivant</span> et durable
        </h1>
        <p className="motion-safe:animate-fade-up-delay motion-reduce:animate-none mt-4 text-cream/90 max-w-2xl">
          Création, aménagement, entretien : des jardins qui évoluent avec les saisons.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button as="link" href="#contact" ariaLabel="Demander un devis pour un aménagement paysager" variant="primary">Demander un devis</Button>
          <Button as="link" href="#projets" ariaLabel="Voir les réalisations Jardin d’Eden" variant="outline">Voir nos réalisations</Button>
        </div>
      </div>
    </section>
  );
}