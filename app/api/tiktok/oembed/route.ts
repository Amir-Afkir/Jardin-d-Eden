// app/api/tiktok/oembed/route.ts
/* oEmbed proxy TikTok
   - Valide l’URL reçue
   - Proxy https://www.tiktok.com/oembed?url=...
   - Renvoie { html } avec NO-CACHE côté CDN (Netlify) pour éviter les collisions inter-vidéos
   - Ajoute un cache-buster côté upstream pour contourner des caches TikTok agressifs
*/
import { NextResponse } from "next/server";

export const runtime = "edge"; // Netlify/Edge-friendly

type OEmbedResp = {
  html?: string;
  author_name?: string;
  author_url?: string;
  title?: string;
  provider_name?: string;
  provider_url?: string;
  width?: number;
  height?: number;
  error?: string;
};

function canonicalizeTikTokVideoUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return null;
    if (!url.hostname.endsWith("tiktok.com")) return null;
    if (!url.pathname.includes("/video/")) return null;
    // Canonicalize by dropping search/hash to stabilize ETag and cache
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function extractVideoIdFromCanonical(u: string): string | null {
  try {
    const url = new URL(u);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex(p => p === "video");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request): Promise<Response> {
  const urlParam = new URL(req.url).searchParams.get("url") ?? "";
  const canonical = canonicalizeTikTokVideoUrl(urlParam);
  if (!canonical) {
    return NextResponse.json({ error: "invalid_url" as const }, { status: 400 });
  }

  const requestedId = extractVideoIdFromCanonical(canonical) || "";

  const upstream = new URL("https://www.tiktok.com/oembed");
  upstream.searchParams.set("url", canonical);
  // Cache-buster robuste : ID + timestamp + jitter aléatoire pour éviter les collisions CDN TikTok
  const cacheBuster = `${requestedId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  upstream.searchParams.set("_cb", cacheBuster);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  const NO_CACHE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Vary": "Accept, Accept-Language",
    "X-Embed-Source": "tiktok-oembed"
  };

  const res = await fetch(upstream.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!res.ok) {
    return NextResponse.json(
      { error: `upstream_${res.status}` as const },
      { status: res.status, headers: NO_CACHE_HEADERS }
    );
  }

  const data = (await res.json()) as OEmbedResp;

  if (data.error && typeof data.error === "string") {
    return NextResponse.json(
      { error: "oembed_upstream_error", detail: data.error },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }

  if (!data.html || data.html.trim().length === 0) {
    return NextResponse.json(
      { error: "oembed_missing_html" as const },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }

  if (requestedId && !data.html.includes(`data-video-id="${requestedId}"`)) {
    // TikTok a renvoyé le mauvais embed (souvent dû à un cache upstream agressif)
    return NextResponse.json(
      { error: "oembed_mismatch", requestedId },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    { html: data.html },
    { status: 200, headers: NO_CACHE_HEADERS }
  );
}