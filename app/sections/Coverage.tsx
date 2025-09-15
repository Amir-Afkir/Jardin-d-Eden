"use client";

import { useEffect, useRef, useMemo } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import type * as Mapbox from "mapbox-gl";

type City = {
  name: string;
  coords: [number, number];
};

export default function Coverage(): ReactElement {
  // Villes (coordonnées approx autour d’Orléans)
  const cities: City[] = useMemo(
    () => [
      { name: "Orléans", coords: [1.909, 47.902] },
      { name: "Saint-Jean-de-Braye", coords: [1.973, 47.909] },
      { name: "Fleury-les-Aubrais", coords: [1.908, 47.933] },
      { name: "Saran", coords: [1.876, 47.951] },
      { name: "Semoy", coords: [1.978, 47.942] },
      { name: "Olivet", coords: [1.906, 47.862] },
    ],
    []
  );

  const MAPBOX_TOKEN: string | undefined = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Mapbox.Map | null>(null);

  useEffect(() => {
    (async () => {
      if (!MAPBOX_TOKEN || !mapRef.current) return;

      const { default: mapboxgl } = await import("mapbox-gl");
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [1.909, 47.902],
        zoom: 10.4,
        attributionControl: false,
      });
      mapInstance.current = map;

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

      // Conversion GeoJSON
      const features: GeoJSON.Feature<GeoJSON.Point, { title: string }>[] = cities.map((c) => ({
        type: "Feature",
        properties: { title: c.name },
        geometry: { type: "Point", coordinates: c.coords },
      }));

      const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, { title: string }> = {
        type: "FeatureCollection",
        features,
      };

      // Génère un polygone circulaire
      function circlePolygon(
        center: [number, number],
        radiusKm = 15,
        points = 90
      ): GeoJSON.Feature<GeoJSON.Polygon> {
        const [lng, lat] = center;
        const coords: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = (radiusKm / 111) * Math.cos(angle);
          const dy = (radiusKm / 111) * Math.sin(angle);
          coords.push([lng + dx / Math.cos((lat * Math.PI) / 180), lat + dy]);
        }
        return {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [coords] },
        };
      }

      map.on("load", () => {
        const zone = circlePolygon([1.909, 47.902], 18);

        map.addSource("zone", { type: "geojson", data: zone });
        map.addLayer({
          id: "zone-fill",
          type: "fill",
          source: "zone",
          paint: { "fill-color": "#D4AF37", "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: "zone-outline",
          type: "line",
          source: "zone",
          paint: { "line-color": "#D4AF37", "line-width": 2, "line-opacity": 0.5 },
        });

        map.addSource("villes", { type: "geojson", data: featureCollection });
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
        map.addLayer({
          id: "villes-label",
          type: "symbol",
          source: "villes",
          layout: {
            "text-field": ["get", "title"],
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

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        cities.forEach((c) => bounds.extend(c.coords));
        map.fitBounds(bounds, { padding: 60, maxZoom: 11.5, duration: 800 });
      });
    })();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [MAPBOX_TOKEN, cities]);

  return (
    <section id="zone" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Zone d’intervention</h2>
      <p className="mt-2 text-foreground/70">
        Nous intervenons sur Orléans et alentours. Voici un aperçu de notre zone et des principales communes desservies.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 space-y-3">
          <ul className="flex flex-wrap gap-2 text-sm">
            {cities.map((c) => (
              <li
                key={c.name}
                className="px-3 py-1 rounded-full border border-white/10 bg-cream/5"
              >
                {c.name}
              </li>
            ))}
          </ul>
          <p className="text-sm text-foreground/70">
            Besoin d’une intervention hors zone ? Contactez-nous, on étudie au cas par cas.
          </p>
          <Link
            href="#contact"
            className="inline-flex mt-2 items-center rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 font-medium transition-colors"
          >
            Devis gratuit
          </Link>
        </div>

        <div className="lg:col-span-3">
          <div
            ref={mapRef}
            className="w-full h-[360px] md:h-[460px] rounded-xl border border-white/10 overflow-hidden"
            style={{
              background:
                "radial-gradient(1200px 400px at 50% -200px, rgba(212,175,55,0.2), transparent)",
            }}
          />
          {!MAPBOX_TOKEN && (
            <div className="mt-2 text-xs text-foreground/60">
              ⚠️ Ajoutez <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> à vos variables d’environnement pour activer la carte.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}