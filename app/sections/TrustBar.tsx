"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";

type ReviewsSlim = {
  rating: number | null;
  userRatingCount: number;
  googleMapsUri?: string | null;
};

function isReviewsSlim(x: unknown): x is ReviewsSlim {
  return (
    typeof x === "object" &&
    x !== null &&
    ("rating" in x ? (typeof (x as { rating: unknown }).rating === "number" || (x as { rating: unknown }).rating === null) : true) &&
    "userRatingCount" in x &&
    typeof (x as { userRatingCount: unknown }).userRatingCount === "number"
  );
}

export default function TrustBar(): JSX.Element {
  const [google, setGoogle] = useState<ReviewsSlim | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/google/reviews", { cache: "no-store" });
        const j: unknown = await r.json();
        if (!r.ok) throw new Error("fetch_failed");
        if (mounted && isReviewsSlim(j)) {
          setGoogle({ rating: j.rating ?? null, userRatingCount: j.userRatingCount, googleMapsUri: (j as any).googleMapsUri ?? null });
        } else if (mounted) {
          // payload complet: on extrait les champs utiles si présents
          const k = j as Record<string, unknown>;
          const rt = (typeof k.rating === "number" ? k.rating : null);
          const cnt = (typeof k.userRatingCount === "number" ? k.userRatingCount : 0);
          const uri = typeof k.googleMapsUri === "string" ? k.googleMapsUri : null;
          setGoogle({ rating: rt, userRatingCount: cnt, googleMapsUri: uri });
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "unknown_error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const googleText: JSX.Element =
    google?.rating != null ? (
      google.googleMapsUri ? (
        <a href={google.googleMapsUri} target="_blank" rel="noopener noreferrer" className="text-gold font-medium underline">
          ★★★★★ {google.rating.toFixed(1)}/5 (Google)
        </a>
      ) : (
        <span className="text-gold font-medium">★★★★★ {google.rating.toFixed(1)}/5 (Google)</span>
      )
    ) : error ? (
      <span>Avis Google</span>
    ) : (
      <span>Chargement…</span>
    );

  const items: ReadonlyArray<JSX.Element> = [
    googleText,
    <span key="projects">120+ projets livrés</span>,
    <span key="eco">Éco-responsable</span>,
    <span key="quote">Devis gratuit sous 24h</span>,
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        {items.map((element, idx) => (
          <div key={idx} className={idx === 0 ? "text-gold font-medium" : "text-foreground/90"}>
            {element}
          </div>
        ))}
      </div>
    </section>
  );
}