import { NextResponse } from "next/server";
import crypto from "crypto";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function genVerifier(len = 48) {
  return base64url(crypto.randomBytes(len));
}

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI!;
  if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY missing");
  if (!redirectUri) throw new Error("TIKTOK_REDIRECT_URI missing");

  const verifier = genVerifier(48);
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = genVerifier(16);

  const u = new URL("https://www.tiktok.com/v2/auth/authorize/");
  u.searchParams.set("client_key", clientKey);
  u.searchParams.set("scope", "user.info.basic,video.list");
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(u.toString());
  res.cookies.set("tt_pkce", verifier, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 600 });
  res.cookies.set("tt_state", state, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 600 });

  return res;
}