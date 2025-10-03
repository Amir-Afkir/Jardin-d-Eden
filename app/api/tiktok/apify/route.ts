// app/api/tiktok/apify/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ---------- Types ---------- */
export type TikTokItem = {
  id: string;
  url: string;
  thumb?: string;
  title?: string;
  published_at?: string;
};

type ApifyRecord = {
  itemId?: unknown;
  id?: unknown;
  url?: unknown;
  title?: unknown;
  createTimeISO?: unknown;
  covers?: { default?: unknown; origin?: unknown };
  // parfois présent avec `clean=1`, on reste tolérant :
  ["videoMeta.coverUrl"]?: unknown;
};

/** ---------- Helpers exportés (testables) ---------- */
const HANDLE_RE = /^[a-zA-Z0-9._]{2,24}$/;

export function isValidHandle(h: string): boolean {
  return HANDLE_RE.test(h);
}

export function extractIdFromUrl(u: string): string | null {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p === "video");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

export function normalizeRecord(rec: ApifyRecord, handle: string): TikTokItem | null {
  // id
  const rawId =
    (typeof rec.itemId === "string" && rec.itemId) ||
    (typeof rec.id === "string" && rec.id) ||
    (typeof rec.url === "string" ? extractIdFromUrl(rec.url) : null);

  if (!rawId) return null;

  // url
  const rawUrl =
    (typeof rec.url === "string" && rec.url) ||
    `https://www.tiktok.com/@${handle}/video/${rawId}`;

  // thumb
  const c = rec.covers;
  const coverDefault = c && typeof c.default === "string" ? (c.default as string) : undefined;
  const coverOrigin = c && typeof c.origin === "string" ? (c.origin as string) : undefined;
  const metaCover =
    typeof rec["videoMeta.coverUrl"] === "string" ? (rec["videoMeta.coverUrl"] as string) : undefined;

  const thumb = coverDefault || coverOrigin || metaCover || undefined;

  const title = typeof rec.title === "string" ? (rec.title as string) : undefined;
  const published_at =
    typeof rec.createTimeISO === "string" ? (rec.createTimeISO as string) : undefined;

  return { id: String(rawId), url: rawUrl, thumb, title, published_at };
}

function clampLimit(v: unknown, min = 1, max = 24, def = 9): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function makeETag(items: ReadonlyArray<TikTokItem>): string {
  // simple etag faible basé sur longueur + hash rapide
  const s = JSON.stringify(items);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return `W/"${s.length}-${(h >>> 0).toString(16)}"`;
}

/** ---------- In-memory failure counter ---------- */
let failureCount = 0;

/** ---------- Handler ---------- */
export async function GET(req: NextRequest) {
  const token = process.env.APIFY_TOKEN ?? "";
  if (!token) {
    return NextResponse.json({ error: "missing_apify_token" }, { status: 500 });
  }

  if (failureCount >= 3) {
    return NextResponse.json(
      { redirect: "/api/tiktok/cache", reason: "circuit_breaker" },
      { status: 307 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const envHandle = (process.env.NEXT_PUBLIC_TIKTOK_USERNAME ?? "").replace(/^@/, "");
  const rawHandle = (sp.get("username") ?? envHandle).trim().replace(/^@/, "");
  const limit = clampLimit(sp.get("limit"));

  if (!rawHandle || !isValidHandle(rawHandle)) {
    return NextResponse.json({ error: "invalid_or_missing_username" }, { status: 400 });
  }

  // Endpoint "run-sync-get-dataset-items" (scrape frais) — à utiliser parcimonieusement
  const url = new URL(
    "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items"
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("skipEmpty", "1");
  url.searchParams.set("timeout", "240"); // seconds côté Apify (plafonné par l'actor)

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const input = {
    profiles: [rawHandle],
    profileScrapeSections: ["videos"],
    profileSorting: "latest",
    excludePinnedPosts: false,
    // Moins de pagination pour accélérer le démarrage de run
    resultsPerPage: Math.min(limit, 3),
    maxItems: limit,
    shouldDownloadCovers: false,
    shouldDownloadVideos: false,
    shouldDownloadAvatars: false,
  };

  // Timeout côté Next: court (20s) pour ne pas bloquer la lambda
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const r = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(input),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!r.ok) {
      failureCount++;
      const detail = await r.text().catch(() => "");
      return NextResponse.json(
        { error: "apify_http_error", status: r.status, detail: detail.slice(0, 1200) },
        { status: 502 }
      );
    }

    failureCount = 0;

    const payload = (await r.json()) as unknown;
    const arr = Array.isArray(payload) ? (payload as ReadonlyArray<ApifyRecord>) : [];

    const items = arr
      .map((rec) => normalizeRecord(rec, rawHandle))
      .filter((x): x is TikTokItem => x !== null)
      .slice(0, limit);

    // ETag pour 304 si identique
    const etag = makeETag(items);
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "no-store",
          Vary: "If-None-Match",
        },
      });
    }

    return NextResponse.json(
      { username: rawHandle, items, count: items.length },
      {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "no-store",
          Vary: "If-None-Match",
        },
      }
    );
  } catch (e) {
    clearTimeout(timer);
    failureCount++;
    const msg = e instanceof Error ? e.message : "unknown_error";
    // Astuce: on donne une piste pour basculer sur le cache si le run-sync échoue
    return NextResponse.json(
      { error: "apify_network_error", message: msg, hint: "Try /api/tiktok/cache for instant cached data." },
      { status: 504 }
    );
  }
}