// app/api/auth/tiktok/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomUrlSafe(len = 48) {
  return base64url(crypto.randomBytes(len));
}

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey) throw new Error("Missing env: TIKTOK_CLIENT_KEY");
  if (!redirectUri) throw new Error("Missing env: TIKTOK_REDIRECT_URI");

  // PKCE
  const verifier = randomUrlSafe(48);
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());

  // Anti-CSRF
  const state = randomUrlSafe(16);

  const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
  const u = new URL(AUTH_URL);
  u.searchParams.set("client_key", clientKey);
  u.searchParams.set("scope", "user.info.basic,video.list");
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(u.toString());

  // Cookies temporaires (10 min)
  res.cookies.set("tt_pkce", verifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("tt_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return res;
}