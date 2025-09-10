// app/api/tiktok/route.ts
import { NextResponse } from "next/server";

const TOKEN_URL = "https://open-api.tiktokglobalplatform.com/v2/oauth/token/";
const LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const j = await r.json();
  const token = j?.data?.access_token as string | undefined;
  if (!token) throw new Error("Cannot refresh access_token");
  return token;
}

export async function GET(req: any) {
  const refreshToken = req?.cookies?.get?.("tt_refresh")?.value || "";
  if (!refreshToken) {
    return NextResponse.json({ items: [], auth: false, message: "Connect TikTok at /api/auth/tiktok" });
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

    const data = await r.json();
    const items = (data?.data?.videos || []).map((v: any) => ({
      id: v?.id,
      url: `https://www.tiktok.com/@${v?.author?.unique_id}/video/${v?.id}`,
      cover: v?.cover_image_url,
    }));

    return NextResponse.json({ items, auth: true });
  } catch (e: any) {
    return NextResponse.json({ items: [], auth: false, error: e.message }, { status: 500 });
  }
}
