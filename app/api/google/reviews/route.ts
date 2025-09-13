import { NextResponse } from "next/server";

// Cache mémoire simple (12 h)
type CacheEntry = { data: any; ts: number };
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

    const json = await r.json();

    // 3) Normalisation légère + limitation à 3–5 avis récents
    const reviews = Array.isArray(json.reviews) ? json.reviews : [];
    reviews.sort((a: any, b: any) => +new Date(b.publishTime) - +new Date(a.publishTime));
    const trimmed = {
      displayName: json.displayName?.text ?? json.displayName ?? "Google",
      googleMapsUri: json.googleMapsUri,
      rating: json.rating ?? null,
      userRatingCount: json.userRatingCount ?? 0,
      reviewSummary: json.reviewSummary ?? null,
      reviews: reviews.slice(0, 5).map((rv: any) => ({
        author: rv.authorAttribution?.displayName ?? "Utilisateur Google",
        authorUri: rv.authorAttribution?.uri ?? null,
        authorPhoto: rv.authorAttribution?.photoUri ?? null,
        rating: rv.rating ?? null,
        text: rv.text?.text ?? rv.text ?? rv.originalText?.text ?? "",
        publishTime: rv.publishTime ?? null,
      })),
    };

    // 4) Cache mémoire
    CACHE = { data: trimmed, ts: Date.now() };

    return NextResponse.json(trimmed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: e?.message }, { status: 500 });
  }
}