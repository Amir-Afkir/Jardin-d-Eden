"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "../components/ui/Button";

type FormState = {
  name: string;
  phone: string;
  city: string;
  service: string;
  // Honeypot: champ que les humains ne remplissent pas
  company?: string;
};

type Errors = {
  name?: string;
  phone?: string;
  city?: string;
  service?: string;
  general?: string;
};

const SERVICES: ReadonlyArray<{ value: string; label: string }> = [
  { value: "gazon", label: "Gazon en rouleau" },
  { value: "cloture", label: "Clôture" },
  { value: "entretien", label: "Entretien" },
  { value: "creation", label: "Création" },
  { value: "pavage", label: "Pavage" },
  { value: "arrosage", label: "Arrosage automatique" },
  { value: "autre", label: "Autre" },
];

export default function ContactCTA() {
  // Reuse the existing configured number while allowing a dedicated phone setting.
  const contactPhone = (process.env.NEXT_PUBLIC_CONTACT_PHONE ?? process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "").trim();
  const dialNumber = contactPhone.replace(/[^\d+]/g, "");
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    city: "",
    service: "gazon",
    company: "", // honeypot
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverMsg, setServerMsg] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  function validatePhoneFR(v: string): boolean {
    // 06XXXXXXXX | 07XXXXXXXX, etc. espaces/points/tirets autorisés
    const digits = v.replace(/\D/g, "");
    return /^0[1-9]\d{8}$/.test(digits);
  }

  function handleChange<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
      setServerMsg("");
    };
  }

  const validate = useCallback((data: FormState): Errors => {
    const next: Errors = {};
    if (!data.name.trim()) next.name = "Nom requis";
    if (!validatePhoneFR(data.phone)) next.phone = "Téléphone invalide (format FR)";
    if (!data.city.trim()) next.city = "Ville requise";
    if (!data.service) next.service = "Choix requis";
    // Honeypot: si rempli → bot
    if (data.company && data.company.trim().length > 0) {
      next.general = "Votre demande n’a pas pu être validée.";
    }
    return next;
  }, []);

  async function sendEmail(data: FormState): Promise<boolean> {
    try {
      // Timeout 12s
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const t = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone.trim(),
          city: data.city.trim(),
          service: data.service,
        }),
        signal: controller.signal,
        cache: "no-store",
        keepalive: true,
      });

      clearTimeout(t);

      if (!res.ok) {
        let detail = "";
        try {
          const j: unknown = await res.json();
          if (j && typeof j === "object" && "error" in (j as Record<string, unknown>)) {
            const msg = (j as Record<string, unknown>).error;
            if (typeof msg === "string" && msg.trim().length > 0) detail = ` — ${msg}`;
          }
        } catch {
          // ignore json parse
        }
        setServerMsg(`Échec de l'envoi${detail}`);
        return false;
      }
      setServerMsg("Demande envoyée ✅");
      return true;
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setServerMsg("Temps d’attente dépassé — réessayez.");
      } else {
        setServerMsg("Réseau indisponible — réessayez plus tard.");
      }
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (isSubmitting) return; // double-submit guard
    setServerMsg("");

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const ok = await sendEmail(form);
    setIsSubmitting(false);

    if (ok) {
      // Optionnel: reset sauf le service (garde la sélection)
      setForm((prev) => ({ ...prev, name: "", phone: "", city: "", company: "" }));
      setErrors({});
    }
  }

  return (
    <section id="contact" className="relative py-24">
      {/* Background premium */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-brand-600/20 to-taupe/40" />
        <div
          aria-hidden
          className="absolute -top-48 right-1/3 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(212,175,55,0.35), transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {/* Colonne gauche : promesse & réassurance */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-cream">
              Votre projet mérite l’<span className="text-gold">excellence</span>
            </h2>
            <p className="mt-4 text-cream/85 leading-relaxed max-w-prose">
              Remplissez le formulaire pour demander un devis gratuit et recevoir
              des conseils personnalisés pour votre projet.
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="flex items-center gap-2 text-cream/85">
                <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                Devis gratuit
              </li>
              <li className="flex items-center gap-2 text-cream/85">
                <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                Étude personnalisée de votre projet
              </li>
              <li className="flex items-center gap-2 text-cream/85">
                <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                Conseils d’un paysagiste
              </li>
              <li className="flex items-center gap-2 text-cream/85">
                <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                Suivi de chantier clair
              </li>
            </ul>

            {dialNumber && (
              <a
                href={`tel:${dialNumber}`}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-gold/50 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                aria-label={`Appeler Le Jardin d’Eden au ${contactPhone}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.91.68 2.81a2 2 0 0 1-.45 2.11L8.07 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.68A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Appeler directement : {contactPhone}
              </a>
            )}
          </div>

          {/* Colonne droite : carte glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-background/40 via-background/10 to-transparent blur opacity-60" />
            <div className="relative rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_60px_rgba(0,0,0,0.35)]">
              <form onSubmit={onSubmit} className="space-y-4" aria-busy={isSubmitting} noValidate>
                {/* Honeypot (caché visuellement mais accessible aux bots) */}
                <div className="hidden">
                  <label htmlFor="company">Société</label>
                  <input
                    id="company"
                    name="company"
                    autoComplete="organization"
                    value={form.company ?? ""}
                    onChange={handleChange("company")}
                    tabIndex={-1}
                  />
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-sm text-cream/90">
                    Nom <span className="text-gold">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    maxLength={80}
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-cream placeholder-cream/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                    placeholder="Ex. Alice Dupont"
                    value={form.name}
                    onChange={handleChange("name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "err-name" : undefined}
                  />
                  {errors.name && <p id="err-name" className="mt-1 text-xs text-red-300">{errors.name}</p>}
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm text-cream/90">
                    Téléphone <span className="text-gold">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="^0[1-9][0-9\s\.\-]{8,}$"
                    maxLength={20}
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-cream placeholder-cream/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                    placeholder="06 12 34 56 78"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                  />
                  {errors.phone && <p id="err-phone" className="mt-1 text-xs text-red-300">{errors.phone}</p>}
                </div>

                {/* Ville */}
                <div>
                  <label htmlFor="city" className="block text-sm text-cream/90">
                    Ville <span className="text-gold">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    maxLength={80}
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-cream placeholder-cream/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                    placeholder="Ex. Orléans"
                    value={form.city}
                    onChange={handleChange("city")}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? "err-city" : undefined}
                  />
                  {errors.city && <p id="err-city" className="mt-1 text-xs text-red-300">{errors.city}</p>}
                </div>

                {/* Service */}
                <div>
                  <label htmlFor="service" className="block text-sm text-cream/90">
                    Prestation souhaitée <span className="text-gold">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                    value={form.service}
                    onChange={handleChange("service")}
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={errors.service ? "err-service" : undefined}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.service && <p id="err-service" className="mt-1 text-xs text-red-300">{errors.service}</p>}
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Button
                    as="button"
                    type="submit"
                    disabled={isSubmitting}
                    ariaLabel={isSubmitting ? "Envoi du formulaire" : "Demander un devis"}
                    variant="primary"
                    size="lg"
                    className="w-full group disabled:opacity-60"
                    data-analytics="contact:submit"
                  >
                    <span>{isSubmitting ? "Envoi en cours…" : "Demander un devis"}</span>
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Messages serveur */}
                <div className="min-h-[20px]" role="status" aria-live="polite">
                  {serverMsg && <p className="text-sm text-cream/90">{serverMsg}</p>}
                  {errors.general && <p className="text-sm text-red-300">{errors.general}</p>}
                </div>

                {/* Mentions */}
                <p className="text-[11px] leading-5 text-cream/70">
                  En envoyant ce formulaire, vous acceptez d’être recontacté au sujet de votre demande.
                  Aucune prospection abusive. Données traitées en France.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
