import { useSite } from "../components/SiteProvider";
import { Link, useParams } from "react-router";
import { ArrowRight, Check, FileText, MessageCircle } from "lucide-react";
import Container from "../components/Container";
import Skeleton from "../components/Skeleton";
import DifficultyMeter from "../components/DifficultyMeter";
import ProfitCalculator from "../components/ProfitCalculator";
import IdeaCard from "../components/IdeaCard";
import AddToCartButton from "../components/AddToCartButton";
import Reveal from "../components/Reveal";
import ButtonLink from "../components/ButtonLink";
import NotFound from "./NotFound";
import { useAsync } from "../lib/useAsync";
import { getIdea, getIdeas } from "../lib/api";
import { money, moneyRange, monthsLabel } from "../lib/format";

export default function IdeaDetail() {
  const { t } = useSite();
  const { id = "" } = useParams();
  const { data: idea, loading } = useAsync(() => getIdea(id), [id]);
  const { data: all } = useAsync(getIdeas);

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

  const metrics: { label: string; value?: string; ltr?: boolean; signal?: boolean; node?: React.ReactNode }[] = [
    { label: t("idea.mCapital"), value: moneyRange(idea.capitalMin, idea.capitalMax), ltr: true },
    { label: t("idea.mPayback"), value: monthsLabel(idea.paybackMonths) },
    { label: t("idea.mMargin"), value: `▲ ${idea.marginPercent}%`, signal: true },
    { label: t("idea.mDifficulty"), node: <DifficultyMeter value={idea.difficulty} /> },
  ];

  return (
    <>
      <section className="grid-lines relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute -top-40 -left-40 size-[28rem] rounded-full bg-accent/25 blur-[120px]" />
        <Container className="relative pt-28 pb-12 sm:pt-36 sm:pb-16">
          <Link to="/ideas" className="mb-8 inline-flex items-center gap-1.5 text-sm text-paper/50 hover:text-paper">
            <ArrowRight className="size-4" /> {t("idea.back")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-flap px-2 py-1 font-mono text-xs font-semibold text-flap-amber">{idea.code}</span>
            <span className="rounded-full bg-paper/10 px-3 py-1 text-sm font-medium ring-1 ring-paper/15">{idea.category}</span>
          </div>
          <h1 className="mt-5 text-5xl leading-[1.08] font-black sm:text-7xl">{idea.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/70">{idea.summary}</p>

          <dl className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl bg-ink-2 p-4 ring-1 ring-paper/10 sm:p-5">
                <dt className="text-xs text-paper/50">{m.label}</dt>
                <dd dir={m.ltr ? "ltr" : undefined} className={`mt-2 font-display text-lg font-extrabold sm:text-2xl ${m.ltr ? "text-right" : ""} ${m.signal ? "text-signal" : ""}`}>
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
            <h2 className="mb-3 text-2xl font-bold">{t("idea.aboutTitle")}</h2>
            <p className="text-lg leading-loose text-ink-soft">{idea.description}</p>
          </Reveal>

          <Reveal>
            <h2 className="mb-4 text-2xl font-bold">{t("idea.includesTitle")}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {idea.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-ink/10">
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
          <div className="rounded-3xl bg-card p-6 ring-1 ring-ink/10 shadow-[0_30px_60px_-30px_rgb(var(--shadow-rgb)/.5)]">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="size-4" /> {t("idea.buyLabel")}
            </div>
            <p className="mt-2 font-display text-4xl font-bold">{money(idea.price)}</p>
            <p className="mt-1 text-sm text-muted">{t("idea.buyNote")}</p>
            <AddToCartButton idea={idea} className="mt-6 w-full py-4" />
            <ButtonLink to="/custom" variant="ghost" className="mt-3 w-full">
              {t("idea.customButton")}
            </ButtonLink>
            <Link to="/contact" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
              <MessageCircle className="size-4" /> {t("idea.question")}
            </Link>
          </div>
        </aside>
      </Container>

      {others.length > 0 && (
        <Container className="pb-4">
          <h2 className="mb-8 text-4xl font-black">{t("idea.relatedTitle")}</h2>
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
          <AddToCartButton idea={idea} className="px-5 py-3 text-sm" />
        </div>
      </div>
      <div className="h-20 lg:hidden" />

    </>
  );
}
