// app/api/tiktok/oembed/route.ts
/* oEmbed proxy TikTok – HTML nettoyé (on supprime le <script embed.js>)
   et cache-buster robuste pour éviter les collisions entre vidéos.
*/
import { NextResponse } from "next/server";

export const runtime = "edge";

type OEmbedResp = {
  html?: string;
  error?: string;
};

function canonicalizeTikTokVideoUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return null;
    if (!url.hostname.endsWith("tiktok.com")) return null;
    if (!url.pathname.includes("/video/")) return null;
    url.search = ""; url.hash = "";
    return url.toString();
  } catch { return null; }
}

function extractId(u: string): string | null {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const i = parts.findIndex(p => p === "video");
    return i >= 0 && parts[i+1] ? parts[i+1] : null;
  } catch { return null; }
}

// supprime le <script .../embed.js></script> que TikTok ajoute à la fin
function stripEmbedScript(html: string): string {
  return html.replace(/<script[^>]*src=["']https?:\/\/www\.tiktok\.com\/embed\.js["'][^>]*>\s*<\/script>\s*$/i, "");
}

async function fetchOEmbed(canonical: string, requestedId: string, abortSignal: AbortSignal) {
  const upstream = new URL("https://www.tiktok.com/oembed");
  const cb = `${requestedId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  upstream.searchParams.set("url", canonical);
  upstream.searchParams.set("_cb", cb);

  const res = await fetch(upstream.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
    cache: "no-store",
    signal: abortSignal,
  });

  if (!res.ok) {
    return { ok: false as const, status: res.status, body: null as any };
  }
  const data = (await res.json()) as OEmbedResp;
  return { ok: true as const, status: 200, body: data };
}

export async function GET(req: Request): Promise<Response> {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  const canonical = canonicalizeTikTokVideoUrl(raw);
  if (!canonical) {
    return NextResponse.json({ error: "invalid_url" as const }, { status: 400 });
  }

  const requestedId = extractId(canonical) ?? "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  const H = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Vary": "Accept, Accept-Language",
    "X-Embed-Source": "tiktok-oembed",
  } as const;

  try {
    // 1er essai
    let r = await fetchOEmbed(canonical, requestedId, controller.signal);
    if (!r.ok) {
      return NextResponse.json({ error: `upstream_${r.status}` }, { status: r.status, headers: H });
    }

    let data = r.body as OEmbedResp;
    if (data.error) {
      return NextResponse.json({ error: "oembed_upstream_error", detail: data.error }, { status: 502, headers: H });
    }
    if (!data.html) {
      return NextResponse.json({ error: "oembed_missing_html" }, { status: 502, headers: H });
    }

    // Sanitize + vérification d'ID
    let html = stripEmbedScript(data.html);
    if (requestedId && !html.includes(`data-video-id="${requestedId}"`)) {
      // Réessai une fois avec un autre cache-buster
      r = await fetchOEmbed(canonical, requestedId, controller.signal);
      if (!r.ok || !r.body?.html) {
        return NextResponse.json({ error: "oembed_mismatch_retry_failed", requestedId }, { status: 502, headers: H });
      }
      html = stripEmbedScript(r.body.html);
      if (requestedId && !html.includes(`data-video-id="${requestedId}"`)) {
        return NextResponse.json({ error: "oembed_mismatch", requestedId }, { status: 502, headers: H });
      }
    }

    return NextResponse.json({ html }, { status: 200, headers: H });
  } finally {
    clearTimeout(timer);
  }
} 