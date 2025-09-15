import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
<link rel="preload" as="image" href="/baniere2.webp" type="image/webp" />

export const metadata: Metadata = {
  title: "Jardin d’Eden",
  description: "Aménagement & entretien paysager – Orléans et alentours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
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