import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Columns3, Search, SlidersHorizontal, X } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import IdeaCard from "../components/IdeaCard";
import Skeleton from "../components/Skeleton";
import Modal from "../components/Modal";
import CompareTable from "../components/CompareTable";
import ButtonLink from "../components/ButtonLink";
import { useAsync } from "../lib/useAsync";
import { getIdeas } from "../lib/api";
import type { Difficulty } from "../types";

const budgets = [
  { id: "all", label: "كل الميزانيات", test: () => true },
  { id: "s", label: "أقل من 3k$", test: (min: number) => min < 3000 },
  { id: "m", label: "3k–10k$", test: (min: number) => min >= 3000 && min <= 10000 },
  { id: "l", label: "أكثر من 10k$", test: (min: number) => min > 10000 },
] as const;

const sorts = {
  featured: "المميزة أولاً",
  capital: "الأقل رأس مال",
  payback: "الأسرع استرداداً",
  margin: "الأعلى هامشاً",
} as const;

const difficulties: Difficulty[] = ["سهل", "متوسط", "متقدم"];
const MAX_COMPARE = 3;

const chip = (active: boolean) =>
  `shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-soft hover:border-ink hover:text-ink"
  }`;

export default function Ideas() {
  const { data: ideas, loading } = useAsync(getIdeas);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [budget, setBudget] = useState<(typeof budgets)[number]["id"]>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sort, setSort] = useState<keyof typeof sorts>("featured");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(() => [...new Set((ideas ?? []).map((i) => i.category))], [ideas]);

  const list = useMemo(() => {
    const term = q.trim();
    const b = budgets.find((x) => x.id === budget)!;
    return (ideas ?? [])
      .filter((i) => category === "all" || i.category === category)
      .filter((i) => b.test(i.capitalMin))
      .filter((i) => difficulty === "all" || i.difficulty === difficulty)
      .filter((i) => !term || `${i.title} ${i.summary} ${i.category}`.includes(term))
      .sort((a, b) => {
        if (sort === "capital") return a.capitalMin - b.capitalMin;
        if (sort === "payback") return a.paybackMonths - b.paybackMonths;
        if (sort === "margin") return b.marginPercent - a.marginPercent;
        return Number(b.featured) - Number(a.featured);
      });
  }, [ideas, q, category, budget, difficulty, sort]);

  const activeFilters = Number(category !== "all") + Number(budget !== "all") + Number(difficulty !== "all");
  const reset = () => {
    setQ("");
    setCategory("all");
    setBudget("all");
    setDifficulty("all");
  };

  const toggleCompare = (id: string) =>
    setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids));
  const compared = (ideas ?? []).filter((i) => compareIds.includes(i.id));

  return (
    <>
      <PageHeader eyebrow="أرشيف ملفات الفرص" title="أفكار مشاريع جاهزة للتنفيذ">
        كل فكرة ملف كامل: رأس المال، مدة الاسترداد، الموردين، وخطة الإطلاق. قارن بين لحد 3 أفكار قبل ما تقرر.
      </PageHeader>

      <Container className="py-10">
        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">ابحث</span>
            <Search className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فكرة: قهوة، متجر، أطفال…"
              className="w-full rounded-xl border-2 border-ink bg-card py-3 pr-11 pl-4 focus:shadow-[3px_3px_0_var(--color-accent)] focus:outline-none"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-card px-4 py-3 text-sm font-semibold lg:hidden"
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="size-4" /> فلاتر
              {activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-xs text-paper">{activeFilters}</span>}
            </button>
            <label className="flex-1 sm:flex-none">
              <span className="sr-only">ترتيب</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
                className="h-full w-full rounded-xl border-2 border-ink bg-card px-4 py-3 text-sm font-semibold focus:outline-none"
              >
                {Object.entries(sorts).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className={`${filtersOpen ? "block" : "hidden"} mt-5 space-y-4 rounded-xl border-2 border-dashed border-line p-4 lg:block lg:border-0 lg:p-0`}>
          <FilterRow label="المجال">
            <button type="button" className={chip(category === "all")} onClick={() => setCategory("all")}>الكل</button>
            {categories.map((c) => (
              <button type="button" key={c} className={chip(category === c)} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </FilterRow>
          <FilterRow label="الميزانية">
            {budgets.map((b) => (
              <button type="button" key={b.id} className={chip(budget === b.id)} onClick={() => setBudget(b.id)}>{b.label}</button>
            ))}
          </FilterRow>
          <FilterRow label="الصعوبة">
            <button type="button" className={chip(difficulty === "all")} onClick={() => setDifficulty("all")}>الكل</button>
            {difficulties.map((d) => (
              <button type="button" key={d} className={chip(difficulty === d)} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </FilterRow>
        </div>

        <div className="mt-8 mb-6 flex items-center justify-between border-b-2 border-ink pb-3 text-sm">
          <span className="font-medium">
            {loading ? "…" : <><span className="font-mono">{list.length}</span> ملف</>}
          </span>
          {(activeFilters > 0 || q) && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-muted hover:text-accent">
              <X className="size-4" /> مسح الفلاتر
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold">ما لقينا ملف بهالمواصفات</p>
            <p className="mt-2 text-ink-soft">جرّب تغيّر الفلاتر، أو اطلب فكرة مخصصة على مقاسك.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className="rounded-lg border-2 border-ink px-5 py-3 text-sm font-semibold hover:bg-ink hover:text-paper">مسح الفلاتر</button>
              <ButtonLink to="/custom">اطلب مشروع مخصص</ButtonLink>
            </div>
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((idea) => (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <IdeaCard
                    idea={idea}
                    compare={{
                      selected: compareIds.includes(idea.id),
                      disabled: compareIds.length >= MAX_COMPARE,
                      onToggle: () => toggleCompare(idea.id),
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Container>

      {/* Compare bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed inset-x-0 bottom-0 z-30 p-3 sm:p-5"
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border-2 border-ink bg-ink p-3 text-paper shadow-[0_-8px_30px_rgba(20,33,61,.25)]">
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {compared.map((i) => (
                  <button
                    type="button"
                    key={i.id}
                    onClick={() => toggleCompare(i.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-paper/10 px-2.5 py-1.5 text-xs hover:bg-paper/20"
                    aria-label={`إزالة ${i.title} من المقارنة`}
                  >
                    {i.title} <X className="size-3.5" />
                  </button>
                ))}
                <span className="hidden shrink-0 self-center text-xs text-paper/50 sm:inline">{compareIds.length}/{MAX_COMPARE}</span>
              </div>
              <button
                type="button"
                onClick={() => setCompareOpen(true)}
                disabled={compareIds.length < 2}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent-deep disabled:bg-paper/20 disabled:text-paper/50"
              >
                <Columns3 className="size-4" />
                {compareIds.length < 2 ? "اختر فكرة كمان" : "قارن الآن"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="مقارنة ملفات الفرص" wide>
        <CompareTable ideas={compared} />
      </Modal>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
      <span className="w-20 shrink-0 text-sm font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
