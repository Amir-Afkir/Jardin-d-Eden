// app/api/tiktok/oembed/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

type OEmbedResp = {
  html?: string;
  error?: string;
};

type FetchResult =
  | { ok: true; status: 200; body: OEmbedResp }
  | { ok: false; status: number; body: null };

function canonicalizeTikTokVideoUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return null;
    if (!url.hostname.endsWith("tiktok.com")) return null;
    if (!url.pathname.includes("/video/")) return null;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchOEmbed(
  canonical: string,
  requestedId: string,
  abortSignal: AbortSignal
): Promise<FetchResult> {
  const upstream = new URL("https://www.tiktok.com/oembed");
  const cb = `${requestedId}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  upstream.searchParams.set("url", canonical);
  upstream.searchParams.set("_cb", cb);

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
    signal: abortSignal,
  });

  if (!res.ok) {
    return { ok: false, status: res.status, body: null };
  }
  const body: OEmbedResp = await res.json();
  return { ok: true, status: 200, body };
}

function extractId(u: string): string | null {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p === "video");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

function stripEmbedScript(html: string): string {
  return html.replace(
    /<script[^>]*src=["']https?:\/\/www\.tiktok\.com\/embed\.js["'][^>]*>\s*<\/script>\s*$/i,
    ""
  );
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

  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Accept, Accept-Language",
    "X-Embed-Source": "tiktok-oembed",
  } as const;

  try {
    let r = await fetchOEmbed(canonical, requestedId, controller.signal);
    if (!r.ok) {
      return NextResponse.json(
        { error: `upstream_${r.status}` },
        { status: r.status, headers }
      );
    }

    const data = r.body;
    if (data.error) {
      return NextResponse.json(
        { error: "oembed_upstream_error", detail: data.error },
        { status: 502, headers }
      );
    }
    if (!data.html) {
      return NextResponse.json(
        { error: "oembed_missing_html" },
        { status: 502, headers }
      );
    }

    // Sanitize + vérification souple de l’ID
    let html = stripEmbedScript(data.html);
    if (requestedId && !html.includes(`data-video-id="${requestedId}"`)) {
      r = await fetchOEmbed(canonical, requestedId, controller.signal);
      if (!r.ok || !r.body?.html) {
        return NextResponse.json(
          { error: "oembed_mismatch_retry_failed", requestedId },
          { status: 502, headers }
        );
      }
      html = stripEmbedScript(r.body.html);
      if (requestedId && !html.includes(`data-video-id="${requestedId}"`)) {
        return NextResponse.json(
          { error: "oembed_mismatch", requestedId },
          { status: 502, headers }
        );
      }
    }

    return NextResponse.json({ html }, { status: 200, headers });
  } finally {
    clearTimeout(timer);
  }
}