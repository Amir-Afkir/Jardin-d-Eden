"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Script from "next/script";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    tiktokEmbedLoaded?: () => void;
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <ProjectsTeaser />
        <BeforeAfter />
        <Process />
        <SocialWall />
        <Coverage />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-0 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative inline-block h-20 w-20">
            <Image src="/logo-jardin-eden.jpeg" alt="Jardin d’Eden" fill className="object-contain" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-gold">  </span>
        </Link> 
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#services" className="hover:text-gold transition-colors">Services</a>
          <a href="#projets" className="hover:text-gold transition-colors">Réalisations</a>
          <a href="#process" className="hover:text-gold transition-colors">Process</a>
          <a href="#zone" className="hover:text-gold transition-colors">Zone</a>
          <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          <Link href="#contact" className="rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 font-medium transition-colors">Devis gratuit</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background video placeholder (replace src with your video) */}
      <div className="absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
        >
          <source src="/hero-garden.webm" type="video/webm" />
          <source src="/hero-garden.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-28 md:py-40">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold text-cream max-w-3xl"
        >
          Transformons votre extérieur en un espace <span className="text-gold">vivant</span> et durable
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 text-cream/90 max-w-2xl"
        >
          Conception, aménagement, entretien : des jardins qui évoluent avec les saisons.
        </motion.p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="#contact" className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-600 text-black px-6 py-3 font-medium transition-colors">
            Demander un devis
          </Link>
          <Link href="#projets" className="inline-flex items-center justify-center rounded-full border border-gold text-gold px-6 py-3 font-medium hover:bg-gold/10 transition-colors">
            Voir nos réalisations
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <div className="text-gold">★★★★★ 4,9/5 (Google)</div>
        <div>120+ projets livrés</div>
        <div>Éco‑responsable</div>
        <div>Assurance décennale</div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { title: "Conception", desc: "Plans, palettes végétales, vues" },
    { title: "Aménagement", desc: "Terrasses, allées, bassins, éclairage" },
    { title: "Végétal", desc: "Massifs, haies, pelouses éco‑gérées" },
    { title: "Arrosage & Eau", desc: "Récupération d’eau, arrosage piloté" },
    { title: "Entretien", desc: "Contrats saisonniers et ponctuels" },
    { title: "Minéral", desc: "Pierre naturelle, gabions, pas japonais" },
  ];
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Services</h2>
      <p className="mt-2 text-foreground/70 max-w-2xl">Tout ce qu’il faut pour un jardin durable et agréable à vivre.</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-white/10 p-5 hover:shadow-sm transition-shadow bg-cream/5"
          >
            <h3 className="font-medium text-gold">{it.title}</h3>
            <p className="text-sm text-foreground/70 mt-1">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ProjectsTeaser() {
  const projects = [
    { title: "Cour végétale, centre-ville", img: "/projects/p1.jpg" },
    { title: "Terrasse bois & bassin", img: "/projects/p2.jpg" },
    { title: "Jardin méditerranéen", img: "/projects/p3.jpg" },
  ];
  return (
    <section id="projets" className="bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold">Réalisations</h2>
          <Link href="/projets" className="text-sm underline text-gold hover:no-underline">Tout voir</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-xl border border-white/10 bg-cream/5">
              <div className="relative h-64">
                <Image src={p.img} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{p.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Avant / Après</h2>
      <p className="mt-2 text-foreground/70">Un aperçu de l’impact visuel d’un chantier.</p>
      {/* Simple before/after without external lib (replace images) */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="relative h-72 rounded-xl overflow-hidden border border-white/10">
          <Image src="/before.jpg" alt="Avant" fill className="object-cover" />
          <span className="absolute left-3 top-3 text-xs bg-black/60 text-white px-2 py-1 rounded">Avant</span>
        </div>
        <div className="relative h-72 rounded-xl overflow-hidden border border-white/10">
          <Image src="/after.jpg" alt="Après" fill className="object-cover" />
          <span className="absolute left-3 top-3 text-xs bg-black/60 text-white px-2 py-1 rounded">Après</span>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { t: "Appel & Devis", d: "On écoute votre besoin et on cadre le budget." },
    { t: "Étude & 3D", d: "Plans, matériaux, palettes végétales." },
    { t: "Chantier", d: "Exécution propre, délais tenus." },
    { t: "Suivi & Entretien", d: "On accompagne les saisons." },
  ];
  return (
    <section id="process" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Notre process</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-xl border border-white/10 p-5 bg-cream/5">
              <div className="text-xs text-foreground/60">Étape {i + 1}</div>
              <div className="font-medium mt-1 text-gold">{s.t}</div>
              <p className="text-sm text-foreground/70 mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TikTokGrid() {
  const [items, setItems] = useState<{ id: string; url: string; cover?: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const r = await fetch("/api/tiktok", { cache: "no-store" });
        const j: { items?: { id: string; url: string; cover?: string }[]; error?: string } = await r.json();
        if (!r.ok) throw new Error(j?.error || "Fetch failed");
        if (mounted) setItems(j.items || []);

        // hydrate embeds
        if (typeof window !== "undefined" && window.tiktokEmbedLoaded) {
          window.tiktokEmbedLoaded();
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : "unknown_error");
      }
    }

    load();
    const timer = setInterval(load, 5 * 60 * 1000); // ⏱️ 5 min

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {items.length > 0 && (
        <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
      )}
      {err && <div className="text-sm text-foreground/70">TikTok indisponible : {err}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map(({ id, url }) => (
          <blockquote
            key={id}
            className="tiktok-embed"
            cite={url}
            data-video-id=""
            style={{ maxWidth: "100%", minWidth: "260px" }}
          >
            <section>
              <a target="_blank" rel="nofollow noopener noreferrer" href={url}>{url}</a>
            </section>
          </blockquote>
        ))}
      </div>
    </>
  );
}

function SocialWall() {
  // Placeholder cards; later, replace with normalized social embeds
  return (
    <section className="bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold">En ce moment</h2>
          <Link href="/social" className="text-sm underline text-gold hover:no-underline">Tout le flux</Link>
        </div>
        <div className="mt-8">
          <TikTokGrid />
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  const cities = ["Orléans", "Saint-Jean-de-Braye", "Fleury-les-Aubrais", "Saran", "Semoy", "Olivet"];
  return (
    <section id="zone" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Zone d’intervention</h2>
      <p className="mt-2 text-foreground/70">Nous intervenons sur Orléans et alentours. Liste non exhaustive :</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {cities.map((c) => (
          <li key={c} className="px-3 py-1 rounded-full border border-white/10 bg-cream/5">{c}</li>
        ))}
      </ul>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Claire R.", text: "Résultat superbe, timing respecté !", stars: 5 },
    { name: "Marc D.", text: "Conseils au top, jardin métamorphosé.", stars: 5 },
    { name: "Leïla A.", text: "Très pro, je recommande.", stars: 5 },
  ];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Avis clients</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t) => (
            <figure key={t.name} className="rounded-xl border border-white/10 p-5 bg-cream/5">
              <div className="text-gold" aria-label={`${t.stars} étoiles`}>
                {"★★★★★".slice(0, t.stars)}
              </div>
              <blockquote className="mt-2 text-sm text-foreground/80">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-sm font-medium">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand via-brand-600 to-taupe" />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20 text-cream">
        <h2 className="text-2xl md:text-3xl font-semibold">Votre projet commence ici</h2>
        <p className="mt-2 text-cream/90 max-w-2xl">Décrivez-nous votre extérieur en 30 secondes. On vous rappelle rapidement.</p>
        <form className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="rounded-lg bg-cream text-black px-4 py-3 placeholder-black/60" placeholder="Nom" />
          <input className="rounded-lg bg-cream text-black px-4 py-3 placeholder-black/60" placeholder="Téléphone" />
          <input className="rounded-lg bg-cream text-black px-4 py-3 placeholder-black/60" placeholder="Ville" />
          <button className="rounded-lg bg-black text-cream px-4 py-3 font-medium hover:opacity-90">Demander un devis</button>
        </form>
        <p className="mt-2 text-sm text-cream/90">Ou sur WhatsApp : <a href="https://wa.me/" className="underline underline-offset-4">ouvrir la conversation</a></p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="font-semibold text-gold">Jardin d’Eden</div>
          <div>SIRET 940 465 297 00015</div>
          <div>Orléans & alentours</div>
        </div>
        <nav className="flex gap-4">
          <Link href="#services" className="hover:text-gold transition-colors">Services</Link>
          <Link href="#projets" className="hover:text-gold transition-colors">Réalisations</Link>
          <Link href="#process" className="hover:text-gold transition-colors">Process</Link>
          <Link href="#zone" className="hover:text-gold transition-colors">Zone</Link>
          <Link href="#contact" className="hover:text-gold transition-colors">Contact</Link>
        </nav>
        <div className="text-foreground/60">© {new Date().getFullYear()} Jardin d’Eden</div>
      </div>
    </footer>
  );
}

function MobileStickyCTA() {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 md:hidden px-4">
      <Link href="#contact" className="block rounded-full bg-brand hover:bg-brand-600 text-black text-center py-3 font-medium shadow-lg transition-colors">
        Demander un devis
      </Link>
    </div>
  );
}
