import type { ReactNode } from "react";

interface Props {
  index: string;
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  light?: boolean;
}

/** Big editorial section header: "/ 01 — label" + oversized title. */
export default function SectionHeading({ index, eyebrow, title, action, light }: Props) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-14">
      <div className="max-w-3xl">
        <p className={`mb-3 font-mono text-xs ${light ? "text-accent" : "text-accent-deep"}`}>
          / {index} — {eyebrow}
        </p>
        <h2 className="text-4xl leading-[1.1] font-black sm:text-6xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
