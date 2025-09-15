"use client";

import { motion } from "framer-motion";

export default function Process() {
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
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-xl border border-white/10 p-5 bg-cream/5 hover:shadow-md hover:border-gold/40 transition-all"
            >
              <div className="text-xs text-foreground/60">Étape {i + 1}</div>
              <div className="font-medium mt-1 text-gold">{s.t}</div>
              <p className="text-sm text-foreground/70 mt-1">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}