"use client";

import { MotionConfig, motion, useReducedMotion, type Variants, type TargetAndTransition } from "framer-motion";
import { useEffect, useMemo, useState, type JSX } from "react";
import { services } from "../data/services";

export default function Services(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect viewport size AFTER mount to avoid SSR hydration mismatches
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ===== Variants (top-tier UX: snappy yet calm, tactile on hover) =====
  const container: Variants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          // cadence douce et premium
          staggerChildren: prefersReducedMotion ? 0 : (isDesktop ? 0.05 : 0.06),
          delayChildren: prefersReducedMotion ? 0 : 0.04,
        },
      },
    }),
    [isDesktop, prefersReducedMotion]
  );

  const item: Variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.24 } },
      };
    }

    if (isDesktop) {
      // Desktop/tablette : reveal feutré, net et sans saccade
      return {
        hidden: { opacity: 0, y: 16, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 250,
            damping: 30,
            mass: 0.8,
            restDelta: 0.002,
          },
        },
      };
    }

    // Mobile : reveal vertical très doux
    return {
      hidden: { opacity: 0, y: 14, scale: 0.98 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 230,
          damping: 28,
          mass: 0.75,
          restDelta: 0.002,
        },
      },
    };
  }, [isDesktop, prefersReducedMotion]);

  // survol / tap : micro-interactions élégantes, 100% transform (GPU)
  const hoverMotion: TargetAndTransition | undefined = prefersReducedMotion
    ? undefined
    : isDesktop
    ? { y: -4, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 24 } }
    : { y: -2, scale: 1.01, transition: { type: "spring", stiffness: 280, damping: 22 } };

  const tapMotion: TargetAndTransition | undefined = prefersReducedMotion
    ? undefined
    : { scale: 0.995, transition: { type: "spring", stiffness: 380, damping: 28 } };

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      <section id="services" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
        {/* decorative premium background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-30" style={{background:"radial-gradient(40% 40% at 50% 50%, rgba(255,215,141,0.35) 0%, rgba(255,255,255,0) 70%)"}}/>
          <div className="absolute bottom-[-8rem] right-[-6rem] h-96 w-96 rounded-full blur-3xl opacity-20" style={{background:"radial-gradient(40% 40% at 50% 50%, rgba(255,215,141,0.28) 0%, rgba(255,255,255,0) 70%)"}}/>
        </div>
        <header className="[perspective:1200px]">
          <motion.h2
            className="text-2xl md:text-3xl font-semibold inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-gold to-foreground drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8, rotateX: -12 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Nos prestations
          </motion.h2>
          <motion.p
            className="mt-3 text-base sm:text-lg text-foreground/70 max-w-2xl leading-relaxed"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            viewport={{ once: true }}
          >
            Aménagement & entretien clé en main : du gazon posé en 24h à l’arrosage automatique, en passant par la
            clôture, la création sur-mesure et le pavage durable.
          </motion.p>
        </header>

        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 [perspective:1200px] transform-gpu"
          variants={prefersReducedMotion ? undefined : container}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -15% 0px" }}
        >
          {services.map((s, i) => (
            <motion.article
              key={s.key}
              variants={prefersReducedMotion ? undefined : item}
              whileHover={hoverMotion}
              whileTap={tapMotion}
              transition={{ delay: prefersReducedMotion ? 0 : (i % 3) * 0.015 }}
              style={{ backfaceVisibility: "hidden" }}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 shadow-sm transform-gpu transition-transform [transition-property:transform,opacity] will-change-transform backdrop-blur-[2px] hover:border-gold/40 focus-within:outline-none focus-within:ring-2 focus-within:ring-gold/50"
            >
              {/* subtle inner gradient */}
              <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-2xl" style={{background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 60%), radial-gradient(120% 120% at 100% 0%, rgba(255,215,141,0.10) 0%, transparent 50%)"}}/>

              {/* glowing gradient hairline on hover (premium micro-detail) */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(120deg, rgba(255,215,141,0.45), rgba(255,255,255,0.10) 30%, rgba(255,215,141,0.45))",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  padding: 1,
                }}
              />

              <h3 className="font-semibold text-base sm:text-lg text-gold tracking-tight">{s.title}</h3>
              <p className="text-sm sm:text-[15px] text-foreground/70 mt-2 leading-relaxed">{s.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </MotionConfig>
  );
}