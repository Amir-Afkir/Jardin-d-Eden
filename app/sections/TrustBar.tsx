"use client";

import type { JSX } from "react";

export default function TrustBar(): JSX.Element {
  const items: ReadonlyArray<string> = [
    "★★★★★ 4,9/5 (Google)",
    "120+ projets livrés",
    "Éco-responsable",
    "Devis gratuit sous 24h",
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        {items.map((text) => (
          <div
            key={text}
            className={text.includes("★★★★★") ? "text-gold font-medium" : "text-foreground/90"}
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}