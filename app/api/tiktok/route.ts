// app/api/tiktok/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const LIST_URL  = "https://open.tiktokapis.com/v2/video/list/";

type TikTokVideo = {
  id: string;
  author?: { unique_id?: string };
  cover_image_url?: string;
};
type TikTokListResponse = { data?: { videos?: TikTokVideo[] } };

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

  const j = (await r.json()) as { data?: { access_token?: string } };
  const token = j?.data?.access_token;
  if (!token) throw new Error("Cannot refresh access_token");
  return token;
}

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