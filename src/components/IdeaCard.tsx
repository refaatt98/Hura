import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import type { Idea } from "../types";
import { compactRange, money } from "../lib/format";
import DifficultyMeter from "./DifficultyMeter";

/** An idea presented as an "opportunity file" folder. */
export default function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link to={`/ideas/${idea.id}`} className="group relative block pt-5">
      {/* folder tab */}
      <span className="absolute top-0 right-5 rounded-t-lg border-2 border-b-0 border-ink bg-card px-3 pt-1 pb-1.5 font-mono text-[11px] tracking-widest text-ink-soft">
        {idea.code}
      </span>
      <article className="relative flex h-full flex-col rounded-xl rounded-tr-none border-2 border-ink bg-card p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_var(--color-ink)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="file-label">ملف فرصة</span>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-deep">{idea.category}</span>
        </div>
        <h3 className="mb-2 text-xl font-bold">{idea.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">{idea.summary}</p>

        <dl className="mt-auto grid grid-cols-3 border-y border-dashed border-line py-3 text-center">
          <div>
            <dt className="text-[11px] text-muted">رأس المال</dt>
            <dd dir="ltr" className="font-mono text-sm font-medium">{compactRange(idea.capitalMin, idea.capitalMax)}</dd>
          </div>
          <div className="border-x border-dashed border-line">
            <dt className="text-[11px] text-muted">الاسترداد</dt>
            <dd className="font-mono text-sm font-medium">{idea.paybackMonths} شهر</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">الهامش</dt>
            <dd className="font-mono text-sm font-medium">{idea.marginPercent}%</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between text-sm">
          <DifficultyMeter value={idea.difficulty} />
          <span className="inline-flex items-center gap-1.5 font-display font-semibold text-accent">
            {money(idea.price)}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}
