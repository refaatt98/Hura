import type { ReactNode } from "react";

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
}

/** Notebook-style section header: "01 — label" + big title. */
export default function SectionHeading({ index, eyebrow, title, action }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4 sm:mb-10">
      <div>
        <p className="mb-2 flex items-center gap-3 text-sm font-medium text-accent">
          <span className="font-mono">{index}</span>
          <span className="h-px w-8 bg-accent" />
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
