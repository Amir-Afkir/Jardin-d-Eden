"use client";
import Link, { LinkProps } from "next/link";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "outline";
type ButtonSize = "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BTN_SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: [
    "text-black bg-gradient-to-r from-brand-600 to-brand border border-transparent",
    // Mobile: ombre légère
    "shadow-[0_3px_8px_rgba(0,0,0,0.12)]",
    // Desktop+: ombre premium
    "sm:shadow-[0_6px_14px_rgba(0,0,0,0.18)]",
    // Hover
    "hover:-translate-y-0.5 hover:bg-gradient-to-l hover:from-brand-600 hover:to-brand hover:text-white",
    "hover:sm:shadow-[0_12px_26px_rgba(0,0,0,0.24),0_10px_24px_rgba(31,161,90,0.14)]",
    // Active
    "active:translate-y-0 active:scale-[0.99] active:shadow-[0_3px_8px_rgba(0,0,0,0.14)]",
    // Focus
    "focus-visible:ring-brand-500",
  ].join(" "),
  outline: [
    "border border-gold text-gold bg-transparent",
    // Mobile: ombre légère
    "shadow-[0_2px_6px_rgba(0,0,0,0.08)]",
    // Desktop+: ombre premium
    "sm:shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
    // Hover
    "hover:-translate-y-0.5 hover:bg-gold/10",
    "hover:sm:shadow-[0_10px_22px_rgba(0,0,0,0.18),0_8px_20px_rgba(216,178,110,0.18)]",
    // Active
    "active:translate-y-0 active:scale-[0.99] active:shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
    // Focus
    "focus-visible:ring-gold/60",
  ].join(" "),
};

// Props communs
interface CommonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  ariaLabel: string;
  "data-analytics"?: string;
}

// Variante bouton natif (discriminant strict)
export type ButtonAsButtonProps = CommonProps & {
  as: "button";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  href?: undefined;
};

// Variante lien Next (discriminant strict)
export type ButtonAsLinkProps = CommonProps & Omit<LinkProps, "onClick" | "as"> & {
  as: "link";
  href: LinkProps["href"];
  type?: undefined;
  onClick?: undefined;
  disabled?: never;
};

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "lg", className, ariaLabel, "data-analytics": da } = props;
  const classes = cn(BTN_BASE, BTN_SIZES[size], BTN_VARIANTS[variant], className);

  // Branche: <button>
  if (props.as === "button") {
    return (
      <button
        type={props.type ?? "button"}
        aria-label={ariaLabel}
        className={classes}
        onClick={props.onClick}
        disabled={props.disabled}
        data-analytics={da}
      >
        {props.children}
      </button>
    );
  }

  // Branche: <Link> — retirer notre `as` interne pour éviter collision avec Next
  const { as: _internalAs, children, ariaLabel: _al, className: _cn, "data-analytics": _da, ...linkProps } = props as ButtonAsLinkProps;

  return (
    <Link
      {...(linkProps as LinkProps)}
      aria-label={ariaLabel}
      className={classes}
      data-analytics={da}
    >
      {children}
    </Link>
  );
}