// app/api/tiktok/oembed/route.ts
type OEmbedResp = {
  html?: string;
  error?: string;
};
type FetchResult =
  | { ok: true; status: 200; body: OEmbedResp }
  | { ok: false; status: number; body: null };

async function fetchOEmbed(url: string): Promise<FetchResult> {
  const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
  if (!res.ok) return { ok: false as const, status: res.status, body: null };
  const body = (await res.json()) as OEmbedResp;
  return { ok: true as const, status: 200, body };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get("url");
  if (!t) return new Response("Missing url param", { status: 400 });
  const r = await fetchOEmbed(t);
  if (!r.ok) return new Response(null, { status: r.status });
  const data = r.body as OEmbedResp;
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}


// app/sections/TikTokGrid.tsx
"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/** ---------- Types ---------- */
export type TikTokItem = {
  id: string;
  url: string;
  thumb?: string;
  title?: string;
  published_at?: string;
  mp4?: string;
  poster?: string;
};
type ApiOk = { username: string; items: ReadonlyArray<TikTokItem>; count: number };
type ApiErr = { error: string; message?: string; status?: number };
type ApiResp = ApiOk | ApiErr;

/** ---------- Const ---------- */
const ASPECT = "9 / 16" as const;
const CARD_MAX_W = 320;

/** ---------- Utils ---------- */
const isErr = (r: ApiResp): r is ApiErr => "error" in r;
const isTikTok = (u: string): boolean => {
  try { return new URL(u).hostname.endsWith("tiktok.com"); } catch { return false; }
};
const vidId = (u: string): string | null => {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const i = parts.findIndex((x) => x === "video");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
};
const canEmbed = (u: string): boolean => /^\d+$/.test(vidId(u) ?? "");
const eq = (a: TikTokItem, b: TikTokItem): boolean =>
  a.id === b.id &&
  a.url === b.url &&
  a.poster === b.poster &&
  a.thumb === b.thumb &&
  a.title === b.title &&
  a.published_at === b.published_at;

const sig = (arr: ReadonlyArray<TikTokItem>): string => arr.map((x) => x.id).join("|");
const uniqById = (arr: ReadonlyArray<TikTokItem>): ReadonlyArray<TikTokItem> => {
  const seen = new Set<string>();
  const out: TikTokItem[] = [];
  for (const it of arr) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
};

/** ---------- Data fetch (cache API) ---------- */
async function fetchOnce(limit: number, etag: string, signal: AbortSignal): Promise<{
  items: ReadonlyArray<TikTokItem>;
  etag: string | null;
}> {
  const r = await fetch(`/api/tiktok/cache?limit=${limit}`, {
    cache: "no-store",
    signal,
    headers: etag ? { "If-None-Match": etag } : {},
  });
  if (r.status === 304) return { items: [], etag: etag || null };
  if (!r.ok) throw new Error(`http_${r.status}`);
  const j = (await r.json()) as ApiResp;
  if (isErr(j)) throw new Error(j.error || "unknown_error");
  return { items: j.items.filter((i) => isTikTok(i.url)), etag: r.headers.get("ETag") };
}

/** ---------- Embed v2 (pas d'oEmbed, pas de script) ---------- */
const TikTokIframe = ({ id, title }: { id: string; title?: string }) => {
  const src = `https://www.tiktok.com/embed/v2/${id}`;
  return (
    <iframe
      src={src}
      title={title || "TikTok"}
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      allowFullScreen
      style={{ border: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
};

/** ---------- Card ---------- */
const Card = ({
  children,
  ariaLabel,
  containerRef,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <article
    ref={containerRef}
    className="w-full max-w-[320px] overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
    style={{ maxWidth: CARD_MAX_W }}
    aria-label={ariaLabel}
  >
    <div className="w-full" style={{ aspectRatio: ASPECT }}>
      {children}
    </div>
  </article>
);

const TikTokCardBase = ({ item }: { item: TikTokItem }) => {
  const id = useMemo(() => (canEmbed(item.url) ? vidId(item.url) : null), [item.url]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (id) {
    return (
      <Card ariaLabel={item.title || "Vidéo TikTok"} containerRef={containerRef}>
        <TikTokIframe id={id} title={item.title} />
      </Card>
    );
  }

  // Fallback : lien direct si l’ID est introuvable/non numérique
  return (
    <a
      href={item.url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      aria-label="Voir la vidéo sur TikTok"
      className="block w-full overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
      style={{ maxWidth: CARD_MAX_W }}
    >
      <div style={{ aspectRatio: ASPECT }} className="relative grid w-full place-items-center bg-foreground/5">
        {item.thumb ? (
          <Image
            src={item.thumb}
            alt={item.title || "Aperçu TikTok"}
            fill
            sizes="(max-width: 640px) 320px, 320px"
            className="object-cover"
            priority={false}
          />
        ) : (
          <span className="px-3 text-center text-xs text-foreground/60">Vidéo indisponible — ouvrir sur TikTok</span>
        )}
      </div>
    </a>
  );
};
const TikTokCard = memo(TikTokCardBase, (a, b) => eq(a.item, b.item));

/** ---------- Main Grid ---------- */
export default function TikTokGrid({
  initialItems = [] as ReadonlyArray<TikTokItem>,
}: {
  initialItems?: ReadonlyArray<TikTokItem>;
}) {
  const [items, setItems] = useState<ReadonlyArray<TikTokItem>>(initialItems);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(initialItems.length === 0);
  const last = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const needInit = initialItems.length === 0;

  const errMsg = (e: unknown) => (e instanceof Error ? e.message : "unknown_error");

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        setLoading(true);
        abortRef.current?.abort();
        const ctl = new AbortController();
        abortRef.current = ctl;

        const prev = typeof window !== "undefined" ? sessionStorage.getItem("tt-cache-etag") ?? "" : "";
        const { items: fresh, etag } = await fetchOnce(9, prev, ctl.signal);
        const freshUniq = uniqById(fresh);

        if (freshUniq.length === 0 && items.length > 0) {
          setErr(null);
          return;
        }
        if (freshUniq.length === 0 && items.length === 0) {
          if (typeof window !== "undefined") sessionStorage.removeItem("tt-cache-etag");
          const s2 = await fetchOnce(9, "", ctl.signal);
          if (!mounted) return;
          const s2Uniq = uniqById(s2.items);
          const g = s2Uniq.length > 0 ? sig(s2Uniq) : "";
          if (g !== last.current) {
            setItems(s2Uniq);
            last.current = g;
          }
          setErr(null);
          if (typeof window !== "undefined" && s2.etag) sessionStorage.setItem("tt-cache-etag", s2.etag);
          return;
        }

        if (!mounted) return;
        const g2 = freshUniq.length > 0 ? sig(freshUniq) : "";
        if (g2 !== last.current) {
          setItems(freshUniq);
          last.current = g2;
        }
        setErr(null);
        if (typeof window !== "undefined" && etag) sessionStorage.setItem("tt-cache-etag", etag);
      } catch (e) {
        if (mounted) setErr(errMsg(e));
      } finally {
        mounted && setLoading(false);
      }
    };

    if (needInit) void load();
    intervalId = setInterval(load, 2 * 60 * 60 * 1000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [needInit, items.length]);

  const some = items.length > 0;

  return (
    <section className="w-full">
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[480px] w-full max-w-[320px] animate-pulse rounded-xl bg-foreground/5" />
          ))}
        </div>
      )}

      {!loading && err && (
        <p className="text-sm text-red-500">
          TikTok indisponible : <span className="font-medium">{err}</span>
        </p>
      )}

      {!err && some && (
        <div className="grid grid-cols-1 justify-items-center gap-6 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 9).map((it) => (
            <div key={it.id} className="relative w-full max-w-[320px] rounded-xl overflow-hidden">
              <TikTokCard item={it} />
              <div className="absolute inset-0 rounded-xl border-2 border-foreground/30 pointer-events-none z-10" />
            </div>
          ))}
        </div>
      )}

      {!loading && !err && !some && (
        <p className="text-sm text-foreground/70">Aucune vidéo publique détectée.</p>
      )}

      <style jsx global>{`
        /* Conteneur responsive fixe l’aspect, l’iframe remplit tout */
        .tt-crop {
          position: relative;
          overflow: clip;
          background: #fff;
        }
        .tt-crop > * {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </section>
  );
}