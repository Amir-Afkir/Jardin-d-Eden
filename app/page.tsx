"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Script from "next/script";

import { useEffect, useState, useRef } from "react";
import type * as Mapbox from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpeg"
        >
          <source src="/hero-garden.webm" type="video/webm" />
          <source src="/hero-garden.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-28 md:py-40">
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
    { title: "Gazon en rouleau", desc: "Pose express, rendu immédiat, variétés adaptées au climat local." },
    { title: "Clôture", desc: "Clôtures bois, grillage rigide, occultants — esthétique & sécurité." },
    { title: "Entretien", desc: "Taille, désherbage, tonte, fertilisation — contrats saisonniers." },
    { title: "Création", desc: "Conception complète de jardin : massifs, allées, éclairage, bassins." },
    { title: "Pavage", desc: "Terrasses & allées en pierre/pavés — poses durables et antidérapantes." },
    { title: "Arrosage automatique", desc: "Systèmes pilotés & économes, programmateurs et goutte‑à‑goutte." },
  ];
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Nos prestations</h2>
      <p className="mt-2 text-foreground/70 max-w-2xl">
        Aménagement & entretien clé en main : du gazon posé en 24h à l’arrosage automatique, en passant par la clôture,
        la création sur‑mesure et le pavage durable.
      </p>
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
    { title: "Cour végétale, centre-ville", img: "/projects/p1.jpeg" },
    { title: "Terrasse bois & bassin", img: "/projects/p2.jpeg" },
    { title: "Jardin méditerranéen", img: "/projects/p3.jpeg" },
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
          <Image src="/before.webp" alt="Avant" fill className="object-cover" />
          <span className="absolute left-3 top-3 text-xs bg-black/60 text-white px-2 py-1 rounded">Avant</span>
        </div>
        <div className="relative h-72 rounded-xl overflow-hidden border border-white/10">
          <Image src="/after.webp" alt="Après" fill className="object-cover" />
          <span className="absolute left-3 top-3 text-xs bg-black/60 text-white px-2 py-1 rounded">Après</span>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { t: "Appel & Devis", d: "On écoute votre besoin et on cadre le budget." },
    { t: "Étude", d: "Plans, matériaux, palettes végétales." },
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
  const [items, setItems] = useState<{ id: string; url: string; embed?: string; cover?: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const r = await fetch("/api/tiktok", { cache: "no-store", credentials: "include" });
        const status = r.status;
        const j: { items?: { id: string; url: string; embed?: string; cover?: string }[]; error?: string } = await r.json();

        if (!r.ok) {
          const msg = j?.error || (status === 401 ? "not_connected" : "fetch_failed");
          throw new Error(msg);
        }

        if (mounted) {
          setItems(j.items || []);
          setErr(null);
        }

        // hydrate embeds si le script est déjà chargé
        if (typeof window !== "undefined" && window.tiktokEmbedLoaded) {
          window.tiktokEmbedLoaded();
        }
      } catch (e) {
        if (mounted) setErr(e instanceof Error ? e.message : "unknown_error");
      }
    }

    load();
    timer = setInterval(load, 5 * 60 * 1000); // ⏱️ 5 min

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* Ne charge le script d’embed que s’il y a des items sans embed */}
      {items.some((i) => !i.embed) && (
        <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
      )}

      {/* Message d’erreur + CTA connexion si 401 */}
      {err === "not_connected" && (
        <div className="text-sm text-foreground/70">
          TikTok non connecté.{" "}
          <a className="underline" href="/api/auth/tiktok">Connecter le compte TikTok</a>
        </div>
      )}
      {err && err !== "not_connected" && (
        <div className="text-sm text-foreground/70">TikTok indisponible : {err}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map(({ id, url, embed, cover }) => (
          embed ? (
            <iframe
              key={id}
              src={embed}
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ width: "100%", aspectRatio: "9 / 16", border: 0, borderRadius: 12 }}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <blockquote
              key={id}
              className="tiktok-embed"
              cite={url}
              style={{ maxWidth: "100%", minWidth: 260 }}
            >
              <section>
                <a target="_blank" rel="nofollow noopener noreferrer" href={url}>
                  {url}
                </a>
              </section>
            </blockquote>
          )
        ))}
      </div>
    </>
  );
}

function SocialWall() {
  // Placeholder cards; later, replace with normalized social embeds
  return (
    <section id="social" className="bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold">En ce moment</h2>
          <Link href="#social" prefetch={false} className="text-sm underline text-gold hover:no-underline">Tout le flux</Link>
        </div>
        <div className="mt-8">
          <TikTokGrid />
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  // Villes + coords (approx) pour un rendu réaliste autour d'Orléans
  const cities = [
    { name: "Orléans", coords: [1.909, 47.902] },
    { name: "Saint-Jean-de-Braye", coords: [1.973, 47.909] },
    { name: "Fleury-les-Aubrais", coords: [1.908, 47.933] },
    { name: "Saran", coords: [1.876, 47.951] },
    { name: "Semoy", coords: [1.978, 47.942] },
    { name: "Olivet", coords: [1.906, 47.862] },
  ];

  // Token Mapbox (défini côté env de build)
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Mapbox container ref
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Mapbox.Map | null>(null);

  useEffect(() => {
    (async () => {
      if (!MAPBOX_TOKEN || !mapRef.current) return;

      // import dynamique pour éviter le SSR
      const { default: mapboxgl } = await import("mapbox-gl");
      mapboxgl.accessToken = MAPBOX_TOKEN as string;
      // Initialise la carte (style sombre élégant)
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [1.909, 47.902],
        zoom: 10.4,
        attributionControl: false,
      });
      mapInstance.current = map;

      // Ajoute contrôles minimalistes
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

      // Convertit les villes en GeoJSON (typé)
      const features: GeoJSON.Feature<GeoJSON.Point, { title: string }>[] = cities.map((c) => ({
        type: "Feature",
        properties: { title: c.name },
        geometry: { type: "Point", coordinates: c.coords as [number, number] },
      }));
      const fc: GeoJSON.FeatureCollection<GeoJSON.Point, { title: string }> = {
        type: "FeatureCollection",
        features,
      };

      // Fonction pour générer un polygone circulaire (zone d'intervention)
      function circlePolygon(center: [number, number], radiusKm = 15, points = 90): GeoJSON.Feature<GeoJSON.Polygon> {
        const [lng, lat] = center;
        const coords: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = (radiusKm / 111) * Math.cos(angle); // ~111km par degré lat
          const dy = (radiusKm / 111) * Math.sin(angle);
          coords.push([lng + dx / Math.cos((lat * Math.PI) / 180), lat + dy]);
        }
        return {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [coords as [number, number][]],
          },
        };
      }

      map.on("load", () => {
        // Couche zone (halo doux)
        const zone: GeoJSON.Feature<GeoJSON.Polygon> = circlePolygon([1.909, 47.902], 18);
        map.addSource("zone", { type: "geojson", data: zone as GeoJSON.Feature<GeoJSON.Polygon> });
        map.addLayer({
          id: "zone-fill",
          type: "fill",
          source: "zone",
          paint: {
            "fill-color": "#D4AF37",
            "fill-opacity": 0.08,
          },
        });
        map.addLayer({
          id: "zone-outline",
          type: "line",
          source: "zone",
          paint: {
            "line-color": "#D4AF37",
            "line-width": 2,
            "line-opacity": 0.5,
          },
        });

        // Source des points
        map.addSource("villes", { type: "geojson", data: fc as GeoJSON.FeatureCollection<GeoJSON.Point, { title: string }> });

        // Glow sous les points
        map.addLayer({
          id: "villes-glow",
          type: "circle",
          source: "villes",
          paint: {
            "circle-radius": 14,
            "circle-color": "#D4AF37",
            "circle-opacity": 0.18,
            "circle-blur": 0.6,
          },
        });

        // Points premium
        map.addLayer({
          id: "villes-point",
          type: "circle",
          source: "villes",
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#000",
            "circle-color": "#D4AF37",
          },
        });

        // Labels
        map.addLayer({
          id: "villes-label",
          type: "symbol",
          source: "villes",
          layout: {
            "text-field": ["get", "title"],
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#F5E9D5",
            "text-halo-color": "rgba(0,0,0,0.6)",
            "text-halo-width": 1,
          },
        });

        // Fit aux features
        const bounds = new mapboxgl.LngLatBounds();
        cities.forEach((c) => bounds.extend(c.coords as [number, number]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 11.5, duration: 800 });
      });
    })();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MAPBOX_TOKEN]);

  return (
    <section id="zone" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Zone d’intervention</h2>
      <p className="mt-2 text-foreground/70">
        Nous intervenons sur Orléans et alentours. Voici un aperçu de notre zone et des principales communes desservies.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Colonne texte */}
        <div className="lg:col-span-2 space-y-3">
          <ul className="flex flex-wrap gap-2 text-sm">
            {cities.map((c) => (
              <li key={c.name} className="px-3 py-1 rounded-full border border-white/10 bg-cream/5">{c.name}</li>
            ))}
          </ul>
          <p className="text-sm text-foreground/70">
            Besoin d’une intervention hors zone ? Contacte-nous, on étudie au cas par cas.
          </p>
          <Link
            href="#contact"
            className="inline-flex mt-2 items-center rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 font-medium transition-colors"
          >
            Devis gratuit
          </Link>
        </div>

        {/* Carte */}
        <div className="lg:col-span-3">
          <div
            ref={mapRef}
            className="w-full h-[360px] md:h-[460px] rounded-xl border border-white/10 overflow-hidden"
            style={{ background: "radial-gradient(1200px 400px at 50% -200px, rgba(212,175,55,0.2), transparent)" }}
          />
          {!MAPBOX_TOKEN && (
            <div className="mt-2 text-xs text-foreground/60">
              ⚠️ Ajoute <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> à tes variables d’environnement pour activer la carte.
            </div>
          )}
        </div>
      </div>
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
