// app/api/auth/tiktok/callback/route.ts
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TikTokTokenOK = {
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

  // 1) garde-fous OAuth
  if (oauthError) return diag("oauth_error:" + oauthError, 400);
  if (!code) return diag("missing_code_in_query", 400);
  if (expectedState && returnedState && expectedState !== returnedState) {
    return diag("oauth_state_mismatch", 400);
  }
  if (!pkce) return diag("missing_pkce_verifier_cookie", 400);

  // 2) env vars
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return diag(
      `missing_env: ${
        !clientKey ? "TIKTOK_CLIENT_KEY " : ""
      }${!clientSecret ? "TIKTOK_CLIENT_SECRET " : ""}${
        !redirectUri ? "TIKTOK_REDIRECT_URI" : ""
      }`,
      500
    );
  }

  // 3) échange code → token
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: pkce,
  });

  let status = 0;
  let text = "";
  let json: TikTokTokenOK | undefined;

  try {
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    status = r.status;
    text = await r.text();
    try {
      json = JSON.parse(text) as TikTokTokenOK;
    } catch {
      /* texte brut */
    }
  } catch (e) {
    return diag("oauth_network_error:" + (e as Error).message, 502);
  }

  // 4) analyse réponse
  const refresh = json?.data?.refresh_token;
  const access = json?.data?.access_token;
  const apiError = json?.error?.message || json?.message;

  if (status < 200 || status >= 300 || !refresh) {
    // on affiche ce que TikTok a réellement renvoyé
    return diag(
      `oauth_exchange_failed status=${status} message=${apiError ?? "n/a"} body=${truncate(
        text,
        600
      )}`,
      502
    );
  }

  // 5) succès → set cookies + redirect
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect("/?tiktok=connected");

  res.cookies.set("tt_refresh", refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  if (access) {
    res.cookies.set("tt_access", access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });
  }
  // clean temp cookies
  res.cookies.set("tt_pkce", "", { path: "/", maxAge: 0 });
  res.cookies.set("tt_state", "", { path: "/", maxAge: 0 });

  return res;
}

// — helpers —

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…[truncated]" : s;
}

function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}

// renvoie une petite page HTML lisible (pas un 500 opaque)
function diag(msg: string, status = 500) {
  const body = `<!doctype html>
<meta charset="utf-8">
<title>TikTok OAuth callback</title>
<style>
  body{font:14px/1.4 ui-sans-serif,system-ui; padding:24px; color:#e6e6e6; background:#0b0b0b}
  code{background:#111; padding:2px 6px; border-radius:6px}
  a{color:#ffd66e}
</style>
<h1>Callback TikTok</h1>
<p><strong>Erreur:</strong> <code>${htmlEscape(msg)}</code></p>
<p><a href="/">Retour à l’accueil</a></p>`;
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}