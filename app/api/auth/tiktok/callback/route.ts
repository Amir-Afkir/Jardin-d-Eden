// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenShape =
  | { data?: { refresh_token?: string; access_token?: string }; error?: { message?: string }; message?: string }
  | { refresh_token?: string; access_token?: string; error?: { message?: string }; message?: string };

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"; // ← endpoint unifié

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

  let json: TokenShape;
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

    // TikTok peut renvoyer 200 même en cas d'erreur logique ; on vérifie le contenu.
    json = (await r.json()) as TokenShape;

    // Helpers de typage sûrs
    const isString = (v: unknown): v is string => typeof v === "string";

    let refreshToken: string | undefined;
    let accessToken: string | undefined;
    let logicalError: string | undefined;

    // Chemin 1: réponse imbriquée sous `data`
    if (
      typeof json === "object" &&
      json !== null &&
      "data" in json &&
      typeof (json as { data?: unknown }).data === "object" &&
      (json as { data?: unknown }).data !== null
    ) {
      const d = (json as { data: Record<string, unknown> }).data;
      const rt = d["refresh_token"];
      const at = d["access_token"];
      if (isString(rt)) refreshToken = rt;
      if (isString(at)) accessToken = at;
    }

    // Chemin 2: champs à la racine
    if (!refreshToken || !accessToken) {
      const root = json as Record<string, unknown>;
      const rt = root["refresh_token"];
      const at = root["access_token"];
      if (!refreshToken && isString(rt)) refreshToken = rt;
      if (!accessToken && isString(at)) accessToken = at;
    }

    // Extraction d'un éventuel message d'erreur
    if (typeof json === "object" && json !== null) {
      const root = json as Record<string, unknown>;
      const errObj = root["error"] as unknown;
      if (typeof errObj === "object" && errObj !== null) {
        const msg = (errObj as Record<string, unknown>)["message"];
        if (isString(msg)) logicalError = msg;
      }
      const msg2 = root["message"];
      if (!logicalError && isString(msg2)) logicalError = msg2;
    }

    if (!refreshToken) {
      const msg = logicalError || "oauth_exchange_failed";
      return NextResponse.redirect(addMsg("/", `oauth_exchange_failed:${msg}`));
    }

    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.redirect(addMsg("/", "connected"));

    // Cookie refresh token (longue durée)
    res.cookies.set("tt_refresh", refreshToken as string, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    // Cookie access token (optionnel, courte durée)
    if (accessToken) {
      res.cookies.set("tt_access", accessToken as string, {
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
  } catch {
    return NextResponse.redirect(addMsg("/", "oauth_network_error"));
  }
}

function addMsg(base: string, msg: string) {
  const u = new URL(base, "http://dummy");
  u.searchParams.set("tiktok", msg);
  return u.pathname + u.search;
}