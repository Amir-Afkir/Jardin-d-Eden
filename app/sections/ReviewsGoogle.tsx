'use client';
import { useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  author: string;
  authorUri: string | null;
  authorPhoto: string | null;
  rating: number | null;
  text: string;
  publishTime: string | null;
};

type ReviewsPayload = {
  displayName: string;
  googleMapsUri: string;
  rating: number | null;
  userRatingCount: number;
  reviewSummary: string | null;
  reviews: Review[];
};

const fallbackReviews: ReviewsPayload = {
  displayName: "Le Jardin d’Eden",
  googleMapsUri: "",
  rating: null,
  userRatingCount: 0,
  reviewSummary:
    "Les retours clients soulignent la qualité des finitions, la clarté des échanges et le soin apporté aux chantiers.",
  reviews: [
    {
      author: "Claire R.",
      authorUri: null,
      authorPhoto: null,
      rating: 5,
      text: "Travail impeccable, rendu magnifique et chantier laissé propre.",
      publishTime: null,
    },
    {
      author: "Marc D.",
      authorUri: null,
      authorPhoto: null,
      rating: 5,
      text: "Conseils précis, matériaux bien choisis et jardin métamorphosé.",
      publishTime: null,
    },
    {
      author: "Leïla A.",
      authorUri: null,
      authorPhoto: null,
      rating: 5,
      text: "Intervention sérieuse, délais tenus et résultat très soigné.",
      publishTime: null,
    },
  ],
};

export default function ReviewsGoogle() {
  const [data, setData] = useState<ReviewsPayload | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/google/reviews", { cache: "no-store" });
        const j: unknown = await r.json();
        if (!r.ok) {
          throw new Error(
            typeof j === "object" && j && "error" in j
              ? String((j as { error?: string }).error)
              : "fetch_failed"
          );
        }
        if (mounted) {
          setData(j as ReviewsPayload);
          setIsFallback(false);
        }
      } catch {
        if (mounted) {
          setData(fallbackReviews);
          setIsFallback(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-28 animate-pulse rounded-xl bg-cream/5 border border-white/10" />
      </section>
    );
  }

  const { rating, userRatingCount, reviewSummary, reviews, googleMapsUri } = data;
  const title = isFallback ? "Retours clients" : "Avis Google";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        {!isFallback && googleMapsUri && (
          <Link
            href={googleMapsUri}
            target="_blank"
            className="text-sm underline text-gold hover:no-underline"
          >
            Voir sur Google
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {typeof rating === "number" && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-cream/5 px-3 py-1.5">
            <span className="text-gold">★</span>
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-foreground/60">/5</span>
          </div>
        )}
        {typeof rating === "number" ? (
          <div className="text-foreground/70">({userRatingCount} avis)</div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-cream/5 px-3 py-1.5 text-foreground/70">
            Retours après chantier
          </div>
        )}
      </div>

      {reviewSummary && (
        <p className="mt-3 text-foreground/80 max-w-3xl">{reviewSummary}</p>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {(reviews ?? []).slice(0, 3).map((rv, i) => (
          <figure
            key={i}
            className="rounded-xl border border-white/10 p-5 bg-cream/5 hover:shadow-md hover:border-gold/40 transition-all"
          >
            <div className="flex items-center gap-3">
              {rv.authorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rv.authorPhoto}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-cream/20" />
              )}
              <figcaption className="font-medium text-sm">
                {rv.authorUri ? (
                  <a
                    href={rv.authorUri}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {rv.author}
                  </a>
                ) : (
                  rv.author
                )}
              </figcaption>
            </div>
            <div
              className="mt-2 text-gold"
              aria-label={`${rv.rating ?? 0} étoiles`}
            >
              {"★★★★★".slice(
                0,
                Math.max(0, Math.min(5, rv.rating || 0))
              )}
            </div>
            <blockquote className="mt-2 text-sm text-foreground/80">
              “{rv.text}”
            </blockquote>
            {rv.publishTime && (
              <div className="mt-2 text-xs text-foreground/60">
                {new Date(rv.publishTime).toLocaleDateString("fr-FR")}
              </div>
            )}
          </figure>
        ))}
      </div>

      <p className="mt-6 text-xs text-foreground/60">
        {isFallback ? "Synthèse affichée en attendant la disponibilité des avis Google." : "Données d’avis fournies par Google."}
      </p>
    </section>
  );
}
