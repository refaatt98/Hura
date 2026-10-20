import { Link } from "react-router";
import { ArrowUpLeft, Check, Plus } from "lucide-react";
import type { Idea } from "../types";
import { compactRange, money, monthsLabel } from "../lib/format";
import DifficultyMeter from "./DifficultyMeter";

interface Props {
  idea: Idea;
  /** When provided, shows a "compare" toggle on the card. */
  compare?: { selected: boolean; disabled: boolean; onToggle: () => void };
  /** Background color behind the card — used to cut the ticket notches. */
  notch?: string;
}

/** An idea presented as an "opportunity ticket" with a tear-off stub. */
export default function IdeaCard({ idea, compare, notch = "var(--color-paper)" }: Props) {
  return (
    <div className="relative h-full">
      <Link
        to={`/ideas/${idea.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(14,24,48,.45)] hover:ring-ink"
      >
        {/* main part */}
        <div className="flex flex-1 flex-col p-5 pb-6">
          <span className="mb-5 self-start rounded-md bg-ink px-2 py-1 font-mono text-[11px] font-semibold text-flap-amber">{idea.code}</span>
          <span className="mb-1 text-xs font-medium text-accent-deep">{idea.category}</span>
          <h3 className="text-2xl leading-snug font-extrabold">{idea.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{idea.summary}</p>
          <div className="mt-auto pt-5">
            <DifficultyMeter value={idea.difficulty} />
          </div>
        </div>

        {/* perforation */}
        <div className="relative h-0">
          <span className="absolute -top-3 -right-3 size-6 rounded-full" style={{ background: notch }} />
          <span className="absolute -top-3 -left-3 size-6 rounded-full" style={{ background: notch }} />
          <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-line" />
        </div>

        {/* stub */}
        <div className="bg-card p-5 transition-colors duration-300 group-hover:bg-ink group-hover:text-paper">
          <dl className="grid grid-cols-3 gap-2">
            <div>
              <dt className="text-[11px] text-muted group-hover:text-paper/50">رأس المال</dt>
              <dd dir="ltr" className="mt-0.5 text-right font-mono text-sm font-semibold">{compactRange(idea.capitalMin, idea.capitalMax)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted group-hover:text-paper/50">الاسترداد</dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold">{monthsLabel(idea.paybackMonths)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted group-hover:text-paper/50">الهامش</dt>
              <dd dir="ltr" className="mt-0.5 text-right font-mono text-sm font-semibold text-signal">▲ {idea.marginPercent}%</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted group-hover:text-paper/50">سعر الملف</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-display text-sm font-bold text-paper">
              {money(idea.price)}
              <ArrowUpLeft className="size-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {compare && (
        <button
          type="button"
          onClick={compare.onToggle}
          disabled={compare.disabled && !compare.selected}
          aria-pressed={compare.selected}
          className={`absolute top-4 left-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            compare.selected ? "bg-accent text-paper ring-accent" : "bg-card text-ink ring-ink/20 hover:ring-ink"
          }`}
        >
          {compare.selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          قارن
        </button>
      )}
    </div>
  );
}
