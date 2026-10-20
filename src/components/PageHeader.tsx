import type { ReactNode } from "react";
import { motion } from "motion/react";
import Container from "./Container";

/** Dark top banner used by inner pages (sits under the floating header). */
export default function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="grid-lines relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[28rem] rounded-full bg-accent/25 blur-[120px]" />
      <Container className="relative pt-32 pb-14 sm:pt-40 sm:pb-20">
        <p className="mb-4 font-mono text-xs text-accent">/ {eyebrow}</p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[2.6rem] leading-[1.1] font-black sm:text-7xl"
        >
          {title}
        </motion.h1>
        {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/70">{children}</div>}
      </Container>
    </section>
  );
}
