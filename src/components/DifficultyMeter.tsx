import type { Difficulty } from "../types";

const level: Record<Difficulty, number> = { "سهل": 1, "متوسط": 2, "متقدم": 3 };

export default function DifficultyMeter({ value }: { value: Difficulty }) {
  const n = level[value];
  return (
    <span className="inline-flex items-center gap-2" aria-label={`الصعوبة: ${value}`}>
      <span className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-3 w-1.5 rounded-sm ${i <= n ? "bg-ink" : "bg-line"}`} />
        ))}
      </span>
      <span>{value}</span>
    </span>
  );
}
