// app/sections/Hero.tsx (SERVER COMPONENT)
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/baniere/baniere2-2560.avif"         // variante optimisée (AVIF)
          alt=""
          role="presentation"
          fill
          priority                           // eager + fetchPriority=high
          fetchPriority="high"
          // Largeur effective affichée : rarement >1536px, mais on couvre le 1920
          sizes="(min-width:1536px) 1536px, (min-width:1280px) 1280px, 100vw"
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADQAwCdASoYAA4APyV6tFGuJ6UisAgBwCSJbAAD5PiWrttJ3ZncUgAA/ZyAylS0Ei8h/FsKUIFF7DW+eO7J5JiQsjZ35cihlZs9EAL1P/nkYl6S67unPONbz8fzJOrIUnjt5AGXDQWj+sInZXwa+QHiNCtqEraUAtcmLHf2Fs3mk9ENpZM0nnQJc3KlOXfjesDEGsrQA0TriHIoW94G2fDbSz0cAA=="
          className="object-cover select-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      </div>

      {/* Sceau / logo */}
      <div className="absolute bottom-5 left-5 z-30 pointer-events-none select-none max-[380px]:hidden">
        <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-white/20 shadow-lg overflow-hidden">
          <Image
            src="/logo.png"
            alt=""
            role="presentation"
            fill
            className="object-contain p-1"
            sizes="(min-width:768px) 112px, 96px"
            priority={false}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-28 md:py-40">
        <h1 className="animate-fade-up text-3xl md:text-5xl font-semibold text-cream max-w-3xl">
          Transformons votre extérieur en un espace <span className="text-gold">vivant</span> et durable
        </h1>
        <p className="animate-fade-up-delay mt-4 text-cream/90 max-w-2xl">
          Création, aménagement, entretien : des jardins qui évoluent avec les saisons.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="#contact" className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-600 text-black px-6 py-3 font-medium transition-colors">
            Demander un devis
          </Link>
          <Link href="#projets" className="inline-flex items-center justify-center rounded-full border border-gold text-gold px-6 py-3 font-medium hover:bg-gold/10 transition-colors">
            Voir nos réalisations
          </Link>
        </div>
      </div>
    </section>
  );
}