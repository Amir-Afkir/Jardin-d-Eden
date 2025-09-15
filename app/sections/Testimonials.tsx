import type { ReactElement } from "react";

type Testimonial = {
  name: string;
  text: string;
  city?: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Testimonials(): ReactElement {
  const items: Testimonial[] = [
    { name: "Claire R.", text: "Travail impeccable, rendu magnifique.", city: "Orléans" },
    { name: "Marc D.", text: "Conseils au top, jardin métamorphosé.", city: "Saran" },
    { name: "Leïla A.", text: "Très pro, je recommande.", city: "Olivet" },
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold">Ils nous ont fait confiance</h2>
          <span className="hidden md:inline text-xs text-foreground/60">Extraits de retours clients</span>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ name, text, city }) => (
            <figure
              key={name}
              className="relative rounded-2xl border border-white/10 bg-cream/5 p-5 shadow-sm transition-all hover:shadow-md hover:border-gold/40"
            >
              {/* Accent top border */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

              {/* Quote icon */}
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-6 w-6 text-gold/70">
                <path fill="currentColor" d="M17 10c-4.4 0-8 3.6-8 8v12c0 4.4 3.6 8 8 8h3v-8h-3v-6c0-3.3 2.7-6 6-6h1v-8h-1c-2.5 0-4.9.8-6.8 2.2C19.5 11 18.3 10 17 10zm19 0c-4.4 0-8 3.6-8 8v12c0 4.4 3.6 8 8 8h3v-8h-3v-6c0-3.3 2.7-6 6-6h1v-8h-1c-2.5 0-4.9.8-6.8 2.2C38.5 11 37.3 10 36 10z"/>
              </svg>

              {/* Text */}
              <blockquote className="mt-3 text-[15px] leading-relaxed italic text-foreground/85">
                {text}
              </blockquote>

              {/* Divider */}
              <div className="mt-4 h-px bg-white/10" />

              {/* Author */}
              <figcaption className="mt-4 flex items-center gap-3 text-sm">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-black/40 ring-1 ring-white/15 text-cream font-medium">
                  {initials(name)}
                </div>
                <div>
                  <div className="font-medium">{name}</div>
                  {city && <div className="text-foreground/60 text-xs">{city}</div>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}