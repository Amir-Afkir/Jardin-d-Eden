// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OAuthError = { message?: string; code?: number };
type TokenWrapped = { data?: { refresh_token?: string; access_token?: string }; error?: OAuthError; message?: string };
type TokenFlat = { refresh_token?: string; access_token?: string; error?: OAuthError; message?: string };
type TokenResp = TokenWrapped | TokenFlat;

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function extractTokens(resp: TokenResp) {
  let refreshToken: string | undefined;
  let accessToken: string | undefined;
  let logicalError: string | undefined;

  // chemin imbriqué
  if (isRecord(resp) && isRecord((resp as any).data)) {
    const d = (resp as any).data as Record<string, unknown>;
    if (typeof d.refresh_token === "string") refreshToken = d.refresh_token;
    if (typeof d.access_token === "string") accessToken = d.access_token;
  }
  // chemin flat
  if (!refreshToken || !accessToken) {
    const root = resp as Record<string, unknown>;
    if (!refreshToken && typeof root.refresh_token === "string") refreshToken = root.refresh_token;
    if (!accessToken && typeof root.access_token === "string") accessToken = root.access_token;
  }
  // messages d'erreur
  if (isRecord(resp?.error) && typeof resp.error!.message === "string") logicalError = resp.error!.message;
  if (!logicalError && isRecord(resp) && typeof (resp as any).message === "string") logicalError = (resp as any).message;

  return { refreshToken, accessToken, logicalError };
}

function addMsg(base: string, msg: string) {
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}

export async function GET(req: NextRequest) {
  try {
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

    const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || "";
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || "";

    if (!clientKey || !clientSecret || !redirectUri) {
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

    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "jardin-eden-oauth/1.0",
      },
      body,
      cache: "no-store",
    });

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

    // extraire tokens si JSON
    let refreshToken: string | undefined;
    let accessToken: string | undefined;
    let logicalError: string | undefined;

    if (respJson) {
      ({ refreshToken, accessToken, logicalError } = extractTokens(respJson));
    }

    if (!refreshToken) {
      const reason = logicalError || (rawText ? `raw:${rawText.slice(0, 120)}` : "no_refresh_token");
      return NextResponse.redirect(addMsg("/", `oauth_exchange_failed:${reason}`));
    }

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

    // nettoyage
    res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
    res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

    return res;
  } catch (err) {
    // on ne laisse jamais fuiter une exception → redirection contrôlée
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.redirect(addMsg("/", `oauth_network_error:${msg}`));
  }
}