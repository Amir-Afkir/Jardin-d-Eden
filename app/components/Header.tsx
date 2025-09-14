"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header(): React.JSX.Element {
  const pathname = usePathname();
  const onHome = pathname === "/";

  // construit une ancre compatible depuis n'importe quelle page
  const hash = (id: string): string => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[9999] isolate backdrop-blur bg-background/80 border-b border-white/10"
    >
      {/* Barre principale */}
      <div className="mx-auto max-w-6xl px-4 h-14 md:h-16 flex items-center justify-center md:justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-0 md:justify-start" aria-label="Aller à l’accueil">
          <span className="text-lg md:text-xl font-semibold tracking-tight text-gold">Le Jardin d’Eden</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Navigation principale">
          <Link href={hash("services")} className="hover:text-gold transition-colors">Services</Link>
          <Link href={hash("projets")} className="hover:text-gold transition-colors">Réalisations</Link>
          <Link href={hash("process")} className="hover:text-gold transition-colors">Process</Link>
          <Link href={hash("zone")} className="hover:text-gold transition-colors">Zone</Link>
          <Link href={hash("contact")} className="hover:text-gold transition-colors">Contact</Link>
          <Link
            href={hash("contact")}
            className="rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 font-medium transition-colors"
          >
            Devis gratuit
          </Link>
        </nav>
      </div>

      {/* Mobile nav visible (sans tiroir) */}
      <MobilePills hash={hash} />
    </header>
  );
}

type PillsProps = { hash: (id: string) => string };

function MobilePills({ hash }: PillsProps): React.JSX.Element {
  return (
    <nav
      className="md:hidden border-t border-white/10"
      aria-label="Navigation rapide mobile"
    >
      <div className="relative">
        {/* Fades latéraux pour indiquer le scroll */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-background to-transparent" />

        <ul
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2"
          role="list"
        >
          {[
            { id: "services", label: "Services" },
            { id: "projets", label: "Réalisations" },
            { id: "process", label: "Process" },
            { id: "zone", label: "Zone" },
            { id: "contact", label: "Contact" },
          ].map(({ id, label }) => (
            <li key={id} className="flex-shrink-0">
              <Link
                href={hash(id)}
                className="block rounded-full border border-white/10 bg-cream/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="flex-shrink-0 ml-1">
            <Link
              href={hash("contact")}
              className="block rounded-full bg-brand hover:bg-brand-600 text-black px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              Devis gratuit
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}