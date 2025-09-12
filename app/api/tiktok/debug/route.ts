// app/api/tiktok/debug/route.ts
import { NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- Helpers ----
async function parseJsonSafe(resp: Response): Promise<{ ok: boolean; json?: unknown; text?: string; status: number; ctype: string | null }> {
  const ctype = resp.headers.get("content-type");
  const isJson = !!ctype && ctype.toLowerCase().includes("application/json");
  try {
    if (isJson) {
      const json = await resp.json();
      return { ok: resp.ok, json, status: resp.status, ctype };
    } else {
      const text = await resp.text();
      return { ok: resp.ok, text, status: resp.status, ctype };
    }
  } catch (e) {
    // Même si le header dit JSON, le corps peut ne pas l’être: on lit en texte
    const text = await resp.text().catch(() => "");
    return { ok: resp.ok, text, status: resp.status, ctype };
  }
}

function short(text: string, max = 500): string {
  return text.length > max ? text.slice(0, max) + "…(truncated)" : text;
}

// ---- Types ----
type TikTokTokenResp =
  | { data?: { access_token?: string }; error?: { message?: string }; message?: string }
  | { access_token?: string; error?: { message?: string }; message?: string };

interface TikTokUserInfoResponse {
  data?: {
    user?: {
      open_id?: string;
      username?: string;
      display_name?: string;
      is_verified?: boolean;
    };
  };
  error?: { message?: string };
  message?: string;
}

interface TikTokVideoListResponse {
  data?: {
    videos?: Array<{
      id: string;
      cover_image_url?: string;
      embed_link?: string;
      share_url?: string;
      author?: {
        unique_id?: string;
        username?: string;
        display_name?: string;
      };
    }>;
    has_more?: boolean;
  };
  error?: { message?: string };
  message?: string;
}

// ---- Token refresh ----
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
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

  const parsed = await parseJsonSafe(r);
  if (!parsed.ok) {
    throw new Error(
      `token_refresh_http_${parsed.status} ctype=${parsed.ctype ?? "n/a"} body=${short(parsed.text ?? JSON.stringify(parsed.json ?? {}))}`
    );
  }

  const j = (parsed.json ?? {}) as TikTokTokenResp;
  const token =
    (j as { data?: { access_token?: string } }).data?.access_token ??
    (j as { access_token?: string }).access_token;

  if (!token) {
    const msg =
      (j as { error?: { message?: string } }).error?.message ||
      (j as { message?: string }).message ||
      "Cannot refresh access_token";
    throw new Error(`token_refresh_logic_error:${msg}`);
  }
  return token;
}

// ---- GET /api/tiktok/debug ----
export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("tt_refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "no_refresh_token_cookie" }, { status: 401 });
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);

    // 1) User info
    const uiResp = await fetch(USER_INFO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: ["open_id", "username", "display_name", "is_verified"] }),
      cache: "no-store",
    });
    const uiParsed = await parseJsonSafe(uiResp);
    if (!uiParsed.ok) {
      return NextResponse.json(
        {
          step: "user_info",
          error: "user_info_http_error",
          status: uiParsed.status,
          content_type: uiParsed.ctype,
          body: uiParsed.text ?? uiParsed.json,
        },
        { status: 502 }
      );
    }
    const userInfo = uiParsed.json as TikTokUserInfoResponse;

    // 2) Video list
    const vlResp = await fetch(LIST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_count: 9,
        // Garder un set de champs raisonnable
        fields: ["id", "cover_image_url", "embed_link", "share_url", "author{unique_id,username,display_name}"],
      }),
      cache: "no-store",
    });
    const vlParsed = await parseJsonSafe(vlResp);
    if (!vlParsed.ok) {
      return NextResponse.json(
        {
          step: "video_list",
          error: "video_list_http_error",
          status: vlParsed.status,
          content_type: vlParsed.ctype,
          body: vlParsed.text ?? vlParsed.json,
        },
        { status: 502 }
      );
    }
    const videoList = vlParsed.json as TikTokVideoListResponse;

    // 3) Résumé exploitable côté front
    const items =
      videoList.data?.videos?.map((v) => {
        const byUnique = v.author?.unique_id ? `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}` : undefined;
        const url = byUnique ?? v.share_url ?? "";
        const embed = v.embed_link ?? "";
        return { id: v.id, url, embed, cover: v.cover_image_url };
      }) ?? [];

    return NextResponse.json({
      ok: true,
      user_info: userInfo,
      video_list_raw: videoList,
      summarized_items: items,
      hint:
        items.length === 0
          ? "Aucune vidéo exploitable. Vérifie le compte connecté (OAuth), le rôle Sandbox testeur et la présence de vidéos PUBLIQUES."
          : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "debug_handler_error",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}