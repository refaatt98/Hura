import type { ReactNode } from "react";
import Container from "./Container";

/** Top banner used by inner pages. */
export default function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <div className="ruled pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="relative py-12 sm:py-16">
        <p className="file-label mb-3 !text-accent">{eyebrow}</p>
        <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{children}</div>}
      </Container>
    </section>
  );
}
