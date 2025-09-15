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
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group overflow-hidden rounded-xl border border-white/10 bg-cream/5 hover:shadow-md transition-shadow"
            >
              <div className="relative h-64">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{p.title}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}