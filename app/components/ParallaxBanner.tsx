// app/components/ParallaxBanner.tsx
"use client";
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Vitesse relative (0.1–0.7). */
  speed?: number;
  /** Déplacement max en px (sera borné par 6vh). */
  maxShift?: number;
};

export function ParallaxBanner({ children, speed = 0.40, maxShift = 44 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!ref.current || prefersReduced) return;
    let raf = 0;

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;

      // Progress basé sur le CENTRE de l’élément → variation réelle au scroll
      const center = rect.top + rect.height / 2;
      const progressRaw = (vh / 2 - center) / (vh / 2); // [-∞,∞] ⇒ on clamp dessous
      const p = clamp(progressRaw, -1, 1);
      const eased = Math.sign(p) * easeOutQuad(Math.abs(p));

      // Cap dynamique: 6vh, min 14px, max maxShift
      const capVH = Math.round(vh * 0.06);
      const dynamicCap = clamp(capVH, 14, maxShift);

      // Mobile: effet présent mais -40%
      const scaleMobile = vw < 768 ? 0.6 : 1;
      const s = clamp(speed, 0.1, 0.7) * scaleMobile;

      const shift = clamp(eased * dynamicCap * s, -dynamicCap, dynamicCap);
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };

    // init + listeners
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReduced, speed, maxShift]);

  return (
    <div
      ref={ref}
      className="relative h-full w-full will-change-transform transform-gpu"
      aria-hidden
    >
      {children}
    </div>
  );
}