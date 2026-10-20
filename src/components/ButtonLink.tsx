import type { ReactNode } from "react";
import { Link } from "react-router";

type Variant = "primary" | "ink" | "ghost" | "light";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-paper hover:bg-accent-deep shadow-[3px_3px_0_var(--color-ink)]",
  ink: "bg-ink text-paper hover:bg-ink-soft shadow-[3px_3px_0_var(--color-accent)]",
  ghost: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-card shadow-[3px_3px_0_var(--color-accent)]",
};

interface Props {
  to: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

export default function ButtonLink({ to, children, variant = "primary", external, className = "" }: Props) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-sm font-semibold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${styles[variant]} ${className}`;
  return external ? (
    <a href={to} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}
