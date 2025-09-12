// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

/** ——— Types robustes (pas de any) ——— */
type OAuthError = { message?: string; code?: number };
type OAuthData = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  scope?: string;
  token_type?: string;
  open_id?: string;
};
type OAuthWrapped = { data?: OAuthData; error?: OAuthError; message?: string };
type OAuthFlat = OAuthData & { error?: OAuthError; message?: string };
type OAuthResp = OAuthWrapped | OAuthFlat;

/** ——— Helpers type-safe ——— */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const pick = <T extends string>(o: unknown, key: T): unknown =>
  isRecord(o) ? o[key] : undefined;

function extractAccessToken(resp: OAuthResp): string | undefined {
  const data = pick(resp, "data");
  const nested = isRecord(data) ? (data as OAuthData).access_token : undefined;
  const flat = (resp as OAuthFlat).access_token;
  return nested ?? flat;
}
function extractRefreshToken(resp: OAuthResp): string | undefined {
  const data = pick(resp, "data");
  const nested = isRecord(data) ? (data as OAuthData).refresh_token : undefined;
  const flat = (resp as OAuthFlat).refresh_token;
  return nested ?? flat;
}
function extractLogicalError(resp: OAuthResp): string | undefined {
  const err = pick(resp, "error");
  const msg1 = isRecord(err) ? (err.message as string | undefined) : undefined;
  const msg2 = pick(resp, "message") as string | undefined;
  return msg1 ?? msg2;
}

/** ——— Handler ——— */
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

  try {
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "jardin-eden-oauth/1.0",
      },
      body,
      cache: "no-store",
    });

    const json = (await r.json()) as OAuthResp;

    const refreshToken = extractRefreshToken(json);
    const accessToken = extractAccessToken(json);
    const logicalErr = extractLogicalError(json);

    if (!refreshToken) {
      const msg = logicalErr ?? "oauth_exchange_failed";
      return NextResponse.redirect(addMsg("/", `oauth_exchange_failed:${msg}`));
    }

    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.redirect(addMsg("/", "connected"));

    // Cookie refresh token (long)
    res.cookies.set("tt_refresh", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Cookie access token (court)
    if (accessToken) {
      res.cookies.set("tt_access", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 2,
      });
    }

    // Clean des temporaires
    res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
    res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

    return res;
  } catch {
    return NextResponse.redirect(addMsg("/", "oauth_network_error"));
  }
}

function addMsg(base: string, msg: string) {
  // URL relative (redirige vers la home avec ?tiktok=...)
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}