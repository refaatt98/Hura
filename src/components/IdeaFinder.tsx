import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import type { Idea } from "../types";
import IdeaCard from "./IdeaCard";
import ButtonLink from "./ButtonLink";

interface Option {
  label: string;
  hint: string;
  test: (i: Idea) => number;
}

const questions: { q: string; options: Option[] }[] = [
  {
    q: "كم الميزانية اللي بتقدر تبدأ فيها؟",
    options: [
      { label: "أقل من 3,000$", hint: "بداية خفيفة", test: (i) => (i.capitalMin <= 3000 ? 3 : 0) },
      { label: "3,000$ – 10,000$", hint: "مشروع صغير متكامل", test: (i) => (i.capitalMin <= 10000 && i.capitalMax >= 3000 ? 3 : 0) },
      { label: "أكثر من 10,000$", hint: "مشروع أكبر", test: (i) => (i.capitalMax > 10000 ? 3 : 1) },
    ],
  },
  {
    q: "أي مجال بيشدّك أكثر؟",
    options: [
      { label: "أكل ومشروبات", hint: "قهوة، مخبوزات، مطابخ", test: (i) => (i.category === "أغذية ومشروبات" ? 3 : 0) },
      { label: "تجارة وأونلاين", hint: "متاجر وبيع إلكتروني", test: (i) => (i.category === "تجارة إلكترونية" ? 3 : 0) },
      { label: "خدمات وتعليم", hint: "خدمة الناس مباشرة", test: (i) => (i.category === "خدمات" || i.category === "تعليم وخدمات" ? 3 : 0) },
    ],
  },
  {
    q: "قديش خبرتك بإدارة المشاريع؟",
    options: [
      { label: "أول مرة", hint: "بدي إشي واضح وبسيط", test: (i) => (i.difficulty === "سهل" ? 2 : 0) },
      { label: "عندي تجربة", hint: "جاهز لتحدي متوسط", test: (i) => (i.difficulty !== "متقدم" ? 2 : 1) },
      { label: "خبرة جيدة", hint: "ما بخاف من الكبير", test: () => 1 },
    ],
  },
];

export default function IdeaFinder({ ideas }: { ideas: Idea[] }) {
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
    <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-5 py-3 text-paper">
        <span className="inline-flex items-center gap-2 font-display text-sm font-semibold">
          <Sparkles className="size-4 text-accent" /> لاقي فكرتك
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
              <p className="file-label mb-2">سؤال {step + 1} / {questions.length}</p>
              <h3 className="mb-6 text-2xl font-bold">{questions[step].q}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {questions[step].options.map((o, oi) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setAnswers((a) => [...a, oi])}
                    className="group rounded-xl border-2 border-line bg-paper p-4 text-right transition-all hover:border-ink hover:shadow-[4px_4px_0_var(--color-accent)]"
                  >
                    <span className="block font-display font-semibold">{o.label}</span>
                    <span className="mt-1 block text-sm text-muted">{o.hint}</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setAnswers((a) => a.slice(0, -1))} className="mt-5 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  رجوع للسؤال السابق
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-bold">هدول أقرب ملفّين إلك</h3>
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                >
                  <RotateCcw className="size-4" /> أعد الاختبار
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {results.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
              <div className="mt-8 flex flex-col items-start gap-3 rounded-xl bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink">ما لقيت اللي ببالك؟ منبنيلك فكرة من الصفر على مقاسك.</p>
                <ButtonLink to="/custom" variant="ink" className="shrink-0">
                  اطلب مشروع مخصص <ArrowLeft className="size-4" />
                </ButtonLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
