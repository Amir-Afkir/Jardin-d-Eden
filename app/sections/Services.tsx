"use client";

import { motion } from "framer-motion";
import type { JSX } from "react";
import { services } from "../data/services";

export default function Services(): JSX.Element {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold">Nos prestations</h2>
      <p className="mt-2 text-foreground/70 max-w-2xl">
        Aménagement & entretien clé en main : du gazon posé en 24h à l’arrosage automatique, en passant par la clôture,
        la création sur-mesure et le pavage durable.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map((s) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-white/10 p-5 bg-cream/5 hover:shadow-md hover:border-gold/40 transition-all"
          >
            <h3 className="font-medium text-gold">{s.title}</h3>
            <p className="text-sm text-foreground/70 mt-1">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}