import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, Check, FileText, MessageCircle, ShoppingBag } from "lucide-react";
import Container from "../components/Container";
import Skeleton from "../components/Skeleton";
import DifficultyMeter from "../components/DifficultyMeter";
import ProfitCalculator from "../components/ProfitCalculator";
import IdeaCard from "../components/IdeaCard";
import Modal from "../components/Modal";
import OrderForm from "../components/OrderForm";
import Reveal from "../components/Reveal";
import ButtonLink from "../components/ButtonLink";
import NotFound from "./NotFound";
import { useAsync } from "../lib/useAsync";
import { getIdea, getIdeas } from "../lib/api";
import { money, moneyRange, monthsLabel } from "../lib/format";

export default function IdeaDetail() {
  const { id = "" } = useParams();
  const { data: idea, loading } = useAsync(() => getIdea(id), [id]);
  const { data: all } = useAsync(getIdeas);
  const [orderOpen, setOrderOpen] = useState(false);

  if (loading) {
    return (
      <Container className="space-y-6 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </Container>
    );
  }
  if (!idea) return <NotFound />;

  const related = (all ?? []).filter((i) => i.id !== idea.id && i.category === idea.category).slice(0, 3);
  const others = related.length ? related : (all ?? []).filter((i) => i.id !== idea.id).slice(0, 3);

  const metrics = [
    { label: "رأس المال", value: moneyRange(idea.capitalMin, idea.capitalMax), ltr: true },
    { label: "الاسترداد", value: monthsLabel(idea.paybackMonths) },
    { label: "هامش الربح", value: `${idea.marginPercent}%` },
    { label: "الصعوبة", node: <DifficultyMeter value={idea.difficulty} /> },
  ];

  return (
    <>
      <section className="relative border-b-2 border-ink">
        <div className="ruled pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative py-10 sm:py-14">
          <Link to="/ideas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowRight className="size-4" /> كل الأفكار
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border-2 border-ink bg-card px-2 py-0.5 font-mono text-xs">{idea.code}</span>
            <span className="rounded-full bg-accent-soft px-3 py-0.5 text-sm font-medium text-accent-deep">{idea.category}</span>
          </div>
          <h1 className="mt-4 text-4xl leading-tight font-bold sm:text-5xl">{idea.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{idea.summary}</p>

          <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-ink bg-card md:grid-cols-4">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={`p-4 sm:p-5 ${i % 2 === 0 ? "border-l-2 border-ink" : ""} ${i < 2 ? "border-b-2 border-ink md:border-b-0" : ""} ${i === 1 ? "md:border-l-2" : ""}`}
              >
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd dir={m.ltr ? "ltr" : undefined} className={`mt-1 font-display text-lg font-bold sm:text-xl ${m.ltr ? "text-right" : ""}`}>
                  {m.node ?? m.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <Reveal>
            <h2 className="mb-3 text-2xl font-bold">عن الفكرة</h2>
            <p className="text-lg leading-loose text-ink-soft">{idea.description}</p>
          </Reveal>

          <Reveal>
            <h2 className="mb-4 text-2xl font-bold">شو بيشمل الملف؟</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {idea.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border-2 border-line bg-card p-4">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-ink text-paper">
                    <Check className="size-4" />
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <ProfitCalculator idea={idea} />
          </Reveal>
        </div>

        {/* Purchase card */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_var(--color-accent)]">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="size-4" /> الملف الكامل
            </div>
            <p className="mt-2 font-display text-4xl font-bold">{money(idea.price)}</p>
            <p className="mt-1 text-sm text-muted">دفعة وحدة · ملف PDF + جلسة أسئلة قصيرة</p>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 font-display font-semibold text-paper shadow-[3px_3px_0_var(--color-ink)] transition-all hover:bg-accent-deep active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <ShoppingBag className="size-4" /> اطلب الملف
            </button>
            <ButtonLink to="/custom" variant="ghost" className="mt-3 w-full">
              بدي نسخة مخصصة إلي
            </ButtonLink>
            <Link to="/contact" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
              <MessageCircle className="size-4" /> عندك سؤال قبل الشراء؟
            </Link>
          </div>
        </aside>
      </Container>

      {others.length > 0 && (
        <Container className="pb-4">
          <h2 className="mb-6 border-b-2 border-ink pb-3 text-2xl font-bold">ملفات قريبة</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((i) => (
              <IdeaCard key={i.id} idea={i} />
            ))}
          </div>
        </Container>
      )}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-paper/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-1">
          <div className="flex-1">
            <p className="text-xs text-muted">{idea.title}</p>
            <p className="font-display text-xl font-bold">{money(idea.price)}</p>
          </div>
          <button type="button" onClick={() => setOrderOpen(true)} className="rounded-lg bg-accent px-6 py-3 font-display font-semibold text-paper">
            اطلب الملف
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      <Modal open={orderOpen} onClose={() => setOrderOpen(false)} title="طلب ملف فرصة">
        <OrderForm idea={idea} onDone={() => setOrderOpen(false)} />
      </Modal>
    </>
  );
}
