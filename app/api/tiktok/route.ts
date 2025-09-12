// app/api/tiktok/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

// --- Types sûrs (pas de `any`) ---
type TikTokTokenResp = {
  data?: { access_token?: string };
  access_token?: string;
  error?: { message?: string };
  message?: string;
};

type TikTokVideo = {
  id: string;
  cover_image_url?: string;
  embed_link?: string;
  share_url?: string;
  // NOTE: on ne demande plus `author{...}` car l'API le refuse en Sandbox
};

type TikTokListResponse = {
  data?: { videos?: TikTokVideo[]; has_more?: boolean };
  error?: { message?: string };
  message?: string;
};

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

  const j = (await r.json()) as TikTokTokenResp;
  const token = j?.data?.access_token ?? j?.access_token;
  if (!token) {
    const msg = j?.error?.message || j?.message || "Cannot refresh access_token";
    throw new Error(msg);
  }
  return token;
}

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("tt_refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { items: [], auth: false, message: "Connect TikTok at /api/auth/tiktok" },
      { status: 401 }
    );
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);

    // IMPORTANT : ne pas demander de champs refusés par l'API (ex: author{...})
    const listUrl = new URL(LIST_URL);
    listUrl.searchParams.set(
      "fields",
      "id,cover_image_url,embed_link,share_url"
    );

    const r = await fetch(listUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 9 }),
      cache: "no-store",
    });

    const data = (await r.json()) as TikTokListResponse;
    const videos = data?.data?.videos ?? [];

    // Construit une URL exploitable à partir de share_url puis embed_link
    const items = videos
      .map((v) => {
        const url = v.share_url || v.embed_link || "";
        return { id: v.id, url, cover: v.cover_image_url };
      })
      .filter((i) => i.url);

    const hint =
      items.length === 0
        ? "Aucune vidéo exploitable. Assure-toi que le compte a des vidéos PUBLIQUES et que l’utilisateur connecté est bien autorisé (Sandbox)."
        : undefined;

    return NextResponse.json({ items, auth: true, hint, raw_has_more: Boolean(data?.data?.has_more) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ items: [], auth: false, error: msg }, { status: 500 });
  }
}