import { ArrowUpLeft } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Instagram from "../components/InstagramIcon";
import Container from "../components/Container";
import ButtonLink from "../components/ButtonLink";
import SectionHeading from "../components/SectionHeading";
import Reveal from "../components/Reveal";
import FlapBoard from "../components/FlapBoard";
import Ticker from "../components/Ticker";
import RotatingWord from "../components/RotatingWord";
import InstagramCard from "../components/InstagramCard";
import IdeaCard from "../components/IdeaCard";
import IdeaFinder from "../components/IdeaFinder";
import WorkshopCard from "../components/WorkshopCard";
import Skeleton from "../components/Skeleton";
import { useAsync } from "../lib/useAsync";
import { getIdeas, getInstagramPosts, getUpcomingWorkshops } from "../lib/api";
import { Hl, useSite } from "../components/SiteProvider";

const services = [
  { n: "01", key: "home.service1", to: "/ideas" },
  { n: "02", key: "home.service2", to: "/custom" },
  { n: "03", key: "home.service3", to: "/workshops" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const { site, t, tl } = useSite();
  const marquee = tl("home.marquee");
  const postsQ = useAsync(() => getInstagramPosts(3));
  const ideasQ = useAsync(getIdeas);
  const workshopsQ = useAsync(() => getUpcomingWorkshops(2));
  const ideas = ideasQ.data ?? [];
  const featured = ideas.filter((i) => i.featured);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-paper text-ink">
        <div className="grid-lines-ink pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
        <div className="pointer-events-none absolute -top-32 -left-32 size-[34rem] rounded-full bg-accent/20 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 size-80 rounded-full bg-flap-amber/20 blur-[120px]" />

        <Container className="relative grid items-center gap-14 pt-32 pb-28 sm:pt-36 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:pb-32">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-medium ring-1 ring-ink/10"
            >
              <span className="size-2 animate-pulse rounded-full bg-signal" />
              {site.heroBadge}
            </motion.p>

            <h1 className="text-[2.75rem] leading-[1.08] font-black sm:text-7xl lg:text-[3.7rem] xl:text-[4rem]">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7, ease }}
              >
                {site.heroTitle}
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease }}
              >
                {site.heroPrefix} <br />{site.heroWords.length > 0 && <RotatingWord key={site.heroWords.join("|")} words={site.heroWords} className="text-accent" />}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
            >
              {site?.about ?? " "}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <ButtonLink to="/ideas" className="py-4">
                {t("hero.cta1")} <ArrowUpLeft className="size-4" />
              </ButtonLink>
              <ButtonLink to="/custom" variant="ghost" className="py-4">
                {t("hero.cta2")}
              </ButtonLink>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease }}
          >
            {ideas.length ? <FlapBoard ideas={ideas} /> : <Skeleton className="h-72" />}
            <p className="mt-3 px-1 text-xs text-muted">{t("hero.boardNote")}</p>
          </motion.div>
        </Container>
      </section>

      {/* ───────── Crossing tapes ───────── */}
      <div className="relative -mt-14 h-36 overflow-hidden sm:-mt-16" aria-hidden={false}>
        <div className="absolute inset-x-[-5%] top-10 rotate-[2deg] bg-ink text-paper/80">
          <Ticker ideas={[...ideas].reverse()} className="[--marquee-duration:55s]" />
        </div>
        <div className="absolute inset-x-[-5%] top-12 -rotate-[2.5deg] bg-accent text-paper shadow-[0_10px_30px_-10px_rgb(var(--accent-rgb)/.6)]">
          <Ticker ideas={ideas} />
        </div>
      </div>

      {/* ───────── Instagram ───────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            index="01"
            eyebrow={t("home.ig.eyebrow")}
            title={
              <>
                <Hl text={t("home.ig.title")} hl={t("home.ig.titleHl")} className="text-outline text-ink" />
              </>
            }
            action={
              <ButtonLink to={site.instagramUrl} external variant="ghost">
                <Instagram className="size-4" /> <span dir="ltr">@{site.instagramHandle}</span>
              </ButtonLink>
            }
          />
        </Container>
        <div className="mx-auto max-w-6xl">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:px-6 md:grid md:grid-cols-3 md:overflow-visible lg:px-8">
            {postsQ.loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/5] w-[78%] shrink-0 md:w-auto" />)
              : postsQ.data?.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.1} className={`w-[78%] shrink-0 snap-center md:w-auto ${i === 1 ? "md:translate-y-12" : ""}`}>
                    <InstagramCard post={p} index={i} />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ───────── Services (editorial list) ───────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading index="02" eyebrow={t("home.services.eyebrow")} title={t("home.services.title")} />
          <div className="border-t-2 border-ink">
            {services.map((s) => (
              <Link
                key={s.n}
                to={s.to}
                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden border-b-2 border-ink py-7 sm:gap-8 sm:py-10"
              >
                <span className="absolute inset-0 origin-right scale-x-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" />
                <span className="relative font-mono text-sm text-accent-deep transition-colors group-hover:text-accent sm:text-base">{s.n}</span>
                <span className="relative min-w-0 transition-colors duration-300 group-hover:text-paper">
                  <span className="block font-display text-3xl font-black sm:text-6xl">{t(`${s.key}.title`)}</span>
                  <span className="mt-2 block max-w-xl text-sm text-ink-soft transition-colors group-hover:text-paper/70 sm:text-base">{t(`${s.key}.text`)}</span>
                </span>
                <span className="relative grid size-12 place-items-center rounded-full ring-2 ring-ink transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:ring-accent sm:size-16">
                  <ArrowUpLeft className="size-5 transition-colors group-hover:text-paper sm:size-6" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Featured tickets ───────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            index="03"
            eyebrow={t("home.featured.eyebrow")}
            title={
              <>
                <Hl text={t("home.featured.title")} hl={t("home.featured.titleHl")} />
              </>
            }
            action={
              <ButtonLink to="/ideas" variant="ghost">
                {t("home.featured.button")} <ArrowUpLeft className="size-4" />
              </ButtonLink>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ideasQ.loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-96" />)
              : featured.map((idea, i) => (
                  <Reveal key={idea.id} delay={i * 0.1}>
                    <IdeaCard idea={idea} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>

      {/* ───────── Idea finder ───────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <p className="mb-3 font-mono text-xs text-accent-deep">/ 04 — {t("home.quiz.eyebrow")}</p>
              <h2 className="text-4xl leading-[1.1] font-black sm:text-6xl">
                <Hl text={t("home.quiz.title")} hl={t("home.quiz.titleHl")} className="text-outline" />
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                {t("home.quiz.text")}
              </p>
            </div>
            {ideasQ.loading ? <Skeleton className="h-80" /> : <IdeaFinder ideas={ideas} />}
          </div>
        </Container>
      </section>

      {/* ───────── Workshops ───────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            index="05"
            eyebrow={t("home.workshops.eyebrow")}
            title={t("home.workshops.title")}
            action={
              <ButtonLink to="/workshops" variant="ghost">
                {t("home.workshops.button")} <ArrowUpLeft className="size-4" />
              </ButtonLink>
            }
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {workshopsQ.loading
              ? [0, 1].map((i) => <Skeleton key={i} className="h-44" />)
              : workshopsQ.data?.map((w, i) => (
                  <Reveal key={w.id} delay={i * 0.1}>
                    <WorkshopCard workshop={w} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>

      {/* ───────── Custom project CTA ───────── */}
      <section className="pt-10">
        <Link to="/custom" className="group block overflow-hidden border-y-2 border-ink bg-accent py-6 text-paper sm:py-10">
          <div className="flex w-max animate-marquee [--marquee-duration:30s] group-hover:[animation-play-state:paused]">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
                {[...marquee, ...marquee, ...marquee].map((w, i) => (
                  <span key={i} className="flex items-center">
                    <span className={`px-6 font-display text-5xl font-black whitespace-nowrap sm:text-8xl ${i % 2 ? "text-outline" : ""}`}>{w}</span>
                    <span className="size-4 rounded-full bg-ink sm:size-6" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Link>
        <Container className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
            {t("home.cta.text")}
          </p>
          <ButtonLink to="/custom" variant="ink" className="shrink-0 py-4">
            {t("home.cta.button")} <ArrowUpLeft className="size-4" />
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
