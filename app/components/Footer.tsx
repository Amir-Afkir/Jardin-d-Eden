import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="font-semibold text-gold">Jardin d’Eden</div>
          <div>SIRET 940 465 297 00015</div>
          <div>Orléans & alentours</div>
        </div>

        <nav className="flex flex-wrap gap-4">
          <Link href="/mentions-legales" className="hover:text-gold transition-colors">Mentions Legales</Link>
          <Link href="/conditions" className="hover:text-gold transition-colors">Conditions d’utilisation</Link>
          <Link href="/confidentialite" className="hover:text-gold transition-colors">Confidentialité</Link>
        </nav>

        <div className="text-foreground/60">© {new Date().getFullYear()} Jardin d’Eden</div>
      </div>
    </footer>
  );
}