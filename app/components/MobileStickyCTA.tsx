"use client";

import Link from "next/link";

export default function MobileStickyCTA() {
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 md:hidden px-4">
      <Link
        href="/#contact"
        className="block rounded-full bg-brand hover:bg-brand-600 text-black text-center py-3 font-medium shadow-lg transition-colors"
      >
        Demander un devis
      </Link>
    </div>
  );
}