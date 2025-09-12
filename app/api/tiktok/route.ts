// app/api/tiktok/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const LIST_URL  = "https://open.tiktokapis.com/v2/video/list/";

/** ——— Types ——— */
type OAuthError = { message?: string; code?: number };
type RefreshWrapped = { data?: { access_token?: string }; error?: OAuthError; message?: string };
type RefreshFlat = { access_token?: string; error?: OAuthError; message?: string };
type RefreshResp = RefreshWrapped | RefreshFlat;

type TikTokVideo = {
  id: string;
  author?: { unique_id?: string };
  cover_image_url?: string;
};
type TikTokListResponse = { data?: { videos?: TikTokVideo[] } };

/** ——— Helpers ——— */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function extractAccessTokenFromRefresh(resp: RefreshResp): string | undefined {
  if ("data" in resp && isRecord(resp.data)) {
    return resp.data.access_token;
  }
  return (resp as RefreshFlat).access_token;
}

/** ——— Refresh ——— */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "jardin-eden-oauth/1.0",
    },
    body,
    cache: "no-store",
  });

  const j = (await r.json()) as RefreshResp;
  const token = extractAccessTokenFromRefresh(j);

  if (!token) {
    const msg =
      (isRecord(j.error) ? j.error.message : undefined) ||
      (isRecord(j) && typeof j.message === "string" ? j.message : undefined) ||
      "no_access_token_in_refresh";
    throw new Error(`Cannot refresh access_token:${msg}`);
  }
  return token;
}

/** ——— Handler ——— */
export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("tt_refresh")?.value || "";
  if (!refreshToken) {
    return NextResponse.json(
      { items: [], auth: false, message: "Connect TikTok at /api/auth/tiktok" },
      { status: 401 }
    );
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);

    const r = await fetch(LIST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 9 }),
      cache: "no-store",
    });

    const data = (await r.json()) as TikTokListResponse;

    const items = (data?.data?.videos ?? []).map((v) => ({
      id: v.id,
      url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.id}`,
      cover: v.cover_image_url,
    }));

    return NextResponse.json({ items, auth: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ items: [], auth: false, error: msg }, { status: 500 });
  }
}