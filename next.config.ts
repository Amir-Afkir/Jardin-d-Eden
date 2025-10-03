// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origines TikTok/TTW pour l’oEmbed (SDK, CSS, mssdk, CDN…)
const TIKTOK_SCRIPT =
  "https://www.tiktok.com https://*.tiktok.com https://*.tiktokcdn.com https://*.ttwstatic.com https://*.tiktokv.com";
const TIKTOK_STYLE = "https://*.ttwstatic.com https://*.tiktok.com";
const TIKTOK_IMG =
  "https://*.tiktokcdn.com https://*.tiktok.com https://*.ttwstatic.com https://*.tiktokv.com";
const TIKTOK_CONNECT = [
  "https://www.tiktok.com",
  "https://*.tiktok.com",
  "https://*.tiktokcdn.com",
  "https://*.ttwstatic.com",
  // endpoints d’init mssdk (différents selon régions)
  "https://*.mssdk.tiktok.com",
  // certains env/logs/experiments passent par tiktokv.com
  "https://*.tiktokv.com",
].join(" ");

const COMMON = [
  "default-src 'self'",

  // iframes (TikTok oEmbed)
  `frame-src 'self' https://www.tiktok.com https://*.tiktok.com`,

  // scripts (TikTok SDK + Mapbox). En dev on garde unsafe-eval pour Turbopack.
  `script-src 'self' ${isDev ? `'unsafe-inline' 'unsafe-eval'` : `'unsafe-inline'`} ${TIKTOK_SCRIPT} https://api.mapbox.com https://*.mapbox.com`,
  // certains navigateurs séparent script-src-elem; on le déclare explicitement
  `script-src-elem 'self' ${isDev ? `'unsafe-inline' 'unsafe-eval'` : `'unsafe-inline'`} ${TIKTOK_SCRIPT} https://api.mapbox.com https://*.mapbox.com`,

  // styles (TikTok SDK + Mapbox)
  `style-src 'self' 'unsafe-inline' ${TIKTOK_STYLE} https://api.mapbox.com https://*.mapbox.com`,
  `style-src-elem 'self' 'unsafe-inline' ${TIKTOK_STYLE} https://api.mapbox.com https://*.mapbox.com`,

  // images / vidéos / polices
  `img-src 'self' data: blob: ${TIKTOK_IMG} https://res.cloudinary.com https://lh3.googleusercontent.com https://api.mapbox.com https://*.mapbox.com`,
  `media-src 'self' blob: ${TIKTOK_IMG} https://res.cloudinary.com`,
  `font-src 'self' data: ${TIKTOK_IMG} https://api.mapbox.com https://*.mapbox.com`,

  // XHR / fetch (TikTok SDK, Mapbox, Cloudinary, Apify)
  `connect-src 'self' ${TIKTOK_CONNECT} https://api.mapbox.com https://events.mapbox.com https://*.mapbox.com https://res.cloudinary.com https://api.apify.com`,

  // workers/blobs
  `worker-src 'self' blob:`,
  `child-src blob:`,

  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920, 2560, 3840],
    imageSizes: [256, 320, 480, 640, 800],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.tiktokcdn.com" },
      { protocol: "https", hostname: "*.tiktokv.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: COMMON },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;