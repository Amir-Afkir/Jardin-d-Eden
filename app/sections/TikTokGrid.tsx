
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    tiktokEmbedLoaded?: () => void;
  }
}
export {};

export default function TikTokGrid() {
  const [items, setItems] = useState<{ id: string; url: string; embed?: string; cover?: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        setLoading(true);
        const r = await fetch("/api/tiktok", { cache: "no-store", credentials: "include" });
        const status = r.status;
        const j: { items?: { id: string; url: string; embed?: string; cover?: string }[]; error?: string } = await r.json();

        if (!r.ok) {
          const msg = j?.error || (status === 401 ? "not_connected" : "fetch_failed");
          throw new Error(msg);
        }

        if (mounted) {
          setItems(j.items || []);
          setErr(null);
        }

        // hydrate embeds si le script est déjà chargé
        if (typeof window !== "undefined" && window.tiktokEmbedLoaded) {
          window.tiktokEmbedLoaded();
        }
      } catch (e) {
        if (mounted) setErr(e instanceof Error ? e.message : "unknown_error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 5 * 60 * 1000); // ⏱️ refresh auto

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* Ne charge le script d’embed que s’il y a des items sans embed */}
      {items.some((i) => !i.embed) && (
        <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
      )}

      {/* Message d’erreur + CTA connexion si 401 */}
      {err === "not_connected" && (
        <div className="text-sm text-foreground/70">
          TikTok non connecté.{" "}
          <a className="underline hover:text-gold transition-colors" href="/api/auth/tiktok">
            Connecter le compte TikTok
          </a>
        </div>
      )}
      {err && err !== "not_connected" && (
        <div className="text-sm text-red-400">TikTok indisponible : {err}</div>
      )}

      {/* Loader */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full max-w-[320px] h-[480px] rounded-xl bg-cream/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Contenu TikTok */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
          {items.map(({ id, url, embed }) => (
            <div
              key={id}
              className="w-full max-w-[320px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {embed ? (
                <iframe
                  src={embed}
                  allow="autoplay; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ width: "100%", aspectRatio: "9 / 16", border: 0 }}
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <blockquote
                  className="tiktok-embed"
                  cite={url}
                  style={{ maxWidth: 320, minWidth: 260 }}
                >
                  <section>
                    <a target="_blank" rel="nofollow noopener noreferrer" href={url}>
                      {url}
                    </a>
                  </section>
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}