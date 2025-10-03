import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Jardin d’Eden",
  description: "Aménagement & entretien paysager – Orléans et alentours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" as="image" href="/baniere/baniere2.webp" type="image/webp" />
        {/*
          Connexions réseau anticipées — préconnect/dns-prefetch
          - TikTok embeds/CDN
          - Cloudinary (HLS/medias)
          - Apify (cache TikTok)
          - Google avatars (Reviews)
        */}
        <link rel="preconnect" href="https://www.tiktok.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.tiktok.com" />

        <link rel="preconnect" href="https://v16-webapp.tiktok.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://v16-webapp.tiktok.com" />

        <link rel="preconnect" href="https://p16-sign-va-h2.tiktokcdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://p16-sign-va-h2.tiktokcdn.com" />

        <link rel="preconnect" href="https://www.ttwstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.ttwstatic.com" />

        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        <link rel="preconnect" href="https://api.apify.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.apify.com" />

        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Header />
        {/* réserve la hauteur du header fixe (~96px). Ajuste si ton header change */}
        <main>{children}</main>
        <Footer />
        {/* Garde le CTA sous le header (z-40 < z-[9999]) */} 
      </body>
    </html>
  );
}