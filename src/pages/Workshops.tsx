import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import WorkshopCard from "../components/WorkshopCard";
import Skeleton from "../components/Skeleton";
import ButtonLink from "../components/ButtonLink";
import { useAsync } from "../lib/useAsync";
import { getWorkshops } from "../lib/api";
import type { WorkshopMode } from "../types";

const modes: (WorkshopMode | "الكل")[] = ["الكل", "حضوري", "أونلاين"];

export default function Workshops() {
  const { data, loading } = useAsync(getWorkshops);
  const [mode, setMode] = useState<(typeof modes)[number]>("الكل");
  const now = new Date().toISOString();

  const { upcoming, past } = useMemo(() => {
    const list = (data ?? []).filter((w) => mode === "الكل" || w.mode === mode);
    return { upcoming: list.filter((w) => w.date >= now), past: list.filter((w) => w.date < now).reverse() };
  }, [data, mode, now]);

  return (
    <>
      <PageHeader eyebrow="الورشات التدريبية" title={<>تعلّم <span className="text-accent">قبل</span> ما تبدأ.</>}>
        ورشات قصيرة وعملية — حضوري وأونلاين — بتطلع منها بأدوات بتستخدمها بمشروعك من تاني يوم.
      </PageHeader>

      <Container className="py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full bg-card p-1 ring-1 ring-ink/10" role="tablist">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className="relative rounded-full px-5 py-2 text-sm font-semibold"
              >
                {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-ink" />}
                <span className={`relative ${mode === m ? "text-paper" : "text-ink-soft"}`}>{m}</span>
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">
            <span className="font-mono">{upcoming.length}</span> ورشة قادمة
          </span>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-xl font-bold">ما في ورشات قادمة حالياً</p>
            <p className="mt-2 text-ink-soft">تابعنا على إنستغرام لتعرف أول بأول عن الورشات الجاية.</p>
          </div>
        ) : (
          <motion.div layout className="grid gap-5 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {upcoming.map((w) => (
                <motion.div key={w.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <WorkshopCard workshop={w} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {past.length > 0 && (
          <div className="mt-16 opacity-70">
            <h2 className="mb-5 text-2xl font-black">ورشات سابقة</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {past.map((w) => <WorkshopCard key={w.id} workshop={w} />)}
            </div>
          </div>
        )}

        <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl font-black">بدك ورشة خاصة لفريقك أو جمعيتك؟</p>
            <p className="mt-2 text-paper/60">منصمم ورشة على احتياجكم، حضوري أو أونلاين.</p>
          </div>
          <ButtonLink to="/contact" className="shrink-0">تواصل معنا</ButtonLink>
        </div>
      </Container>
    </>
  );
}
