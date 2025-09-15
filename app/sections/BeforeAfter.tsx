"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Avant / Après</h2>
      <p className="mt-2 text-foreground/70">
        Un aperçu de l’impact visuel d’un chantier.
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {[
          { src: "/before.webp", label: "Avant" },
          { src: "/after.webp", label: "Après" },
        ].map((img, i) => (
          <motion.div
            key={img.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="relative h-72 rounded-xl overflow-hidden border border-white/10 group shadow-sm hover:shadow-md transition-shadow"
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 text-xs font-medium bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
              {img.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}