// app/api/tiktok/route.ts
import { NextResponse } from "next/server";

const TOKEN_URL = "https://open-api.tiktokglobalplatform.com/v2/oauth/token/";
const LIST_URL  = "https://open.tiktokapis.com/v2/video/list/";

type TikTokVideo = { id: string; author?: { unique_id?: string }; cover_image_url?: string };
type TikTokListResponse = { data?: { videos?: TikTokVideo[] } };

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const r = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const j = (await r.json()) as { data?: { access_token?: string } };
  const token = j?.data?.access_token;
  if (!token) throw new Error("Cannot refresh access_token");
  return token;
}

export async function GET() {
  const REFRESH = process.env.TIKTOK_REFRESH_TOKEN;
  if (!REFRESH) {
    return NextResponse.json({ items: [], auth: false, message: "Set TIKTOK_REFRESH_TOKEN" }, { status: 500 });
  }
  try {
    const accessToken = await refreshAccessToken(REFRESH);
    const r = await fetch(LIST_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_count: 9 }),
      cache: "no-store",
    });
    const data = (await r.json()) as TikTokListResponse;
    const items = (data?.data?.videos ?? []).map(v => ({
      id: v.id,
      url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.id}`,
      cover: v.cover_image_url,
    }));
    return NextResponse.json({ items, auth: true });
  } catch (e) {
    return NextResponse.json({ items: [], auth: false, error: e instanceof Error ? e.message : "unknown_error" }, { status: 500 });
  }
}