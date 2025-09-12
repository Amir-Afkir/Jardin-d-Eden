// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

type OAuthError = { message?: string; code?: number };
type TokenWrapped = { data?: { refresh_token?: string; access_token?: string }; error?: OAuthError; message?: string };
type TokenFlat = { refresh_token?: string; access_token?: string; error?: OAuthError; message?: string };
type TokenResp = TokenWrapped | TokenFlat;

// Type guard util
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const getField = (obj: unknown, key: string): unknown =>
  isRecord(obj) ? (obj as Record<string, unknown>)[key] : undefined;

function extractTokens(resp: TokenResp) {
  let refreshToken: string | undefined;
  let accessToken: string | undefined;
  let logicalError: string | undefined;

  // chemin imbriqué: resp.data?.refresh_token / resp.data?.access_token
  const dataObj = getField(resp, "data");
  if (isRecord(dataObj)) {
    const rt = getField(dataObj, "refresh_token");
    const at = getField(dataObj, "access_token");
    if (typeof rt === "string") refreshToken = rt;
    if (typeof at === "string") accessToken = at;
  }

  // chemin flat: resp.refresh_token / resp.access_token
  if (!refreshToken || !accessToken) {
    const rt = getField(resp, "refresh_token");
    const at = getField(resp, "access_token");
    if (!refreshToken && typeof rt === "string") refreshToken = rt;
    if (!accessToken && typeof at === "string") accessToken = at;
  }

  // messages d'erreur éventuels
  const errObj = getField(resp, "error");
  if (isRecord(errObj)) {
    const msg = getField(errObj, "message");
    if (typeof msg === "string") logicalError = msg;
  }
  const flatMsg = getField(resp, "message");
  if (!logicalError && typeof flatMsg === "string") logicalError = flatMsg;

  return { refreshToken, accessToken, logicalError };
}

function addMsg(origin: string, msg: string) {
  // Build an absolute URL back to the site root with a query flag.
  const u = new URL("/", origin);
  u.searchParams.set("tiktok", msg);
  return u.toString();
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const oauthError = url.searchParams.get("error");
    const returnedState = url.searchParams.get("state");

    const expectedState = req.cookies.get("tt_state")?.value;
    const pkce = req.cookies.get("tt_pkce")?.value;

    if (oauthError) return NextResponse.redirect(addMsg(origin, `oauth_error:${oauthError}`));
    if (!code) return NextResponse.redirect(addMsg(origin, "no_code"));
    if (expectedState && returnedState && expectedState !== returnedState) {
      return NextResponse.redirect(addMsg(origin, "oauth_state_mismatch"));
    }
    if (!pkce) return NextResponse.redirect(addMsg(origin, "missing_pkce_verifier"));

    const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || "";
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || "";

    if (!clientKey || !clientSecret || !redirectUri) {
      return NextResponse.redirect(addMsg(origin, "server_env_missing"));
    }

    const body = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: pkce,
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

    console.log("[tiktok/callback] token exchange status =", r.status);

    // tente JSON, sinon texte
    let respJson: TokenResp | null = null;
    let rawText = "";
    try {
      respJson = (await r.json()) as TokenResp;
    } catch {
      try {
        rawText = await r.text();
      } catch {
        rawText = "";
      }
    }

    if (respJson) {
      console.log("[tiktok/callback] token exchange payload keys =", Object.keys(respJson as Record<string, unknown>));
    } else if (rawText) {
      console.log("[tiktok/callback] token exchange rawText (first 200) =", rawText.slice(0, 200));
    }

    // extraire tokens si JSON
    let refreshToken: string | undefined;
    let accessToken: string | undefined;
    let logicalError: string | undefined;

    if (respJson) {
      ({ refreshToken, accessToken, logicalError } = extractTokens(respJson));
    }

    if (!refreshToken) {
      const reason = logicalError || (rawText ? `raw:${rawText.slice(0, 120)}` : "no_refresh_token");
      return NextResponse.redirect(addMsg(origin, `oauth_exchange_failed:${reason}`));
    }

    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.redirect(addMsg(origin, "connected"));

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

    // nettoyage
    res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
    res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.redirect(addMsg(req.nextUrl.origin, `oauth_network_error:${msg}`));
  }
}