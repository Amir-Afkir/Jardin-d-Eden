'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type GoogleInfo = {
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
};

export default function Footer() {
  const [googleInfo, setGoogleInfo] = useState<GoogleInfo | null>(null);

  useEffect(() => {
    async function fetchGoogleInfo() {
      try {
        const res = await fetch("/api/google/reviews");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const { rating, userRatingCount, googleMapsUri } = data;
        setGoogleInfo({ rating, userRatingCount, googleMapsUri });
      } catch {
        setGoogleInfo(null);
      }
    }
    fetchGoogleInfo();
  }, []);

  return (
    <footer
      role="contentinfo"
      className="relative bg-background/85 border-t border-white/10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gold/30"
    >
      {/* Bloc principal */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start text-center md:text-left">
          {/* Identité & CTA */}
          <section className="md:col-span-4 order-1" aria-label="Identité">
            <h3 className="text-xl font-semibold text-gold">Le Jardin d’Eden</h3>
            <p className="mt-1 text-sm text-foreground/70">SIRET 940 465 297 00015</p>
            <p className="text-sm text-foreground/70">Orléans & alentours</p>
            <div className="pt-4">
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                Demander un devis
              </Link>
            </div>
          </section>

          {/* Navigation Légal */}
          <nav
            className="md:col-span-3 order-2 text-sm grid grid-cols-1 gap-2"
            aria-label="Liens légaux"
          >
            <span className="text-foreground/60 uppercase tracking-wide text-[11px]">Légal</span>
            <Link href="/mentions-legales" className="hover:text-gold transition-colors">Mentions légales</Link>
            <Link href="/conditions" className="hover:text-gold transition-colors">Conditions d’utilisation</Link>
            <Link href="/confidentialite" className="hover:text-gold transition-colors">Confidentialité</Link>
          </nav>

          {/* Navigation Site */}
          <nav
            className="md:col-span-3 order-3 text-sm grid grid-cols-1 gap-2"
            aria-label="Plan du site"
          >
            <span className="text-foreground/60 uppercase tracking-wide text-[11px]">Site</span>
            <Link href="/#services" className="hover:text-gold transition-colors">Services</Link>
            <Link href="/#projets" className="hover:text-gold transition-colors">Réalisations</Link>
            <Link href="/#process" className="hover:text-gold transition-colors">Process</Link>
            <Link href="/#zone" className="hover:text-gold transition-colors">Zone d’intervention</Link>
            <Link href="/#contact" className="hover:text-gold transition-colors">Contact</Link>
          </nav>

          {/* Logo signature – grand, colonne droite */}
          <div className="md:col-span-2 order-0 md:order-4 mx-auto md:justify-self-end self-start">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-black/25 backdrop-blur-sm ring-1 ring-white/20 shadow-xl overflow-hidden">
              <Image
                src="/logo.svg"
                alt="Le Jardin d’Eden"
                fill
                className="object-contain p-2"
                sizes="(min-width: 768px) 112px, 96px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs md:text-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-foreground/60 text-center md:text-left">
          <div className="order-2 md:order-1">© {new Date().getFullYear()} Le Jardin d’Eden — Tous droits réservés</div>
          <div className="order-1 md:order-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Devis gratuit sous 24h
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              120+ projets livrés
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {googleInfo ? (
                <Link
                  href={googleInfo.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  ★★★★★ {googleInfo.rating.toFixed(1)}/5 (Google)
                </Link>
              ) : (
                <span>Chargement des avis...</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}