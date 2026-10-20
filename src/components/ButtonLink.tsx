import type { ReactNode } from "react";
import { Link } from "react-router";

type Variant = "primary" | "ink" | "ghost" | "light" | "ghost-light";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-paper hover:bg-accent-deep",
  ink: "bg-ink text-paper hover:bg-ink-2",
  ghost: "bg-slate text-paper hover:bg-slate-deep",
  light: "bg-paper text-ink hover:bg-card",
  "ghost-light": "ring-2 ring-inset ring-paper/30 text-paper hover:ring-paper hover:bg-paper hover:text-ink",
};

interface Props {
  to: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

export default function ButtonLink({ to, children, variant = "primary", external, className = "" }: Props) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-sm font-bold transition-all duration-200 active:scale-[0.97] ${styles[variant]} ${className}`;
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
