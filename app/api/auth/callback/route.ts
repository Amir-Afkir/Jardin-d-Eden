import { NextResponse, NextRequest } from "next/server";

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

  if (oauthError) return NextResponse.redirect(addMsg("/", `oauth_error:${oauthError}`));
  if (!code) return NextResponse.redirect(addMsg("/", "no_code"));
  if (expectedState && returnedState && expectedState !== returnedState) {
    return NextResponse.redirect(addMsg("/", "oauth_state_mismatch"));
  }
  if (!pkce) return NextResponse.redirect(addMsg("/", "missing_pkce_verifier"));

  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
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

  console.log("TT REFRESH =", data.data?.refresh_token);

  const refreshToken = data.data?.refresh_token as string;
  const accessToken = data.data?.access_token as string | undefined;
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
  res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
  res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

  return res;
}

function addMsg(base: string, msg: string) {
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}