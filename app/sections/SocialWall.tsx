// app/sections/SocialWall.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// Chargement dynamique pour éviter de bloquer le SSR avec l'embed TikTok
const TikTokGrid = dynamic(() => import("./TikTokGrid"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div
          key={String(i)}
          className="w-full max-w-[320px] h-[480px] rounded-xl bg-cream/5 animate-pulse"
        />
      ))}
    </div>
  ),
});

export default function SocialWall() {
  return (
    <section id="social" className="bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">En ce moment</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Un aperçu des dernières publications.
            </p>
          </div>
          <Link
            href="#social"
            prefetch={false}
            className="text-sm underline text-gold hover:no-underline"
            aria-label="Voir tout le flux social"
          >
            Tout voir
          </Link>
        </div>

        <div className="mt-8">
          <TikTokGrid />
        </div>
      </div>
    </section>
  );
}