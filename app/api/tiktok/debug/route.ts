// app/api/tiktok/debug/route.ts
import { NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "jardin-eden-oauth/1.0" },
    body,
    cache: "no-store",
  });
  const j = await r.json() as any;
  const token = j?.data?.access_token ?? j?.access_token;
  if (!token) throw new Error("Cannot refresh access_token");
  return token;
}

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("tt_refresh")?.value;
  if (!refreshToken) return NextResponse.json({ error: "no_refresh_token" }, { status: 401 });

  try {
    const accessToken = await refreshAccessToken(refreshToken);

    const ui = await fetch(USER_INFO_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: ["open_id","username","display_name","is_verified"] }),
    }).then(r => r.json());

    const vl = await fetch(LIST_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        max_count: 9,
        fields: ["id","cover_image_url","embed_link","share_url","author{unique_id,username,display_name}"],
      }),
    }).then(r => r.json());

    return NextResponse.json({ user_info: ui, video_list_raw: vl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}