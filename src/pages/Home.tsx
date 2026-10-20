import Instagram from "../components/InstagramIcon";
import { ArrowLeft, Compass, FileText, GraduationCap, PencilRuler } from "lucide-react";
import { motion } from "motion/react";
import Container from "../components/Container";
import ButtonLink from "../components/ButtonLink";
import SectionHeading from "../components/SectionHeading";
import Reveal from "../components/Reveal";
import HeroFile from "../components/HeroFile";
import InstagramCard from "../components/InstagramCard";
import IdeaCard from "../components/IdeaCard";
import IdeaFinder from "../components/IdeaFinder";
import WorkshopCard from "../components/WorkshopCard";
import Skeleton from "../components/Skeleton";
import { useAsync } from "../lib/useAsync";
import { getFeaturedIdeas, getIdeas, getInstagramPosts, getSiteInfo, getUpcomingWorkshops } from "../lib/api";

const services = [
  {
    icon: FileText,
    title: "أفكار جاهزة",
    text: "ملفات فرص مدروسة بأرقامها: رأس المال، الاسترداد، الموردين، وخطة الإطلاق.",
    to: "/ideas",
    cta: "تصفّح الأفكار",
  },
  {
    icon: PencilRuler,
    title: "مشروع مخصص",
    text: "بتحكيلنا ميزانيتك وظروفك، ومنبني فكرة وخطة من الصفر على مقاسك.",
    to: "/custom",
    cta: "اطلب مشروعك",
  },
  {
    icon: GraduationCap,
    title: "ورشات عملية",
    text: "جلسات قصيرة وتطبيقية بتختصر عليك سنين من التجربة والخطأ.",
    to: "/workshops",
    cta: "شوف الورشات",
  },
];

export default function Home() {
  const siteQ = useAsync(getSiteInfo);
  const postsQ = useAsync(getInstagramPosts);
  const featuredQ = useAsync(getFeaturedIdeas);
  const ideasQ = useAsync(getIdeas);
  const workshopsQ = useAsync(() => getUpcomingWorkshops(2));
  const site = siteQ.data;

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="ruled pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative grid items-center gap-14 pt-10 pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-28">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-semibold"
            >
              <span className="size-2 rounded-full bg-accent" />
              دفتر المستثمر الصغير
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[2.6rem] leading-[1.15] font-bold sm:text-6xl"
            >
              فكرتك الجاية
              <br />
              <span className="relative inline-block text-accent">
                مكتوبة بالأرقام
                <svg className="absolute -bottom-2 right-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none" aria-hidden>
                  <motion.path
                    d="M2 9 C 80 2, 200 2, 298 7"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  />
                </svg>
              </span>
              ، مش بالأحلام.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
            >
              {site?.about ?? " "}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <ButtonLink to="/ideas">
                تصفّح ملفات الفرص <ArrowLeft className="size-4" />
              </ButtonLink>
              <ButtonLink to="/custom" variant="ghost">
                اطلب مشروع مخصص
              </ButtonLink>
            </motion.div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t-2 border-ink pt-5">
              {[
                ["+40", "فكرة مدروسة"],
                ["+300", "متدرّب"],
                ["1:1", "متابعة شخصية"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd dir="ltr" className="text-right font-display text-2xl font-bold sm:text-3xl">{n}</dd>
                  <dd className="text-xs text-muted sm:text-sm">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="px-4 sm:px-8">
            <HeroFile />
          </div>
        </Container>
      </section>

      {/* ───────── Instagram shelf ───────── */}
      <section className="border-y-2 border-ink bg-paper-deep py-20">
        <Container>
          <SectionHeading
            index="01"
            eyebrow="من دفترنا على إنستغرام"
            title="آخر ما نشرناه"
            action={
              site && (
                <ButtonLink to={site.instagramUrl} external variant="ghost" className="py-2.5">
                  <Instagram className="size-4" /> <span dir="ltr">@{site.instagramHandle}</span>
                </ButtonLink>
              )
            }
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postsQ.loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/5]" />)
              : postsQ.data?.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.1}>
                    <InstagramCard post={p} index={i} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>

      {/* ───────── Services ───────── */}
      <section className="py-20">
        <Container>
          <SectionHeading index="02" eyebrow="كيف منساعدك" title="ثلاث طرق لتبدأ" />
          <div className="grid gap-5 md:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl border-2 border-ink bg-card p-6 transition-colors hover:bg-ink hover:text-paper">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent-deep transition-colors group-hover:bg-accent group-hover:text-paper">
                      <s.icon className="size-6" />
                    </span>
                    <span className="font-mono text-sm text-muted group-hover:text-paper/50">0{i + 1}</span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{s.title}</h3>
                  <p className="mb-6 leading-relaxed text-ink-soft group-hover:text-paper/75">{s.text}</p>
                  <ButtonLink to={s.to} variant="ghost" className="mt-auto self-start group-hover:border-paper group-hover:text-paper">
                    {s.cta} <ArrowLeft className="size-4" />
                  </ButtonLink>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Featured ideas ───────── */}
      <section className="py-12">
        <Container>
          <SectionHeading
            index="03"
            eyebrow="ملفات مختارة"
            title="فرص جاهزة للتنفيذ"
            action={
              <ButtonLink to="/ideas" variant="ghost" className="py-2.5">
                كل الأفكار <ArrowLeft className="size-4" />
              </ButtonLink>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredQ.loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)
              : featuredQ.data?.map((idea, i) => (
                  <Reveal key={idea.id} delay={i * 0.1}>
                    <IdeaCard idea={idea} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>

      {/* ───────── Idea finder ───────── */}
      <section className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.8fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="mb-3 flex items-center gap-3 text-sm font-medium text-accent">
                <span className="font-mono">04</span>
                <span className="h-px w-8 bg-accent" />
                اختبار سريع
              </p>
              <h2 className="text-3xl leading-tight font-bold sm:text-4xl">محتار من وين تبدأ؟</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                جاوب على 3 أسئلة، ومنطلعلك الملفات الأقرب لميزانيتك واهتمامك وخبرتك. أقل من دقيقة.
              </p>
              <Compass className="mt-8 hidden size-24 text-line lg:block" strokeWidth={1} />
            </div>
            {ideasQ.loading ? <Skeleton className="h-80" /> : <IdeaFinder ideas={ideasQ.data ?? []} />}
          </div>
        </Container>
      </section>

      {/* ───────── Workshops ───────── */}
      <section className="py-12">
        <Container>
          <SectionHeading
            index="05"
            eyebrow="الورشات القادمة"
            title="تعلّم قبل ما تبدأ"
            action={
              <ButtonLink to="/workshops" variant="ghost" className="py-2.5">
                كل الورشات <ArrowLeft className="size-4" />
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
      <section className="pt-16">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-paper sm:px-12 sm:py-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-paper) 1px, transparent 1px), linear-gradient(90deg, var(--color-paper) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="file-label mb-4 !text-paper/50">مشروع مخصص · من الصفر</p>
                  <h2 className="text-3xl leading-tight font-bold sm:text-5xl">
                    ما في فكرة بتناسبك؟ <span className="text-accent">منكتبلك وحدة.</span>
                  </h2>
                  <p className="mt-5 max-w-xl leading-relaxed text-paper/70">
                    احكيلنا عن ميزانيتك ومدينتك ووقتك، ومنرجعلك بملف فرصة كامل مبني على وضعك أنت.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                  <ButtonLink to="/custom" className="py-4 text-base">
                    ابدأ طلبك <ArrowLeft className="size-4" />
                  </ButtonLink>
                  <ButtonLink to="/contact" variant="light" className="py-4 text-base">
                    عندي سؤال أول
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
