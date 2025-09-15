import type { ReactElement } from "react";

type Testimonial = {
  name: string;
  text: string;
  stars: number;
};

export default function Testimonials(): ReactElement {
  const items: Testimonial[] = [
    { name: "Claire R.", text: "Résultat superbe, timing respecté !", stars: 5 },
    { name: "Marc D.", text: "Conseils au top, jardin métamorphosé.", stars: 5 },
    { name: "Leïla A.", text: "Très pro, je recommande.", stars: 5 },
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Avis clients</h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ name, text, stars }) => (
            <figure
              key={name}
              className="rounded-xl border border-white/10 p-5 bg-cream/5"
            >
              <div className="text-gold" aria-label={`${stars} étoiles`}>
                {"★★★★★".slice(0, stars)}
              </div>
              <blockquote className="mt-2 text-sm text-foreground/80">
                “{text}”
              </blockquote>
              <figcaption className="mt-3 text-sm font-medium">{name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}