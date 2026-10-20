import type { Idea } from "../types";
import { compactRange, monthsLabel } from "../lib/format";

/** Stock-exchange style strip that scrolls idea metrics endlessly. */
export default function Ticker({ ideas, className = "" }: { ideas: Idea[]; className?: string }) {
  if (!ideas.length) return null;
  const items = ideas.map((i) => (
    <span key={i.id} className="inline-flex shrink-0 items-center gap-3 px-6">
      <span className="font-mono text-xs opacity-60">{i.code}</span>
      <span className="font-display font-bold">{i.title}</span>
      <span dir="ltr" className="font-mono text-sm">{compactRange(i.capitalMin, i.capitalMax)}</span>
      <span className="inline-flex items-center gap-1 font-mono text-sm">
        <span aria-hidden>▲</span>
        {i.marginPercent}%
      </span>
      <span className="text-sm opacity-70">استرداد {monthsLabel(i.paybackMonths)}</span>
      <span aria-hidden className="mr-3 size-1.5 rounded-full bg-current opacity-40" />
    </span>
  ));
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label="مؤشرات الفرص">
      <div className="flex w-max animate-marquee py-3 hover:[animation-play-state:paused]">
        <div className="flex">{items}</div>
        <div className="flex" aria-hidden>{items}</div>
      </div>
    </div>
  );
}
