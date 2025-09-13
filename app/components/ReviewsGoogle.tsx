"use client";
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

export default function ReviewsGoogle() {
  const [data, setData] = useState<ReviewsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/google/reviews", { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "fetch_failed");
        if (mounted) setData(j);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "unknown_error");
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (err) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Avis Google</h2>
        <p className="mt-2 text-sm text-foreground/70">Impossible d’afficher les avis pour le moment.</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-28 animate-pulse rounded-xl bg-cream/5 border border-white/10" />
      </section>
    );
  }

  const { rating, userRatingCount, reviewSummary, reviews, googleMapsUri } = data;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold">Avis Google</h2>
        {googleMapsUri && (
          <Link href={googleMapsUri} target="_blank" className="text-sm underline text-gold hover:no-underline">
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
        <div className="text-foreground/70">({userRatingCount} avis)</div>
      </div>

      {reviewSummary && (
        <p className="mt-3 text-foreground/80 max-w-3xl">{reviewSummary}</p>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {(reviews ?? []).slice(0, 3).map((rv, i) => (
          <figure key={i} className="rounded-xl border border-white/10 p-5 bg-cream/5">
            <div className="flex items-center gap-3">
              {rv.authorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rv.authorPhoto} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-cream/20" />
              )}
              <figcaption className="font-medium text-sm">
                {rv.authorUri ? (
                  <a href={rv.authorUri} target="_blank" rel="noreferrer" className="hover:underline">{rv.author}</a>
                ) : (
                  rv.author
                )}
              </figcaption>
            </div>
            <div className="mt-2 text-gold" aria-label={`${rv.rating ?? 0} étoiles`}>
              {"★★★★★".slice(0, Math.max(0, Math.min(5, rv.rating || 0)))}
            </div>
            <blockquote className="mt-2 text-sm text-foreground/80">“{rv.text}”</blockquote>
            {rv.publishTime && (
              <div className="mt-2 text-xs text-foreground/60">
                {new Date(rv.publishTime).toLocaleDateString("fr-FR")}
              </div>
            )}
          </figure>
        ))}
      </div>

      {/* Attribution Google discrète (obligatoire) */}
      <p className="mt-6 text-xs text-foreground/60">
        Données d’avis fournies par Google.
      </p>
    </section>
  );
}