// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TikTokTokenResponse = {
  data?: {
    refresh_token?: string;
    access_token?: string;
  };
  error?: { message?: string };
  message?: string;
};

const TOKEN_URL = "https://open-api.tiktokglobalplatform.com/v2/oauth/token/";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");

  const expectedState = req.cookies.get("tt_state")?.value;
  const pkce = req.cookies.get("tt_pkce")?.value;

  if (oauthError) return NextResponse.redirect(addMsg("/", `oauth_error:${oauthError}`));
  if (!code) return NextResponse.redirect(addMsg("/", "no_code"));
  if (expectedState && returnedState && expectedState !== returnedState) {
    return NextResponse.redirect(addMsg("/", "oauth_state_mismatch"));
  }
  if (!pkce) return NextResponse.redirect(addMsg("/", "missing_pkce_verifier"));

  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI!;

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: pkce,
  });

  let data: TikTokTokenResponse;
  try {
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    data = (await r.json()) as TikTokTokenResponse;
    if (!r.ok || !data?.data?.refresh_token) {
      const msg = data?.error?.message || data?.message || "oauth_exchange_failed";
      return NextResponse.redirect(addMsg("/", msg));
    }
  } catch {
    return NextResponse.redirect(addMsg("/", "oauth_network_error"));
  }

  // (utile pendant l’intégration)
  console.log("TT REFRESH =", data.data?.refresh_token);

  const refreshToken = data.data!.refresh_token!;
  const accessToken = data.data?.access_token;
  const isProd = process.env.NODE_ENV === "production";

  const res = NextResponse.redirect(addMsg("/", "connected"));

  // Stocke le refresh token (long)
  res.cookies.set("tt_refresh", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  // Optionnel : access token court
  if (accessToken) {
    res.cookies.set("tt_access", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 h
    });
  }

  // Nettoyage des cookies temporaires
  res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
  res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

  return res;
}

function addMsg(base: string, msg: string) {
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}