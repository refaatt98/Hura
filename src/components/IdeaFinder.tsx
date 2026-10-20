import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import type { Idea } from "../types";
import IdeaCard from "./IdeaCard";
import ButtonLink from "./ButtonLink";
import { useSite } from "./SiteProvider";

/** Scoring only — the visible texts are editable (quiz.* in src/data/texts.ts). */
interface Option {
  test: (i: Idea) => number;
}

const questions: { options: Option[] }[] = [
  {
    options: [
      { test: (i) => (i.capitalMin <= 10000 ? 3 : 0) },
      { test: (i) => (i.capitalMin <= 35000 && i.capitalMax >= 10000 ? 3 : 0) },
      { test: (i) => (i.capitalMax > 35000 ? 3 : 1) },
    ],
  },
  {
    options: [
      { test: (i) => (i.category === "أغذية ومشروبات" ? 3 : 0) },
      { test: (i) => (i.category === "تجارة إلكترونية" ? 3 : 0) },
      { test: (i) => (i.category === "خدمات" || i.category === "تعليم وخدمات" ? 3 : 0) },
    ],
  },
  {
    options: [
      { test: (i) => (i.difficulty === "سهل" ? 2 : 0) },
      { test: (i) => (i.difficulty !== "متقدم" ? 2 : 1) },
      { test: () => 1 },
    ],
  },
];

export default function IdeaFinder({ ideas }: { ideas: Idea[] }) {
  const { t } = useSite();
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step === questions.length;

  const results = useMemo(() => {
    if (!done) return [];
    return [...ideas]
      .map((idea) => ({ idea, score: answers.reduce((s, a, qi) => s + questions[qi].options[a].test(idea), 0) }))
      .sort((a, b) => b.score - a.score || a.idea.capitalMin - b.idea.capitalMin)
      .slice(0, 2)
      .map((r) => r.idea);
  }, [answers, done, ideas]);

  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 shadow-[0_30px_60px_-35px_rgba(14,24,48,.5)]">
      <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper">
        <span className="inline-flex items-center gap-2 font-display text-sm font-semibold">
          <Sparkles className="size-4 text-accent" /> {t("quiz.badge")}
        </span>
        <div className="flex gap-1.5" aria-label={`الخطوة ${Math.min(step + 1, 3)} من 3`}>
          {questions.map((_, i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-paper/25"}`} />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
            >
              <p className="file-label mb-2">{t("quiz.qLabel")} {step + 1} / {questions.length}</p>
              <h3 className="mb-6 text-2xl font-extrabold sm:text-3xl">{t(`quiz.q${step + 1}`)}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {questions[step].options.map((_, oi) => (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => [...a, oi])}
                    className="group rounded-2xl bg-paper p-4 text-right ring-1 ring-ink/10 transition-all hover:bg-ink hover:text-paper hover:ring-ink"
                  >
                    <span className="block font-display font-semibold">{t(`quiz.q${step + 1}.o${oi + 1}`)}</span>
                    <span className="mt-1 block text-sm text-muted group-hover:text-paper/60">{t(`quiz.q${step + 1}.h${oi + 1}`)}</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setAnswers((a) => a.slice(0, -1))} className="mt-5 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  {t("quiz.back")}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-bold">{t("quiz.resultsTitle")}</h3>
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                >
                  <RotateCcw className="size-4" /> {t("quiz.retry")}
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {results.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} notch="var(--color-card)" />
                ))}
              </div>
              <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink">{t("quiz.noMatch")}</p>
                <ButtonLink to="/custom" variant="ink" className="shrink-0">
                  {t("quiz.customButton")} <ArrowLeft className="size-4" />
                </ButtonLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
