import { Link } from "react-router";
import { ArrowLeft, Check, Plus } from "lucide-react";
import type { Idea } from "../types";
import { compactRange, money, monthsLabel } from "../lib/format";
import DifficultyMeter from "./DifficultyMeter";

/** An idea presented as an "opportunity file" folder. */
interface Props {
  idea: Idea;
  /** When provided, shows a "compare" toggle on the card. */
  compare?: { selected: boolean; disabled: boolean; onToggle: () => void };
}

export default function IdeaCard({ idea, compare }: Props) {
  return (
    <div className="relative h-full">
    <Link to={`/ideas/${idea.id}`} className="group relative block h-full pt-5">
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
            <dd className="font-mono text-sm font-medium">{monthsLabel(idea.paybackMonths)}</dd>
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
    {compare && (
      <button
        type="button"
        onClick={compare.onToggle}
        disabled={compare.disabled && !compare.selected}
        aria-pressed={compare.selected}
        className={`absolute top-0 left-4 inline-flex items-center gap-1 rounded-t-lg border-2 border-b-0 px-2.5 pt-1 pb-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          compare.selected ? "border-accent bg-accent text-paper" : "border-ink bg-paper text-ink hover:bg-accent-soft"
        }`}
      >
        {compare.selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
        قارن
      </button>
    )}
    </div>
  );
}
