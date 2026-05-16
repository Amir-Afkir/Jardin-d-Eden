import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/app/data/projects";
import { Button } from "@/app/components/ui/Button";

export const metadata: Metadata = {
  title: "Réalisations paysagères à Orléans",
  description:
    "Découvrez les réalisations du Jardin d’Eden autour d’Orléans : allées, massifs, palmiers, éclairage, zones minérales et espaces de détente.",
  alternates: {
    canonical: "/projets",
  },
  openGraph: {
    title: "Réalisations paysagères à Orléans | Le Jardin d’Eden",
    description:
      "Galerie de projets paysagers réalisés autour d’Orléans par Le Jardin d’Eden.",
    url: "/projets",
    images: [
      {
        url: projects[0].image,
        width: 1536,
        height: 1152,
        alt: projects[0].title,
      },
    ],
  },
};

const galleryJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Réalisations paysagères du Jardin d’Eden",
  hasPart: projects.map((project) => ({
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: project.image,
  })),
};

export default function ProjectsPage() {
  const tags = Array.from(new Set(projects.flatMap((project) => project.tags)));

  return (
    <main className="min-h-screen bg-background pt-28 text-foreground md:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <Link
            href="/#projets"
            className="text-sm text-gold underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Retour à l’accueil
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-cream md:text-5xl">
            Réalisations paysagères autour d’Orléans
          </h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/75 md:text-lg">
            Une sélection de chantiers mêlant végétal, minéral, éclairage et circulation.
            Chaque extérieur est pensé pour rester lisible, durable et agréable à vivre au fil des saisons.
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Types de réalisations">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 bg-cream/5 px-3 py-1.5 text-foreground/75"
            >
              {tag}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <article
              key={project.slug}
              id={project.slug}
              className="scroll-mt-32 overflow-hidden rounded-xl border border-white/10 bg-cream/5 shadow-sm transition-all hover:border-gold/40 hover:shadow-md"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL={project.blurDataURL}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-cream">{project.title}</h2>
                <p className="mt-2 leading-relaxed text-foreground/75">{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-cream/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-cream">Un extérieur à transformer ?</h2>
            <p className="mt-2 text-foreground/70">
              Décrivez votre projet et recevez un premier cadrage clair sous 24h ouvrées.
            </p>
          </div>
          <Button as="link" href="/#contact" ariaLabel="Demander un devis gratuit" variant="primary" size="lg">
            Demander un devis
          </Button>
        </div>
      </section>
    </main>
  );
}
