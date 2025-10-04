import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public type used by the frontend and tests.
 */
export type TikTokItem = {
  id: string;
  url: string;
  thumb?: string;
  title?: string;
  published_at?: string;
  poster?: string;
};

/**
 * ====== Perf-oriented helpers (exported for unit tests) ======
 */
export function extractIdFromUrl(u: string): string | null {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p === "video");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

export function readStringKey(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function computeETag(items: ReadonlyArray<TikTokItem>): string {
  const sig = items
    .map(i => `${i.id}|${i.thumb ?? ''}|${i.title ?? ''}|${i.published_at ?? ''}`)
    .join("\n");
  const hash = crypto.createHash("sha1").update(sig).digest("base64url");
  return `W/"${hash}.${items.length}"`;
}

function uniqServer(arr: ReadonlyArray<TikTokItem>): TikTokItem[] {
  const seen = new Set<string>();
  const out: TikTokItem[] = [];
  for (const it of arr) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

/**
 * Only ask Apify for the fields we actually use.
 * (Smaller payload = faster)
 */
const APIFY_FIELDS = [
  "webVideoUrl",
  "url",
  "itemId",
  "id",
  "title",
  "createTimeISO",
  "covers.default",
  "covers.origin",
  "videoMeta.coverUrl",
].join(",");

/**
 * Normalizes one Apify record into our compact TikTokItem.
 */
export function normalizeRecord(rec: Record<string, unknown>, fallbackHandle?: string): TikTokItem | null {
  const urlRaw =
    (rec as { webVideoUrl?: string }).webVideoUrl ||
    (rec as { url?: string }).url ||
    "";

  // Extract the canonical video id from the URL when possible (most reliable)
  const urlId = urlRaw ? extractIdFromUrl(urlRaw) : null;

  // Dataset-provided ids (may be unstable across pages/runs)
  const dsId =
    (rec as { itemId?: string }).itemId ||
    (rec as { id?: string }).id ||
    "";

  // Prefer the URL-derived id; fallback to dataset id if URL missing
  const id = urlId || dsId;
  if (!id) return null;

  // Thumbs/poster
  const coversObj = (rec as { covers?: { default?: string; origin?: string } }).covers;
  const thumb =
    coversObj?.default ||
    coversObj?.origin ||
    readStringKey(rec as Record<string, unknown>, "videoMeta.coverUrl") ||
    undefined;

  const poster = thumb || undefined;

  const title = (rec as { title?: string }).title ?? undefined;
  const published_at = (rec as { createTimeISO?: string }).createTimeISO ?? undefined;

  const finalUrl = urlRaw || (fallbackHandle ? `https://www.tiktok.com/@${fallbackHandle}/video/${id}` : "");

  return {
    id: String(id),
    url: finalUrl,
    thumb,
    title,
    published_at,
    poster,
  };
}

/**
 * GET /api/tiktok/cache
 *
 * Reads items from the dataset of the LAST finished Apify Task run.
 * Uses CDN-friendly caching + ETag for instant responses.
 */
export async function GET(req: NextRequest) {
  const token = process.env.APIFY_TOKEN;
  const taskId = process.env.APIFY_TASK_ID;
  const fallbackHandle = (process.env.NEXT_PUBLIC_TIKTOK_USERNAME || "").replace(/^@/, "");

  if (!token || !taskId) {
    return NextResponse.json(
      { error: "missing_apify_env", message: "APIFY_TOKEN or APIFY_TASK_ID not set" },
      { status: 500 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const limit = clamp(Number(sp.get("limit") ?? 9) || 9, 1, 24);

  async function fetchItems({ withFields }: { withFields: boolean }) {
    const url = new URL(`https://api.apify.com/v2/actor-tasks/${taskId}/runs/last/dataset/items`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("clean", "1");
    if (withFields) url.searchParams.set("fields", APIFY_FIELDS);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const r = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        return { ok: false as const, status: r.status, detail: txt.slice(0, 1200) };
      }
      const raw = (await r.json()) as unknown;
      const arr = Array.isArray(raw) ? (raw as ReadonlyArray<Record<string, unknown>>) : [];
      return { ok: true as const, arr };
    } catch (e) {
      clearTimeout(timeout);
      return { ok: false as const, status: 504, detail: e instanceof Error ? e.message : "unknown" };
    }
  }

  // 1) Fast path: filtré (fields)
  const first = await fetchItems({ withFields: true });
  if (!first.ok) {
    return NextResponse.json(
      { error: "apify_http_error", status: first.status, detail: first.detail },
      { status: 502 }
    );
  }

  const seen1 = new Set<string>();
  let items = [] as TikTokItem[];
  for (const rec of first.arr) {
    const it = normalizeRecord(rec, fallbackHandle);
    if (!it) continue;
    if (seen1.has(it.id)) continue;
    seen1.add(it.id);
    items.push(it);
    if (items.length >= limit) break;
  }

  // If nothing returned with lean fields, retry without fields (schema variance safety)
  let debugNote = "fields";
  if (items.length === 0) {
    const second = await fetchItems({ withFields: false });
    if (second.ok) {
      const seen2 = new Set<string>();
      const items2: TikTokItem[] = [];
      for (const rec of second.arr) {
        const it = normalizeRecord(rec, fallbackHandle);
        if (!it) continue;
        if (seen2.has(it.id)) continue;
        seen2.add(it.id);
        items2.push(it);
        if (items2.length >= limit) break;
      }
      if (items2.length > 0) {
        items = items2;
        debugNote = "nofields";
      } else {
        debugNote = "empty_dataset";
      }
    } else {
      debugNote = `fallback_failed_${second.status}`;
    }
  }

  // Final safety: deduplicate by stable video id
  items = uniqServer(items);
  const etag = computeETag(items);

  const inm = req.headers.get("if-none-match");
  if (inm && inm === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        Vary: "Authorization, Accept, Accept-Encoding",
        "X-TT-Debug": debugNote,
      },
    });
  }

  return NextResponse.json({ username: fallbackHandle || "unknown", items, count: items.length }, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      ETag: etag,
      Vary: "Authorization, Accept, Accept-Encoding",
      "X-TT-Debug": debugNote,
    },
  });
}