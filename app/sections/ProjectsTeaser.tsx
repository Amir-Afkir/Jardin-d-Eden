"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { JSX } from "react";
import { projects } from "../data/projects";

export default function ProjectsTeaser(): JSX.Element {
  return (
    <section id="projets" className="bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold">Réalisations</h2>
          <Link
            href="/projets"
            className="text-sm underline text-gold hover:no-underline transition-colors"
          >
            Tout voir
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                href={`/projets#${p.slug}`}
                className="group block overflow-hidden rounded-xl border border-white/10 bg-cream/5 transition-all hover:border-gold/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={`Voir le projet ${p.title}`}
              >
                <article>
                  <div className="relative h-64">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      placeholder="blur"
                      blurDataURL={p.blurDataURL}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{p.title}</h3>
                    <p className="mt-2 text-sm text-foreground/65 line-clamp-2">{p.description}</p>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
