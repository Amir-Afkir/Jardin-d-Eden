import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={[
        "relative",
        centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className,
      ].join(" ")}
    >
      <div className={centered ? "section-kicker justify-center before:hidden" : "section-kicker"}>
        {eyebrow}
      </div>
      <div className={action ? "mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" : ""}>
        <div>
          <h2 className="section-title">{title}</h2>
          {description && <p className="section-copy">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
