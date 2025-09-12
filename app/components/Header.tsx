"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  // Si on n'est PAS sur la home, renvoyer vers "/#section" au lieu de "#section"
  const hash = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header
      className="
        fixed top-0 left-0 right-0
        z-[9999]            /* au-dessus des iframes/canvas tiers */
        isolate             /* crée un nouveau stacking context sûr */
        backdrop-blur bg-background/80
        border-b border-white/10
      "
    >
      <div className="mx-auto max-w-6xl px-4 py-0 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative inline-block h-20 w-20">
            <Image
              src="/logo-jardin-eden.jpeg"
              alt="Jardin d’Eden"
              fill
              className="object-contain"
              priority
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-gold" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
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
    </header>
  );
}