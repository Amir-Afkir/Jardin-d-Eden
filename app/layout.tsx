import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://jardindeden45.fr");
const phoneE164 = process.env.NEXT_PUBLIC_WHATSAPP_E164;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Le Jardin d’Eden | Paysagiste à Orléans",
    template: "%s | Le Jardin d’Eden",
  },
  description:
    "Création, aménagement et entretien de jardins à Orléans et alentours : gazon en rouleau, clôture, pavage, arrosage automatique et massifs paysagers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Le Jardin d’Eden | Paysagiste à Orléans",
    description:
      "Des extérieurs vivants et durables pour particuliers autour d’Orléans : création, entretien, pavage, arrosage et clôtures.",
    url: "/",
    siteName: "Le Jardin d’Eden",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/baniere/baniere2-2560.avif",
        width: 2560,
        height: 1440,
        alt: "Aménagement paysager avec piscine, palmiers et terrasse",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "paysagiste Orléans",
    "jardin Orléans",
    "aménagement extérieur",
    "entretien jardin",
    "gazon en rouleau",
    "clôture",
    "pavage",
    "arrosage automatique",
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  name: "Le Jardin d’Eden",
  url: siteUrl.toString(),
  image: new URL("/logo-jardin-eden.jpeg", siteUrl).toString(),
  logo: new URL("/logo-jardin-eden.jpeg", siteUrl).toString(),
  description:
    "Création, aménagement et entretien paysager à Orléans et alentours.",
  ...(phoneE164 ? { telephone: phoneE164 } : {}),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orléans",
    addressRegion: "Centre-Val de Loire",
    addressCountry: "FR",
  },
  areaServed: [
    "Orléans",
    "Saint-Jean-de-Braye",
    "Fleury-les-Aubrais",
    "Saran",
    "Semoy",
    "Olivet",
  ],
  makesOffer: [
    "Création de jardin",
    "Entretien paysager",
    "Gazon en rouleau",
    "Clôture",
    "Pavage",
    "Arrosage automatique",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" as="image" href="/baniere/baniere2-2560.avif" type="image/avif" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-full focus:bg-cream focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
        >
          Aller au contenu
        </a>
        <Header />
        <div id="contenu">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
