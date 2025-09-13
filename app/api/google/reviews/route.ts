"use client";
import { NextResponse } from "next/server";

// Cache mémoire simple (12 h)
type AuthorAttr = { displayName?: string; uri?: string; photoUri?: string };
type GoogleReview = {
  authorAttribution?: AuthorAttr;
  rating?: number;
  text?: { text?: string } | string | null;
  originalText?: { text?: string } | null;
  publishTime?: string | null;
};
type PlaceResponse = {
  displayName?: { text?: string } | string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  reviewSummary?: unknown;
  reviews?: GoogleReview[];
};
type TrimmedReview = {
  author: string;
  authorUri: string | null;
  authorPhoto: string | null;
  rating: number | null;
  text: string;
  publishTime: string | null;
};
type Trimmed = {
  displayName: string;
  googleMapsUri?: string;
  rating: number | null;
  userRatingCount: number;
  reviewSummary: unknown;
  reviews: TrimmedReview[];
};
type CacheEntry = { data: Trimmed; ts: number };

let CACHE: CacheEntry | null = null;
const TTL_MS = 12 * 60 * 60 * 1000;

export async function GET() {
  try {
    // 1) Cache
    if (CACHE && Date.now() - CACHE.ts < TTL_MS) {
      return NextResponse.json(CACHE.data, { status: 200 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACES_PLACE_ID; // format v1: "places/XXXX"
    if (!apiKey || !placeId) {
      return NextResponse.json({ error: "Missing Google Places env vars" }, { status: 500 });
    }

    // 2) Appel Places API v1 (Place Details – New)
    const url = new URL(`https://places.googleapis.com/v1/${placeId}`);
    // Astuces de localisation
    url.searchParams.set("languageCode", "fr");
    url.searchParams.set("regionCode", "FR");

    const r = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          [
            "displayName",
            "googleMapsUri",
            "rating",
            "userRatingCount",
            "reviews",
            "reviews.authorAttribution.displayName",
            "reviews.rating",
            "reviews.text",
            "reviews.publishTime",
            "reviews.authorAttribution.uri",
            "reviews.authorAttribution.photoUri",
            "reviews.originalText",
            "reviewSummary" // dispo sur certaines fiches
          ].join(","),
      },
      // Réduit la latence réseau
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: "places_api_error", detail: text }, { status: r.status });
    }

    const json: PlaceResponse = await r.json();

    // 3) Normalisation légère + limitation à 3–5 avis récents
    const reviews: GoogleReview[] = Array.isArray(json.reviews) ? json.reviews : [];
    reviews.sort((a: GoogleReview, b: GoogleReview) => {
      const ta = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      const tb = b.publishTime ? new Date(b.publishTime).getTime() : 0;
      return tb - ta;
    });
    const trimmed: Trimmed = {
      displayName:
        typeof json.displayName === "string"
          ? json.displayName
          : (json.displayName?.text ?? "Google"),
      googleMapsUri: json.googleMapsUri,
      rating: typeof json.rating === "number" ? json.rating : null,
      userRatingCount: typeof json.userRatingCount === "number" ? json.userRatingCount : 0,
      reviewSummary: json.reviewSummary ?? null,
      reviews: reviews.slice(0, 5).map((rv: GoogleReview): TrimmedReview => ({
        author: rv.authorAttribution?.displayName ?? "Utilisateur Google",
        authorUri: rv.authorAttribution?.uri ?? null,
        authorPhoto: rv.authorAttribution?.photoUri ?? null,
        rating: typeof rv.rating === "number" ? rv.rating : null,
        text:
          (typeof rv.text === "string" ? rv.text : rv.text?.text) ??
          rv.originalText?.text ??
          "",
        publishTime: rv.publishTime ?? null,
      })),
    };

    // 4) Cache mémoire
    CACHE = { data: trimmed, ts: Date.now() };

    return NextResponse.json(trimmed, { status: 200 });
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ error: "server_error", detail }, { status: 500 });
  }
}