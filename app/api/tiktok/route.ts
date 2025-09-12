// app/api/tiktok/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const LIST_URL  = "https://open.tiktokapis.com/v2/video/list/";

type TikTokAuthor = {
  unique_id?: string;
  username?: string;
  display_name?: string;
  open_id?: string;
};

type TikTokVideo = {
  id: string;
  cover_image_url?: string;
  embed_link?: string;
  share_url?: string;
  author?: TikTokAuthor;
};

type TikTokListResponse = {
  data?: { videos?: TikTokVideo[]; cursor?: number; has_more?: boolean };
  error?: { message?: string };
  message?: string;
};

type TokenResponseShape =
  | { data?: { access_token?: string } }
  | { access_token?: string };

function pickAccessToken(j: TokenResponseShape): string | undefined {
  return (j as any)?.data?.access_token ?? (j as any)?.access_token;
}

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

  const j = (await r.json()) as TokenResponseShape;
  const token = pickAccessToken(j);
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
      body: JSON.stringify({
        max_count: 9,
        cursor: 0,
        fields: [
          "id",
          "cover_image_url",
          "embed_link",
          "share_url",
          "author{unique_id,username,display_name,open_id}",
        ],
      }),
      cache: "no-store",
    });

    const data = (await r.json()) as TikTokListResponse;
    const videos = data?.data?.videos ?? [];

    const items = videos.map((v) => {
      const username = v.author?.unique_id || v.author?.username || "";
      const url =
        v.embed_link ||
        v.share_url ||
        (username ? `https://www.tiktok.com/@${username}/video/${v.id}` : `https://www.tiktok.com/@/video/${v.id}`);
      return { id: v.id, url, cover: v.cover_image_url };
    });

    const payload: Record<string, unknown> = { items, auth: true };
    if (!items.length) {
      payload.hint =
        "Aucune vidéo renvoyée par l’API. Vérifie que le compte autorisé possède des vidéos publiques et qu’il est bien ajouté comme testeur Sandbox.";
      payload.raw_has_more = data?.data?.has_more ?? false;
    }

    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ items: [], auth: false, error: msg }, { status: 500 });
  }
}