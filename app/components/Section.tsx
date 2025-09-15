import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function Section({ id, title, subtitle, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-16 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-semibold">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-foreground/70 max-w-2xl">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}