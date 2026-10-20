import { Link } from "react-router";
import type { Idea } from "../types";
import { money, moneyRange, monthsLabel } from "../lib/format";
import DifficultyMeter from "./DifficultyMeter";

const rows: { label: string; render: (i: Idea) => React.ReactNode; best?: (list: Idea[]) => string | undefined }[] = [
  { label: "المجال", render: (i) => i.category },
  {
    label: "رأس المال",
    render: (i) => <span dir="ltr">{moneyRange(i.capitalMin, i.capitalMax)}</span>,
    best: (l) => [...l].sort((a, b) => a.capitalMin - b.capitalMin)[0]?.id,
  },
  {
    label: "مدة الاسترداد",
    render: (i) => monthsLabel(i.paybackMonths),
    best: (l) => [...l].sort((a, b) => a.paybackMonths - b.paybackMonths)[0]?.id,
  },
  {
    label: "هامش الربح",
    render: (i) => `${i.marginPercent}%`,
    best: (l) => [...l].sort((a, b) => b.marginPercent - a.marginPercent)[0]?.id,
  },
  { label: "الصعوبة", render: (i) => <DifficultyMeter value={i.difficulty} /> },
  { label: "سعر الملف", render: (i) => money(i.price) },
];

export default function CompareTable({ ideas }: { ideas: Idea[] }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-28" />
            {ideas.map((i) => (
              <th key={i.id} className="border-b-2 border-ink p-3 text-right align-bottom">
                <span className="file-label block">{i.code}</span>
                <Link to={`/ideas/${i.id}`} className="font-display text-base font-bold hover:text-accent">
                  {i.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const best = r.best?.(ideas);
            return (
              <tr key={r.label} className="border-b border-dashed border-line">
                <th className="p-3 text-right font-medium text-muted">{r.label}</th>
                {ideas.map((i) => (
                  <td key={i.id} className={`p-3 font-medium ${best === i.id && ideas.length > 1 ? "text-success" : ""}`}>
                    {r.render(i)}
                    {best === i.id && ideas.length > 1 && <span className="mr-1.5 text-xs">★</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">★ الأفضل بهالبند بين الأفكار المختارة.</p>
    </div>
  );
}
