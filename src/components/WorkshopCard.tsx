import { Link } from "react-router";
import { MapPin, Clock, Users } from "lucide-react";
import type { Workshop } from "../types";
import { formatDay, formatMonth, formatTime, hoursLabel, money } from "../lib/format";

export default function WorkshopCard({ workshop: w }: { workshop: Workshop }) {
  const left = w.seats - w.seatsTaken;
  const pct = Math.round((w.seatsTaken / w.seats) * 100);
  return (
    <Link
      to={`/workshops/${w.id}`}
      className="group flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(14,24,48,.45)] hover:ring-ink sm:gap-5 sm:p-5"
    >
      {/* calendar stub */}
      <div className="flex w-16 shrink-0 flex-col overflow-hidden rounded-xl bg-ink text-center text-paper sm:w-20">
        <span className="bg-accent py-1 text-xs font-bold text-paper">{formatMonth(w.date)}</span>
        <span className="grid flex-1 place-items-center py-2 font-mono text-2xl font-semibold text-flap-amber sm:text-3xl">{formatDay(w.date)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${w.mode === "أونلاين" ? "bg-ink text-paper" : "bg-accent-soft text-accent-deep"}`}>
            {w.mode}
          </span>
          <span className="font-display text-sm font-semibold text-accent">{money(w.price)}</span>
        </div>
        <h3 className="text-xl font-extrabold leading-snug group-hover:text-accent-deep">{w.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{w.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{formatTime(w.date)} · {hoursLabel(w.durationHours)}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{w.location}</span>
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" />باقي {left} مقعد</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep" aria-hidden>
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
