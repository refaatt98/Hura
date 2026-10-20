import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Idea } from "../types";
import { Flap, FlapDigits } from "./Flap";

const ROWS = 4;
const k = (n: number) => String(Math.round(n / 1000)).padStart(3, " ");

/** Departures-style board that keeps rotating through the ideas. */
export default function FlapBoard({ ideas }: { ideas: Idea[] }) {
  const [slots, setSlots] = useState<number[]>(() => ideas.slice(0, ROWS).map((_, i) => i));
  const [next, setNext] = useState(ROWS % Math.max(ideas.length, 1));
  const [row, setRow] = useState(0);

  useEffect(() => {
    if (ideas.length <= ROWS) return;
    const t = setInterval(() => {
      setSlots((s) => s.map((v, i) => (i === row ? next : v)));
      setNext((n) => (n + 1) % ideas.length);
      setRow((r) => (r + 1) % ROWS);
    }, 2600);
    return () => clearInterval(t);
  }, [ideas.length, next, row]);

  return (
    <div className="rounded-2xl border border-paper/10 bg-ink-2 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] sm:p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-display text-sm font-bold text-paper">لوحة الفرص</span>
        <span className="inline-flex items-center gap-2 text-xs text-flap-amber">
          <span className="size-2 animate-pulse rounded-full bg-flap-amber" />
          مباشر
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2 gap-y-2 text-[13px] sm:grid-cols-[auto_1fr_auto_auto_auto] sm:text-sm">
        <span className="px-1 text-[11px] text-paper/45">الرمز</span>
        <span className="px-1 text-[11px] text-paper/45">الفرصة</span>
        <span className="px-1 text-[11px] text-paper/45">رأس المال k₪</span>
        <span className="px-1 text-[11px] text-paper/45">استرداد</span>
        <span className="hidden px-1 text-[11px] text-paper/45 sm:block">هامش</span>

        {slots.map((idx) => {
          const idea = ideas[idx];
          if (!idea) return null;
          return (
            <Link key={idea.id + idx} to={`/ideas/${idea.id}`} className="contents" aria-label={idea.title}>
              <Flap value={idea.code.replace("F-", "")} className="font-mono text-flap-amber" />
              <Flap value={idea.title} className="min-w-0 font-display font-bold" />
              <FlapDigits value={k(idea.capitalMin)} />
              <FlapDigits value={String(idea.paybackMonths).padStart(2, "0")} />
              <span className="hidden sm:inline-flex">
                <Flap value={`${idea.marginPercent}%`} className="font-mono text-signal" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
