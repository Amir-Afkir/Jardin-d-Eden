// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TikTokTokenResponse = {
  data?: { refresh_token?: string; access_token?: string };
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

  // Logs de debug utiles en prod (temporaires)
  console.log("[TT CALLBACK] query", { hasCode: !!code, returnedState, oauthError });
  console.log("[TT CALLBACK] cookies", { hasState: !!expectedState, hasPkce: !!pkce });

  if (oauthError) return NextResponse.redirect(addMsg("/", `oauth_error:${oauthError}`));
  if (!code) return NextResponse.redirect(addMsg("/", "no_code"));
  if (expectedState && returnedState && expectedState !== returnedState) {
    return NextResponse.redirect(addMsg("/", "oauth_state_mismatch"));
  }
  if (!pkce) return NextResponse.redirect(addMsg("/", "missing_pkce_verifier"));

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  // Si une env manque, on le voit clairement
  if (!clientKey || !clientSecret || !redirectUri) {
    console.error("[TT CALLBACK] Missing env", { hasKey: !!clientKey, hasSecret: !!clientSecret, hasRU: !!redirectUri });
    return NextResponse.redirect(addMsg("/", "server_env_missing"));
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: pkce,
  });

  try {
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    const raw = await r.text();
    let data: TikTokTokenResponse = {};
    try { data = JSON.parse(raw) as TikTokTokenResponse; } catch { /* parfois HTML → JSON parse fail */ }

    if (!r.ok || !data?.data?.refresh_token) {
      console.error("[TT CALLBACK] token-exchange failed", {
        status: r.status,
        bodyPreview: raw.slice(0, 400), // pour ne pas dump toute la réponse
      });
      const msg = data?.error?.message || data?.message || `oauth_exchange_failed_${r.status}`;
      return NextResponse.redirect(addMsg("/", msg));
    }

    // OK
    console.log("[TT CALLBACK] success: got refresh token");
    const refreshToken = data.data!.refresh_token!;
    const accessToken = data.data?.access_token;
    const isProd = process.env.NODE_ENV === "production";

    const res = NextResponse.redirect(addMsg("/", "connected"));
    res.cookies.set("tt_refresh", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    if (accessToken) {
      res.cookies.set("tt_access", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 2,
      });
    }
    // cleanup
    res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
    res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });
    return res;

  } catch (e) {
    console.error("[TT CALLBACK] network/handler error", e);
    return NextResponse.redirect(addMsg("/", "oauth_network_error"));
  }
}

function addMsg(base: string, msg: string) {
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}