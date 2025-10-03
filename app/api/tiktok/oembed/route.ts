// app/api/tiktok/oembed/route.ts
/* oEmbed proxy TikTok
   - Valide l’URL reçue
   - Proxy https://www.tiktok.com/oembed?url=...
   - Renvoie { html } avec ETag + Cache-Control
   - Gère 304 si If-None-Match correspond
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

async function sha256Base64(input: string): Promise<string> {
  const enc = new TextEncoder();
  // Web Crypto is available in Edge runtime
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  const bytes = new Uint8Array(digest);
  // base64 without padding is fine for ETag
  const b64 = btoa(String.fromCharCode(...bytes));
  return `"sha256-${b64}"`;
}

export async function GET(req: Request): Promise<Response> {
  const urlParam = new URL(req.url).searchParams.get("url") ?? "";
  const canonical = canonicalizeTikTokVideoUrl(urlParam);
  if (!canonical) {
    return NextResponse.json({ error: "invalid_url" as const }, { status: 400 });
  }

  const upstream = new URL("https://www.tiktok.com/oembed");
  upstream.searchParams.set("url", canonical);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  const res = await fetch(upstream.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!res.ok) {
    // Propager proprement l’erreur
    return NextResponse.json(
      { error: `upstream_${res.status}` as const },
      { status: res.status }
    );
  }

  const data = (await res.json()) as OEmbedResp;

  if (data.error && typeof data.error === "string") {
    return NextResponse.json(
      { error: "oembed_upstream_error", detail: data.error },
      { status: 502 }
    );
  }

  if (!data.html || data.html.trim().length === 0) {
    return NextResponse.json(
      { error: "oembed_missing_html" as const },
      { status: 502 }
    );
  }

  // ETag sur le HTML pour 304 conditionnel
  const etag = await sha256Base64(data.html);
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        // cache public: 1 jour + SWR
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        Vary: "Accept, Accept-Language, If-None-Match",
        "X-Embed-Source": "tiktok-oembed",
      },
    });
  }

  return NextResponse.json(
    { html: data.html },
    {
      status: 200,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        Vary: "Accept, Accept-Language, If-None-Match",
        "X-Embed-Source": "tiktok-oembed",
      },
    }
  );
}