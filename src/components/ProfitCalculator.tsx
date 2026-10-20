import { useId, useState } from "react";
import { Calculator } from "lucide-react";
import type { Idea } from "../types";
import { money, monthsLabel } from "../lib/format";

/**
 * Rough estimate: monthly profit = monthly sales × margin;
 * payback = capital ÷ monthly profit.
 */
export default function ProfitCalculator({ idea }: { idea: Idea }) {
  const mid = Math.round((idea.capitalMin + idea.capitalMax) / 2 / 100) * 100;
  // default sales that reproduce the idea's own payback estimate at mid capital
  const defaultSales = Math.round(mid / idea.paybackMonths / (idea.marginPercent / 100) / 100) * 100;

  const [capital, setCapital] = useState(mid);
  const [sales, setSales] = useState(defaultSales);
  const capId = useId();
  const salesId = useId();

  const profit = Math.round(sales * (idea.marginPercent / 100));
  const payback = profit > 0 ? capital / profit : Infinity;
  const yearProfit = profit * 12 - capital;

  return (
    <div className="rounded-2xl border-2 border-ink bg-card">
      <div className="flex items-center gap-2 border-b-2 border-ink px-5 py-3">
        <Calculator className="size-5 text-accent" />
        <h2 className="font-display font-bold">احسبها على وضعك</h2>
        <span className="mr-auto text-xs text-muted">تقدير تقريبي</span>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-6">
          <Slider
            id={capId}
            label="رأس المال اللي معك"
            value={capital}
            min={idea.capitalMin}
            max={Math.round(idea.capitalMax * 1.5)}
            step={100}
            onChange={setCapital}
          />
          <Slider
            id={salesId}
            label="المبيعات الشهرية المتوقعة"
            value={sales}
            min={Math.round(defaultSales * 0.3 / 100) * 100 || 100}
            max={defaultSales * 3}
            step={100}
            onChange={setSales}
          />
          <p className="text-xs leading-relaxed text-muted">
            الحساب على أساس هامش ربح {idea.marginPercent}% بعد المصاريف التشغيلية. الأرقام الدقيقة موجودة بالملف الكامل.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 self-start">
          <Stat label="ربح شهري تقريبي" value={money(profit)} />
          <Stat label="استرداد رأس المال" value={Number.isFinite(payback) ? monthsLabel(Math.ceil(payback)) : "—"} accent />
          <Stat
            label="صافي أول سنة"
            value={`${yearProfit < 0 ? "−" : ""}${money(Math.abs(yearProfit))}`}
            tone={yearProfit < 0 ? "text-accent-deep" : "text-success"}
            wide
          />
        </dl>
      </div>
    </div>
  );
}

function Slider(props: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = ((props.value - props.min) / (props.max - props.min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={props.id} className="text-sm font-medium">{props.label}</label>
        <span className="font-mono text-sm font-medium">{money(props.value)}</span>
      </div>
      <input
        id={props.id}
        type="range"
        dir="rtl"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[var(--color-accent)]"
        style={{ background: `linear-gradient(to left, var(--color-ink) ${pct}%, var(--color-paper-deep) ${pct}%)` }}
      />
    </div>
  );
}

function Stat({ label, value, accent, tone = "", wide }: { label: string; value: string; accent?: boolean; tone?: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? "bg-ink text-paper" : "bg-paper"} ${wide ? "col-span-2" : ""}`}>
      <dt className={`text-xs ${accent ? "text-paper/60" : "text-muted"}`}>{label}</dt>
      <dd className={`mt-1 font-display text-2xl font-bold ${tone}`}>{value}</dd>
    </div>
  );
}
